// ===== GLOBALS =====
let allGames = [];
let allApps  = [];
let currentGame = null;
let currentTheme = 'default';
let showingFavorites = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
    setupNavigation();
    setupGameViewer();
    setupThemeChanger();
    setupTabCloaking();
    setupEjectButton();
    setupRefreshCacheBtn();
    setupRandomButton();
    setupFavoritesToggle();
    setupSearch();
    loadSavedTheme();
    loadSavedCloak();
    setupClock();
    startSessionTimer();
    updateStats();
    updateLeaderboard();
    updateRecentGamesList();
    updateNewlyAddedList();
    loadGamesAutomatically();
    loadAppsAutomatically();
});

// ===== NAVIGATION =====
function setupNavigation() {
    const proxyBtn = document.getElementById('proxyNavBtn');
    if (proxyBtn) {
        proxyBtn.addEventListener('click', () => {
            const url = window.PROXY_URL && window.PROXY_URL.trim();
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('Proxy not configured yet.\n\n1. Deploy proxy-server/ to Render.com\n2. Paste your URL into assets/proxy-config.js');
            }
        });
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (!btn.dataset.view) return; // skip proxy button
        btn.addEventListener('click', () => {
            showView(btn.dataset.view);
        });
    });
}

function showView(name) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    const view = document.getElementById('view-' + name);
    if (view) view.classList.add('active');
    const btn = document.querySelector(`.nav-btn[data-view="${name}"]`);
    if (btn) btn.classList.add('active');
    // Reset favorites filter when leaving games view
    if (name !== 'games' && showingFavorites) {
        setFavoritesFilter(false);
    }
}

// ===== GAME / APP LIST CACHE =====
// Caches the full game/app list for 24 hours to avoid GitHub API rate limits.
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCache(key) {
    try {
        const c = JSON.parse(localStorage.getItem(key));
        if (c && Date.now() - c.ts < CACHE_TTL) return c.data;
    } catch {}
    return null;
}

function setCache(key, data) {
    try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })); } catch {}
}

function clearGameCache() {
    localStorage.removeItem('cache_games');
    localStorage.removeItem('cache_apps');
}

// ===== GAME LOADING =====
async function loadGamesAutomatically() {
    const grid = document.getElementById('gamesGrid');

    // Use cache if fresh — avoids hammering the GitHub API
    const cached = getCache('cache_games');
    if (cached && cached.length > 0) {
        allGames = cached;
        displayCards(allGames, 'gamesGrid', 'noResults');
        updateGameCounter();
        detectNewGames(allGames);
        return;
    }

    grid.innerHTML = '<div class="loading">Loading games...</div>';

    const { username, repo } = getGitHubInfo();
    let result = [];

    if (username && repo) {
        result = await fetchFromGitHubAPI(username, repo, 'assets/games');
        if (!result.length) result = await fetchFromGitHubAPI(username, repo, 'assets');
    }

    if (!result.length) result = await fetchFromDirectoryListing('assets/games/');
    if (!result.length) result = await fetchFromDirectoryListing('assets/');

    if (result.length > 0) {
        allGames = result;
        setCache('cache_games', allGames);
        displayCards(allGames, 'gamesGrid', 'noResults');
        updateGameCounter();
        detectNewGames(allGames);
        return;
    }

    grid.innerHTML = '<div class="loading">No games found. Add HTML files or folders to <code>assets/games/</code>.</div>';
}

// Apps live in assets/apps/ — same file/folder rules as games, open in new tab.
async function loadAppsAutomatically() {
    const grid = document.getElementById('appsGrid');

    const cached = getCache('cache_apps');
    if (cached && cached.length > 0) {
        allApps = cached;
        displayCards(allApps, 'appsGrid', 'noAppsResults');
        document.getElementById('appsCounter').textContent = `${allApps.length} App${allApps.length !== 1 ? 's' : ''}`;
        return;
    }

    grid.innerHTML = '<div class="loading">Loading apps...</div>';

    const { username, repo } = getGitHubInfo();
    let result = [];

    if (username && repo) result = await fetchFromGitHubAPI(username, repo, 'assets/apps');
    if (!result.length) result = await fetchFromDirectoryListing('assets/apps/');

    if (result.length > 0) {
        allApps = result;
        setCache('cache_apps', allApps);
        displayCards(allApps, 'appsGrid', 'noAppsResults');
        document.getElementById('appsCounter').textContent = `${allApps.length} App${allApps.length !== 1 ? 's' : ''}`;
        return;
    }

    grid.innerHTML = '';
    document.getElementById('noAppsResults').style.display = 'block';
}


function getGitHubInfo() {
    const hostname = window.location.hostname;
    const parts = window.location.pathname.split('/').filter(p => p);
    let username = '', repo = '';
    if (hostname.includes('github.io') && parts.length >= 1) {
        username = hostname.split('.')[0];
        repo = parts[0];
    }
    return { username, repo };
}

async function fetchFromGitHubAPI(username, repo, path) {
    try {
        const url = `https://api.github.com/repos/${username}/${repo}/contents/${path}`;
        const response = await fetch(url);
        if (!response.ok) return [];
        const files = await response.json();
        const basePath = path + '/';

        // Single HTML files — straightforward
        const singles = files
            .filter(f => f.type === 'file' && f.name.endsWith('.html'))
            .map(f => ({ filename: f.name, displayName: formatGameName(f.name), basePath }));

        // Folders — look inside each one in parallel to find the real entry file
        const folderResults = await Promise.all(
            files.filter(f => f.type === 'dir').map(async f => {
                const entry = await resolveGitHubFolderEntry(username, repo, path + '/' + f.name, f.name);
                if (!entry) return null;
                const displayName = formatGameName(f.name);
                if (entry.startsWith('__js__:')) {
                    const jsFile = entry.slice(7);
                    return { filename: f.name + '/' + jsFile, displayName, basePath, jsEntry: jsFile, folderRelPath: basePath + f.name + '/' };
                }
                return { filename: f.name + '/' + entry, displayName, basePath };
            })
        );

        return [...singles, ...folderResults.filter(Boolean)];
    } catch { return []; }
}

// Given a folder in the GitHub repo, find the best runnable entry point.
// 1) HTML files in the folder root (index.html > main.html > game.html > app.html > name-match > first)
// 2) HTML files in common build subdirs (Site, dist, build, public, www, out, _site)
// 3) JS entry file — returns "__js__:filename" so the caller can generate a wrapper
// Returns null if nothing runnable is found.
async function resolveGitHubFolderEntry(username, repo, folderPath, folderName) {
    const HTML_PRIORITY = ['index.html', 'main.html', 'game.html', 'app.html'];
    const SUBDIR_PRIORITY = ['Site', 'site', 'dist', 'build', 'public', 'www', 'out', '_site'];
    const JS_PRIORITY = ['index.mjs', 'index.js', 'main.mjs', 'main.js', 'app.mjs', 'app.js'];
    try {
        const url = `https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`;
        const resp = await fetch(url);
        if (!resp.ok) return 'index.html';
        const files = await resp.json();

        // 1) HTML in root
        const htmlFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.html')).map(f => f.name);
        if (htmlFiles.length) {
            for (const p of HTML_PRIORITY) if (htmlFiles.includes(p)) return p;
            const match = htmlFiles.find(f => f.replace('.html', '').toLowerCase() === folderName.toLowerCase());
            return match || htmlFiles[0];
        }

        // 2) HTML in subdirectories
        const subdirs = files.filter(f => f.type === 'dir').map(f => f.name);
        const checkOrder = [...SUBDIR_PRIORITY.filter(s => subdirs.includes(s)), ...subdirs.filter(s => !SUBDIR_PRIORITY.includes(s))];
        for (const subdir of checkOrder) {
            try {
                const subResp = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${folderPath}/${subdir}`);
                if (!subResp.ok) continue;
                const subFiles = await subResp.json();
                const subHtml = subFiles.filter(f => f.type === 'file' && f.name.endsWith('.html')).map(f => f.name);
                if (subHtml.length) {
                    for (const p of HTML_PRIORITY) if (subHtml.includes(p)) return `${subdir}/${p}`;
                    return `${subdir}/${subHtml[0]}`;
                }
            } catch { /* skip inaccessible subdir */ }
        }

        // 3) JS fallback — caller will generate a blob wrapper
        const jsFiles = files.filter(f => f.type === 'file' && (f.name.endsWith('.js') || f.name.endsWith('.mjs'))).map(f => f.name);
        if (jsFiles.length) {
            for (const p of JS_PRIORITY) if (jsFiles.includes(p)) return `__js__:${p}`;
            return `__js__:${jsFiles[0]}`;
        }

        return null;
    } catch { return 'index.html'; }
}

async function fetchFromDirectoryListing(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return [];
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const singles = [];
        const folderNames = [];

        doc.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (href.endsWith('.html')) {
                const filename = href.split('/').pop().split('?')[0];
                singles.push({ filename, displayName: formatGameName(filename), basePath: path });
            } else if (href.endsWith('/') && href !== '../' && href !== './' && !href.startsWith('?')) {
                const folderName = href.replace(/\/$/, '').split('/').pop();
                if (folderName) folderNames.push(folderName);
            }
        });

        // Resolve each folder's entry file in parallel
        const folderResults = await Promise.all(
            folderNames.map(async folderName => {
                const entry = await resolveDirectoryFolderEntry(path + folderName + '/', folderName);
                if (!entry) return null;
                const displayName = formatGameName(folderName);
                if (entry.startsWith('__js__:')) {
                    const jsFile = entry.slice(7);
                    return { filename: folderName + '/' + jsFile, displayName, basePath: path, jsEntry: jsFile, folderRelPath: path + folderName + '/' };
                }
                return { filename: folderName + '/' + entry, displayName, basePath: path };
            })
        );

        return [...singles, ...folderResults.filter(Boolean)];
    } catch { return []; }
}

// Given a folder URL from a directory listing, find the best runnable entry point.
// Same 3-tier logic as resolveGitHubFolderEntry (HTML root → subdir HTML → JS fallback).
async function resolveDirectoryFolderEntry(folderUrl, folderName) {
    const HTML_PRIORITY = ['index.html', 'main.html', 'game.html', 'app.html'];
    const SUBDIR_PRIORITY = ['Site', 'site', 'dist', 'build', 'public', 'www', 'out', '_site'];
    const JS_PRIORITY = ['index.mjs', 'index.js', 'main.mjs', 'main.js', 'app.mjs', 'app.js'];
    try {
        const resp = await fetch(folderUrl);
        if (!resp.ok) return 'index.html';
        const text = await resp.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const links = [...doc.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(Boolean);

        // 1) HTML in root
        const htmlFiles = links.filter(h => h.endsWith('.html')).map(h => h.split('/').pop().split('?')[0]);
        if (htmlFiles.length) {
            for (const p of HTML_PRIORITY) if (htmlFiles.includes(p)) return p;
            const match = htmlFiles.find(f => f.replace('.html', '').toLowerCase() === folderName.toLowerCase());
            return match || htmlFiles[0];
        }

        // 2) HTML in subdirectories
        const subdirNames = links
            .filter(h => h.endsWith('/') && h !== '../' && h !== './' && !h.startsWith('?'))
            .map(h => h.replace(/\/$/, '').split('/').pop()).filter(Boolean);
        const checkOrder = [...SUBDIR_PRIORITY.filter(s => subdirNames.includes(s)), ...subdirNames.filter(s => !SUBDIR_PRIORITY.includes(s))];
        for (const subdir of checkOrder) {
            try {
                const subResp = await fetch(folderUrl + subdir + '/');
                if (!subResp.ok) continue;
                const subText = await subResp.text();
                const subDoc = new DOMParser().parseFromString(subText, 'text/html');
                const subHtml = [...subDoc.querySelectorAll('a')]
                    .map(a => a.getAttribute('href')).filter(h => h && h.endsWith('.html'))
                    .map(h => h.split('/').pop().split('?')[0]);
                if (subHtml.length) {
                    for (const p of HTML_PRIORITY) if (subHtml.includes(p)) return `${subdir}/${p}`;
                    return `${subdir}/${subHtml[0]}`;
                }
            } catch { /* skip */ }
        }

        // 3) JS fallback
        const jsFiles = links.filter(h => h.endsWith('.js') || h.endsWith('.mjs')).map(h => h.split('/').pop().split('?')[0]);
        if (jsFiles.length) {
            for (const p of JS_PRIORITY) if (jsFiles.includes(p)) return `__js__:${p}`;
            return `__js__:${jsFiles[0]}`;
        }

        return null;
    } catch { return 'index.html'; }
}

// ===== FORMAT NAME =====
function formatGameName(filename) {
    let name = filename.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    name = name.replace(/[_-]/g, ' ');
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ===== IMAGE HELPERS =====
function getHashColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0;
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 55%, 38%)`;
}

// Fetch a relevant image from Wikipedia's search API.
// Uses the generator=search approach — one request that searches like a real
// search engine and returns the page image for the top result.
// Results cached in localStorage (key 'wikisrch_') so each game is only ever
// looked up once across page refreshes.
async function fetchGameImage(displayName) {
    const key = 'wikisrch_' + displayName;
    const cached = localStorage.getItem(key);
    if (cached === 'none') return null;
    if (cached) return cached;

    const terms = [
        displayName + ' video game',
        displayName + ' game',
        displayName
    ];

    for (const term of terms) {
        try {
            const params = new URLSearchParams({
                action: 'query',
                generator: 'search',
                gsrsearch: term,
                gsrlimit: '1',
                prop: 'pageimages',
                pithumbsize: '400',
                format: 'json',
                origin: '*'
            });
            const resp = await fetch(`https://en.wikipedia.org/w/api.php?${params}`);
            if (!resp.ok) continue;
            const data = await resp.json();
            const pages = data.query?.pages;
            if (!pages) continue;
            const page = Object.values(pages)[0];
            if (page?.thumbnail?.source) {
                localStorage.setItem(key, page.thumbnail.source);
                return page.thumbnail.source;
            }
        } catch {}
    }

    localStorage.setItem(key, 'none');
    return null;
}

// IntersectionObserver — loads images lazily as cards scroll into view
let _imgObserver = null;
function getImageObserver() {
    if (_imgObserver) return _imgObserver;
    _imgObserver = new IntersectionObserver(async (entries) => {
        for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            _imgObserver.unobserve(entry.target);
            const card = entry.target;
            const name = card.dataset.gameName;
            const imgDiv = card.querySelector('.card-img');
            if (!name || !imgDiv) continue;
            // Check local thumbnail first
            const basename = card.dataset.basename;
            const tryWiki = async () => {
                const url = await fetchGameImage(name);
                if (url) imgDiv.style.backgroundImage = `url('${url}')`;
            };
            if (basename) {
                const localUrl = `assets/thumbnails/${basename}.jpg`;
                const test = new Image();
                test.onload = () => { imgDiv.style.backgroundImage = `url('${localUrl}')`; };
                test.onerror = tryWiki;
                test.src = localUrl;
            } else {
                await tryWiki();
            }
        }
    }, { rootMargin: '200px 0px' });
    return _imgObserver;
}

// ===== THUMBNAILS =====
// Tries assets/thumbnails/<displayName>.(png|jpg|jpeg|webp) in order.
// If found, sets the card's background image; otherwise the hash color stays.
function loadThumbnail(displayName, card) {
    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    let i = 0;
    function tryNext() {
        if (i >= exts.length) return;
        const img = new Image();
        const src = `assets/thumbnails/${displayName}.${exts[i]}`;
        img.onload = () => {
            card.style.backgroundImage = `url("${src}")`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.classList.add('has-thumbnail');
        };
        img.onerror = () => { i++; tryNext(); };
        img.src = src;
    }
    tryNext();
}

// ===== DISPLAY CARDS =====
function displayCards(items, gridId = 'gamesGrid', noResultsId = 'noResults') {
    const grid = document.getElementById(gridId);
    const noResults = document.getElementById(noResultsId);

    if (!items.length) {
        grid.innerHTML = '';
        if (noResults) noResults.style.display = 'block';
        return;
    }
    if (noResults) noResults.style.display = 'none';
    grid.innerHTML = '';

    items.forEach((item, index) => {
        const card = document.createElement('button');
        card.className = 'game-card fade-in';
        card.style.animationDelay = `${index * 0.03}s`;
        card.style.backgroundColor = getHashColor(item.displayName);

        // Favorite star button (top-right corner)
        const starBtn = document.createElement('button');
        starBtn.className = 'card-star' + (isGameFavorited(item.filename) ? ' active' : '');
        starBtn.title = 'Favorite';
        starBtn.textContent = '⭐';
        starBtn.addEventListener('click', e => {
            e.stopPropagation();
            toggleFavorite(item.filename);
            starBtn.classList.toggle('active');
        });

        // Game name — always visible, centered
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = item.displayName;

        card.appendChild(starBtn);
        card.appendChild(nameDiv);
        card.addEventListener('click', () => launchGameViewer(item));
        grid.appendChild(card);
        loadThumbnail(item.displayName, card);
    });
}

// ===== GAME VIEWER =====
function launchGameViewer(game) {
    if (!game || !game.filename) return;
    // Look up the full game object (recent/newly-added lists only store filename+displayName)
    const full = [...(allGames || []), ...(allApps || [])].find(g => g.filename === game.filename);
    if (full) game = full;

    currentGame = { filename: game.filename, displayName: game.displayName };

    const base = game.basePath || 'assets/';

    // Build the source URL — JS-only games get a blob wrapper with correct base href
    let src;
    if (game.jsEntry && game.folderRelPath) {
        const pageBase = window.location.href.replace(/\/[^/]*$/, '/');
        const absFolder = pageBase + game.folderRelPath;
        const wrapper = `<!DOCTYPE html><html><head><meta charset="utf-8">` +
            `<base href="${absFolder}">` +
            `<style>*{margin:0;padding:0}body{background:#000;width:100vw;height:100vh;overflow:hidden}canvas{display:block;max-width:100%;max-height:100%}</style>` +
            `</head><body><script type="module" src="${game.jsEntry}"><\/script></body></html>`;
        src = URL.createObjectURL(new Blob([wrapper], { type: 'text/html' }));
    } else {
        src = base + game.filename;
    }

    // Apps open in a new tab — no toolbar since it's a bare file
    if (game.basePath && game.basePath.includes('apps')) {
        incrementPlayCount(game.filename);
        addRecentGame(game);
        updateStats();
        updateLeaderboard();
        updateRecentGamesList();
        window.open(src, '_blank');
        return;
    }

    // Games open in the in-page iframe viewer.
    // Kill any currently running game first so its requests stop before the new one starts.
    const frame = document.getElementById('gameFrame');
    frame.src = '';
    document.getElementById('viewerGameTitle').textContent = game.displayName;
    document.getElementById('gameViewer').classList.add('active');
    // Small pause lets the browser fully unload the old game before the new one fetches its assets.
    setTimeout(() => { frame.src = src; }, 150);

    incrementPlayCount(game.filename);
    addRecentGame(game);
    window._gameStartTime = Date.now();
    updateStats();
    updateLeaderboard();
    updateRecentGamesList();
}

function closeGameViewer() {
    document.getElementById('gameViewer').classList.remove('active');
    document.getElementById('gameFrame').src = '';
    if (window._gameStartTime) {
        const secs = Math.floor((Date.now() - window._gameStartTime) / 1000);
        const prev = parseInt(localStorage.getItem('totalGameSecs') || '0');
        localStorage.setItem('totalGameSecs', (prev + secs).toString());
        window._gameStartTime = null;
    }
    updateStats();
    updateLeaderboard();
}

function setupGameViewer() {
    document.getElementById('exitViewerBtn').addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        closeGameViewer();
    });

    document.getElementById('fsBtn').addEventListener('click', e => {
        e.preventDefault();
        const viewer = document.getElementById('gameViewer');
        if (!document.fullscreenElement) {
            viewer.requestFullscreen().catch(err => console.log('Fullscreen failed:', err));
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('keydown', e => {
        const viewer = document.getElementById('gameViewer');
        if (viewer.classList.contains('active') && e.key === 'Escape' && !document.fullscreenElement) {
            closeGameViewer();
        }
    });
}

// ===== SEARCH =====
function setupSearch() {
    const bar = document.getElementById('searchBar');
    if (!bar) return;
    bar.addEventListener('input', e => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            displayCards(showingFavorites ? allGames.filter(g => isGameFavorited(g.filename)) : allGames, 'gamesGrid', 'noResults');
        } else {
            displayCards(allGames.filter(g =>
                g.displayName.toLowerCase().includes(term) || g.filename.toLowerCase().includes(term)
            ), 'gamesGrid', 'noResults');
        }
    });
    bar.addEventListener('keydown', e => {
        if (e.key === 'Escape') { bar.value = ''; displayCards(allGames, 'gamesGrid', 'noResults'); bar.blur(); }
    });
}


// ===== FAVORITES =====
function setupFavoritesToggle() {
    // Home page button — navigates to games view and activates filter
    const homeBtn = document.getElementById('favoritesToggle');
    if (homeBtn) {
        homeBtn.addEventListener('click', () => {
            showView('games');
            setFavoritesFilter(true);
        });
    }

    // All Games view filter button
    const filterBtn = document.getElementById('favFilterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', () => {
            setFavoritesFilter(!showingFavorites);
        });
    }
}

function setFavoritesFilter(on) {
    showingFavorites = on;
    const filterBtn = document.getElementById('favFilterBtn');
    if (filterBtn) {
        filterBtn.classList.toggle('active', on);
        filterBtn.textContent = on ? '🎮 All Games' : '⭐ Favorites';
    }
    if (on) {
        displayCards(allGames.filter(g => isGameFavorited(g.filename)), 'gamesGrid', 'noResults');
    } else {
        displayCards(allGames, 'gamesGrid', 'noResults');
    }
}

// ===== RANDOM =====
function setupRandomButton() {
    const btn = document.getElementById('randomBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const pool = allGames.length ? allGames : allApps;
        if (!pool.length) { alert('Games are still loading, please wait!'); return; }
        const game = pool[Math.floor(Math.random() * pool.length)];
        currentGame = { filename: game.filename, displayName: game.displayName };
        launchGameViewer(currentGame);
    });
}

// ===== REFRESH CACHE =====
function setupRefreshCacheBtn() {
    const btn = document.getElementById('refreshCacheBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        clearGameCache();
        btn.textContent = 'Refreshing...';
        btn.disabled = true;
        Promise.all([loadGamesAutomatically(), loadAppsAutomatically()]).then(() => {
            btn.textContent = 'Done!';
            setTimeout(() => { btn.textContent = 'Refresh Game List'; btn.disabled = false; }, 1500);
        });
    });
}

// ===== EJECT =====
function setupEjectButton() {
    document.getElementById('ejectButton').addEventListener('click', () => {
        window.close();
        if (!window.closed) window.location.href = 'about:blank';
    });
}

// ===== COUNTER =====
function updateGameCounter() {
    const total = allGames.length;
    const el = document.getElementById('gameCounter');
    if (el) el.textContent = `${total} Game${total !== 1 ? 's' : ''} Available`;
    const el2 = document.getElementById('gameCounter2');
    if (el2) el2.textContent = `${total} Game${total !== 1 ? 's' : ''}`;
}

// ===== THEME =====
function setupThemeChanger() {
    const themeButtons = document.querySelectorAll('.theme-btn');
    const customColorPanel = document.getElementById('customColorPanel');

    themeButtons.forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            const theme = btn.getAttribute('data-theme');
            applyTheme(theme);
            themeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            customColorPanel.style.display = (theme === 'custom') ? 'block' : 'none';
        });
    });

    document.getElementById('bgColorPicker').addEventListener('input', updateCustomTheme);
    document.getElementById('bgShadePicker').addEventListener('input', updateCustomTheme);
    document.getElementById('textColorPicker').addEventListener('input', updateCustomTheme);
    document.getElementById('fontPicker').addEventListener('change', updateCustomFont);
}

function applyTheme(theme) {
    currentTheme = theme;
    const body = document.body;
    const themeClasses = [
        'theme-rainbow', 'theme-galaxy', 'theme-custom', 'theme-neon-cyberpunk',
        'theme-dark-mode', 'theme-retro-arcade', 'theme-forest-fantasy', 'theme-fire-lava',
        'theme-ice-kingdom', 'theme-ocean-depths', 'theme-desert-storm', 'theme-glitch-mode',
        'theme-synthwave', 'theme-blood-moon', 'theme-minimal-white', 'theme-matrix',
        'theme-galaxy-rainbow', 'theme-steampunk', 'theme-cartoon-pop', 'theme-shadow-realm',
        'theme-snowy-night'
    ];
    themeClasses.forEach(cls => body.classList.remove(cls));
    if (theme !== 'default') body.classList.add(`theme-${theme}`);
    localStorage.setItem('selectedTheme', theme);

    if (theme === 'custom') {
        document.getElementById('bgColorPicker').value = localStorage.getItem('customBgColor') || '#667eea';
        document.getElementById('bgShadePicker').value = localStorage.getItem('customBgShade') || '#764ba2';
        document.getElementById('textColorPicker').value = localStorage.getItem('customTextColor') || '#667eea';
        const savedFont = localStorage.getItem('customFont');
        if (savedFont) document.getElementById('fontPicker').value = savedFont;
        updateCustomTheme();
        updateCustomFont();
    }
}

function updateCustomTheme() {
    const bg = document.getElementById('bgColorPicker').value;
    const shade = document.getElementById('bgShadePicker').value;
    const text = document.getElementById('textColorPicker').value;
    document.body.style.setProperty('--custom-bg-gradient', `linear-gradient(135deg, ${bg} 0%, ${shade} 100%)`);
    document.body.style.setProperty('--custom-text-color', text);
    localStorage.setItem('customBgColor', bg);
    localStorage.setItem('customBgShade', shade);
    localStorage.setItem('customTextColor', text);
}

function updateCustomFont() {
    const font = document.getElementById('fontPicker').value;
    document.body.style.fontFamily = font;
    localStorage.setItem('customFont', font);
}

function loadSavedTheme() {
    const saved = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(saved);
    document.querySelectorAll('.theme-btn').forEach(btn => {
        if (btn.getAttribute('data-theme') === saved) btn.classList.add('active');
    });
    if (saved === 'custom') {
        const panel = document.getElementById('customColorPanel');
        if (panel) panel.style.display = 'block';
    }
}

// ===== TAB CLOAKING =====
const cloakData = {
    'none':             { title: 'Cool Science Games', favicon: '' },
    'schoology':        { title: 'Home | Schoology', favicon: 'https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/favicon.ico' },
    'google-classroom': { title: 'Home', favicon: 'https://ssl.gstatic.com/classroom/favicon.png' },
    'zoom':             { title: 'Zoom', favicon: 'https://zoom.us/favicon.ico' },
    'google':           { title: 'Google', favicon: 'https://www.google.com/favicon.ico' },
    'youtube':          { title: 'YouTube', favicon: 'https://www.youtube.com/favicon.ico' }
};

function setupTabCloaking() {
    document.querySelectorAll('.cloak-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const cloak = btn.getAttribute('data-cloak');
            applyCloaking(cloak);
            document.querySelectorAll('.cloak-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function applyCloaking(cloak) {
    const data = cloakData[cloak];
    document.title = data.title;
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; document.head.appendChild(favicon); }
    favicon.href = data.favicon || '';
    localStorage.setItem('selectedCloak', cloak);
}

function loadSavedCloak() {
    const saved = localStorage.getItem('selectedCloak') || 'none';
    applyCloaking(saved);
    document.querySelectorAll('.cloak-btn').forEach(btn => {
        if (btn.getAttribute('data-cloak') === saved) btn.classList.add('active');
    });
}

// ===== DATA STORAGE =====
function getGameData(filename) {
    const data = localStorage.getItem(`game_${filename}`);
    return data ? JSON.parse(data) : { playCount: 0, liked: false, disliked: false, favorited: false };
}
function saveGameData(filename, data) {
    localStorage.setItem(`game_${filename}`, JSON.stringify(data));
}
function incrementPlayCount(filename) {
    const data = getGameData(filename);
    data.playCount++;
    saveGameData(filename, data);
    const total = parseInt(localStorage.getItem('totalGamesPlayed') || '0');
    localStorage.setItem('totalGamesPlayed', (total + 1).toString());
}
function toggleFavorite(filename) {
    const data = getGameData(filename);
    data.favorited = !data.favorited;
    saveGameData(filename, data);
}
function isGameFavorited(filename) {
    return getGameData(filename).favorited;
}
function getGlobalPlayCount(filename) {
    return getGameData(filename).playCount || 0;
}

// ===== LEADERBOARD =====
function toggleLeaderboard() {
    const list = document.getElementById('leaderboardList');
    const arrow = document.getElementById('lbArrow');
    list.classList.toggle('expanded');
    arrow.textContent = list.classList.contains('expanded') ? '▲' : '▼';
}

function updateLeaderboard() {
    const all = [...allGames, ...allApps];
    const withPlays = all.map(g => ({
        name: g.displayName,
        filename: g.filename,
        plays: getGlobalPlayCount(g.filename)
    })).sort((a, b) => b.plays - a.plays).slice(0, 20);

    const list = document.getElementById('leaderboardList');
    if (!list) return;
    if (!withPlays.length || withPlays.every(g => g.plays === 0)) {
        list.innerHTML = '<div style="padding:10px;color:#999;font-size:.85rem;text-align:center">No games played yet!</div>';
        return;
    }
    list.innerHTML = withPlays.filter(g => g.plays > 0).map((g, i) => `
        <div class="leaderboard-item">
            <span class="rank">#${i + 1}</span>
            <span class="name">${g.name}</span>
            <span class="plays">${g.plays}</span>
        </div>`).join('');
}

// ===== STATS =====
function updateStats() {
    const played = parseInt(localStorage.getItem('totalGamesPlayed') || '0');
    const el = document.getElementById('gamesPlayedStat');
    if (el) el.textContent = '🎮 Played: ' + played;

    const savedSecs = parseInt(localStorage.getItem('totalGameSecs') || '0');
    const liveGameSecs = window._gameStartTime ? Math.floor((Date.now() - window._gameStartTime) / 1000) : 0;
    const totalSecs = savedSecs + liveGameSecs;
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    const timeStr = hrs > 0 ? `${hrs}h ${mins}m` : mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
    const tel = document.getElementById('timeStat');
    if (tel) tel.textContent = '⏱ ' + timeStr;
}

function startSessionTimer() {
    setInterval(updateStats, 1000);
}

// ===== RECENT GAMES =====
function addRecentGame(game) {
    let recent = JSON.parse(localStorage.getItem('recentGames') || '[]');
    recent = recent.filter(g => g.filename !== game.filename);
    recent.unshift({ filename: game.filename, displayName: game.displayName });
    if (recent.length > 8) recent = recent.slice(0, 8);
    localStorage.setItem('recentGames', JSON.stringify(recent));
    updateRecentGamesList();
}

function updateRecentGamesList() {
    const recent = JSON.parse(localStorage.getItem('recentGames') || '[]');
    const el = document.getElementById('recentGamesList');
    if (!el) return;
    if (!recent.length) {
        el.innerHTML = '<p class="empty-msg">No recent games yet</p>';
        return;
    }
    el.innerHTML = recent.map(g => `
        <button class="home-list-btn" onclick="launchGameViewer({filename:'${g.filename}',displayName:'${g.displayName.replace(/'/g, "\\'")}' })">
            🎮 ${g.displayName}
        </button>`).join('');
}

// ===== RECENTLY ADDED =====
function detectNewGames(games) {
    const knownRaw = localStorage.getItem('knownGames');
    const newlyAdded = JSON.parse(localStorage.getItem('newlyAddedGames') || '[]');
    localStorage.setItem('knownGames', JSON.stringify(games.map(g => g.filename)));
    if (!knownRaw) return;
    const known = new Set(JSON.parse(knownRaw));
    const fresh = games.filter(g => !known.has(g.filename));
    if (!fresh.length) return;
    const existing = new Set(newlyAdded.map(g => g.filename));
    fresh.forEach(g => { if (!existing.has(g.filename)) newlyAdded.unshift({ filename: g.filename, displayName: g.displayName }); });
    localStorage.setItem('newlyAddedGames', JSON.stringify(newlyAdded));
    updateNewlyAddedList();
}

function updateNewlyAddedList() {
    const list = JSON.parse(localStorage.getItem('newlyAddedGames') || '[]');
    const el = document.getElementById('newlyAddedList');
    if (!el) return;
    if (!list.length) {
        el.innerHTML = '<p class="empty-msg">No new games detected yet</p>';
        return;
    }
    el.innerHTML = list.map(g => `
        <button class="home-list-btn" onclick="launchGameViewer({filename:'${g.filename}',displayName:'${g.displayName.replace(/'/g, "\\'")}' })">
            🆕 Added: ${g.displayName}
        </button>`).join('');
}

// ===== CLOCK =====
function setupClock() {
    const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    function tick() {
        const n = new Date();
        const dateEl  = document.getElementById('date');
        const clockEl = document.getElementById('clock');
        if (dateEl)  dateEl.textContent  = `${DAYS[n.getDay()]}, ${MONTHS[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()}`;
        if (clockEl) clockEl.textContent = `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`;
    }
    tick();
    setInterval(tick, 1000);
}
