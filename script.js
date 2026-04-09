// ===== GLOBALS =====
let allGames = [];
let currentGame = null;
let currentTheme = 'default';
let showingFavorites = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    setupGameViewer();
    setupThemeChanger();
    setupTabCloaking();
    setupEjectButton();
    setupRandomButton();
    setupFavoritesToggle();
    setupSearch();
    setupRefreshCacheBtn();
    loadSavedTheme();
    loadSavedCloak();
    loadGamesAutomatically();
});

// ===== NAVIGATION (proxy + settings modal) =====
function setupNavigation() {
    const proxyBtn = document.getElementById('proxyNavBtn');
    if (proxyBtn) {
        proxyBtn.addEventListener('click', () => {
            const url = (window.PROXY_URL || '').trim();
            if (url) {
                window.open(url, '_blank');
            } else {
                alert('Proxy not configured.\nPaste your URL into assets/proxy-config.js');
            }
        });
    }

    const settingsBtn  = document.getElementById('settingsBtn');
    const modal        = document.getElementById('settingsModal');
    const closeBtn     = document.getElementById('closeSettingsBtn');
    if (settingsBtn) settingsBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    if (closeBtn)    closeBtn.addEventListener('click',    () => { modal.style.display = 'none'; });
    if (modal) modal.addEventListener('click', e => { if (e.target === modal) modal.style.display = 'none'; });
}

// ===== CACHE (24 hr) =====
const CACHE_TTL = 24 * 60 * 60 * 1000;
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
}

// ===== GAME LOADING =====
async function loadGamesAutomatically() {
    const grid = document.getElementById('gamesGrid');

    const cached = getCache('cache_games');
    if (cached && cached.length > 0) {
        allGames = cached;
        displayCards(allGames);
        updateGameCounter();
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
        displayCards(allGames);
        updateGameCounter();
    } else {
        grid.innerHTML = '<div class="loading">No games found. Add HTML files or folders to <code>assets/games/</code>.</div>';
    }
}

function getGitHubInfo() {
    const hostname = window.location.hostname;
    const parts = window.location.pathname.split('/').filter(p => p);
    if (hostname.includes('github.io') && parts.length >= 1) {
        return { username: hostname.split('.')[0], repo: parts[0] };
    }
    return { username: '', repo: '' };
}

async function fetchFromGitHubAPI(username, repo, path) {
    try {
        const resp = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`);
        if (!resp.ok) return [];
        const files = await resp.json();
        const basePath = path + '/';

        const singles = files
            .filter(f => f.type === 'file' && f.name.endsWith('.html'))
            .map(f => ({ filename: f.name, displayName: formatName(f.name), basePath }));

        const folders = await Promise.all(
            files.filter(f => f.type === 'dir').map(async f => {
                const entry = await resolveGitHubEntry(username, repo, path + '/' + f.name, f.name);
                if (!entry) return null;
                return { filename: f.name + '/' + entry, displayName: formatName(f.name), basePath };
            })
        );

        return [...singles, ...folders.filter(Boolean)];
    } catch { return []; }
}

async function resolveGitHubEntry(username, repo, folderPath, folderName) {
    const PRIORITY = ['index.html', 'main.html', 'game.html', 'app.html'];
    try {
        const resp = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`);
        if (!resp.ok) return 'index.html';
        const files = await resp.json();
        const html = files.filter(f => f.type === 'file' && f.name.endsWith('.html')).map(f => f.name);
        if (!html.length) return null;
        for (const p of PRIORITY) if (html.includes(p)) return p;
        return html.find(f => f.replace('.html','').toLowerCase() === folderName.toLowerCase()) || html[0];
    } catch { return 'index.html'; }
}

async function fetchFromDirectoryListing(path) {
    try {
        const resp = await fetch(path);
        if (!resp.ok) return [];
        const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
        const singles = [], folderNames = [];
        doc.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            if (href.endsWith('.html')) {
                singles.push({ filename: href.split('/').pop().split('?')[0], displayName: formatName(href), basePath: path });
            } else if (href.endsWith('/') && href !== '../' && href !== './' && !href.startsWith('?')) {
                const n = href.replace(/\/$/, '').split('/').pop();
                if (n) folderNames.push(n);
            }
        });
        const folders = await Promise.all(folderNames.map(async n => {
            const entry = await resolveDirectoryEntry(path + n + '/', n);
            if (!entry) return null;
            return { filename: n + '/' + entry, displayName: formatName(n), basePath: path };
        }));
        return [...singles, ...folders.filter(Boolean)];
    } catch { return []; }
}

async function resolveDirectoryEntry(folderUrl, folderName) {
    const PRIORITY = ['index.html', 'main.html', 'game.html', 'app.html'];
    try {
        const resp = await fetch(folderUrl);
        if (!resp.ok) return 'index.html';
        const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
        const html = [...doc.querySelectorAll('a')]
            .map(a => a.getAttribute('href')).filter(h => h && h.endsWith('.html'))
            .map(h => h.split('/').pop().split('?')[0]);
        if (!html.length) return null;
        for (const p of PRIORITY) if (html.includes(p)) return p;
        return html.find(f => f.replace('.html','').toLowerCase() === folderName.toLowerCase()) || html[0];
    } catch { return 'index.html'; }
}

function formatName(filename) {
    let name = filename.replace(/\/index\.html$/, '').replace(/\.html$/, '').split('/').pop();
    return name.replace(/[_-]/g, ' ').split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ===== DISPLAY CARDS =====
function displayCards(items) {
    const grid = document.getElementById('gamesGrid');
    const noResults = document.getElementById('noResults');
    grid.innerHTML = '';
    if (!items.length) {
        if (noResults) noResults.style.display = 'block';
        return;
    }
    if (noResults) noResults.style.display = 'none';

    items.forEach((item, i) => {
        const card = document.createElement('button');
        card.className = 'game-card fade-in';
        card.style.animationDelay = `${i * 0.03}s`;
        card.style.backgroundColor = hashColor(item.displayName);

        const star = document.createElement('button');
        star.className = 'card-star' + (isFavorited(item.filename) ? ' active' : '');
        star.textContent = '⭐';
        star.addEventListener('click', e => {
            e.stopPropagation();
            toggleFavorite(item.filename);
            star.classList.toggle('active');
        });

        const label = document.createElement('div');
        label.className = 'card-name';
        label.textContent = item.displayName;

        card.appendChild(star);
        card.appendChild(label);
        card.addEventListener('click', () => launchGame(item));
        grid.appendChild(card);
        loadThumbnail(item.displayName, card);
    });
}

function hashColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = ((h << 5) - h) + name.charCodeAt(i) | 0;
    return `hsl(${Math.abs(h) % 360}, 55%, 38%)`;
}

function loadThumbnail(displayName, card) {
    const exts = ['png', 'jpg', 'jpeg', 'webp'];
    let i = 0;
    function next() {
        if (i >= exts.length) return;
        const img = new Image();
        img.onload = () => {
            card.style.backgroundImage = `url("assets/thumbnails/${displayName}.${exts[i]}")`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.classList.add('has-thumbnail');
        };
        img.onerror = () => { i++; next(); };
        img.src = `assets/thumbnails/${displayName}.${exts[i]}`;
    }
    next();
}

function updateGameCounter() {
    const el = document.getElementById('gameCounter');
    if (el) el.textContent = `${allGames.length} Game${allGames.length !== 1 ? 's' : ''}`;
}

// ===== GAME VIEWER =====
function launchGame(game) {
    if (!game || !game.filename) return;
    currentGame = game;
    const src = (game.basePath || 'assets/') + game.filename;
    const frame = document.getElementById('gameFrame');
    frame.src = '';
    document.getElementById('viewerGameTitle').textContent = game.displayName;
    document.getElementById('gameViewer').classList.add('active');
    setTimeout(() => { frame.src = src; }, 150);
}

function closeGameViewer() {
    document.getElementById('gameViewer').classList.remove('active');
    document.getElementById('gameFrame').src = '';
}

function setupGameViewer() {
    document.getElementById('exitViewerBtn').addEventListener('click', closeGameViewer);
    document.getElementById('fsBtn').addEventListener('click', () => {
        const v = document.getElementById('gameViewer');
        if (!document.fullscreenElement) v.requestFullscreen().catch(() => {});
        else document.exitFullscreen();
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !document.fullscreenElement)
            document.getElementById('gameViewer').classList.remove('active');
    });
}

// ===== SEARCH =====
function setupSearch() {
    const bar = document.getElementById('searchBar');
    if (!bar) return;
    bar.addEventListener('input', () => {
        const term = bar.value.toLowerCase().trim();
        const list = showingFavorites ? allGames.filter(g => isFavorited(g.filename)) : allGames;
        displayCards(term ? list.filter(g => g.displayName.toLowerCase().includes(term)) : list);
    });
    bar.addEventListener('keydown', e => {
        if (e.key === 'Escape') { bar.value = ''; displayCards(showingFavorites ? allGames.filter(g => isFavorited(g.filename)) : allGames); }
    });
}

// ===== FAVORITES =====
function isFavorited(filename) {
    try { return JSON.parse(localStorage.getItem('fav_' + filename) || 'false'); } catch { return false; }
}
function toggleFavorite(filename) {
    localStorage.setItem('fav_' + filename, JSON.stringify(!isFavorited(filename)));
}

function setupFavoritesToggle() {
    const btn = document.getElementById('favFilterBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        showingFavorites = !showingFavorites;
        btn.classList.toggle('active', showingFavorites);
        btn.textContent = showingFavorites ? '🎮 All Games' : '⭐ Favorites';
        displayCards(showingFavorites ? allGames.filter(g => isFavorited(g.filename)) : allGames);
    });
}

// ===== RANDOM =====
function setupRandomButton() {
    const btn = document.getElementById('randomBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if (!allGames.length) { alert('Games still loading, try again in a moment.'); return; }
        launchGame(allGames[Math.floor(Math.random() * allGames.length)]);
    });
}

// ===== EJECT =====
function setupEjectButton() {
    const btn = document.getElementById('ejectButton');
    if (!btn) return;
    btn.addEventListener('click', () => {
        window.close();
        if (!window.closed) window.location.href = 'about:blank';
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
        loadGamesAutomatically().then(() => {
            btn.textContent = 'Done!';
            setTimeout(() => { btn.textContent = 'Refresh Game List'; btn.disabled = false; }, 1500);
        });
    });
}

// ===== THEME =====
function setupThemeChanger() {
    document.querySelectorAll('.theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyTheme(btn.dataset.theme);
            document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const panel = document.getElementById('customColorPanel');
            if (panel) panel.style.display = btn.dataset.theme === 'custom' ? 'block' : 'none';
        });
    });
    const bg1 = document.getElementById('bgColorPicker');
    const bg2 = document.getElementById('bgShadePicker');
    const tc  = document.getElementById('textColorPicker');
    const fp  = document.getElementById('fontPicker');
    if (bg1) bg1.addEventListener('input', updateCustomTheme);
    if (bg2) bg2.addEventListener('input', updateCustomTheme);
    if (tc)  tc.addEventListener('input',  updateCustomTheme);
    if (fp)  fp.addEventListener('change', () => {
        document.body.style.fontFamily = fp.value;
        localStorage.setItem('customFont', fp.value);
    });
}

function applyTheme(theme) {
    currentTheme = theme;
    const ALL = ['rainbow','galaxy','custom','neon-cyberpunk','dark-mode','retro-arcade',
        'forest-fantasy','fire-lava','ice-kingdom','ocean-depths','desert-storm','glitch-mode',
        'synthwave','blood-moon','minimal-white','matrix','galaxy-rainbow','steampunk',
        'cartoon-pop','shadow-realm','snowy-night'];
    ALL.forEach(c => document.body.classList.remove('theme-' + c));
    if (theme !== 'default') document.body.classList.add('theme-' + theme);
    localStorage.setItem('selectedTheme', theme);
    if (theme === 'custom') {
        const bg1 = document.getElementById('bgColorPicker');
        const bg2 = document.getElementById('bgShadePicker');
        const tc  = document.getElementById('textColorPicker');
        const fp  = document.getElementById('fontPicker');
        if (bg1) bg1.value = localStorage.getItem('customBgColor')    || '#667eea';
        if (bg2) bg2.value = localStorage.getItem('customBgShade')    || '#764ba2';
        if (tc)  tc.value  = localStorage.getItem('customTextColor')  || '#667eea';
        if (fp && localStorage.getItem('customFont')) fp.value = localStorage.getItem('customFont');
        updateCustomTheme();
    }
}

function updateCustomTheme() {
    const bg1 = document.getElementById('bgColorPicker');
    const bg2 = document.getElementById('bgShadePicker');
    const tc  = document.getElementById('textColorPicker');
    if (!bg1 || !bg2 || !tc) return;
    document.body.style.setProperty('--custom-bg-gradient', `linear-gradient(135deg, ${bg1.value} 0%, ${bg2.value} 100%)`);
    document.body.style.setProperty('--custom-text-color', tc.value);
    localStorage.setItem('customBgColor',   bg1.value);
    localStorage.setItem('customBgShade',   bg2.value);
    localStorage.setItem('customTextColor', tc.value);
}

function loadSavedTheme() {
    const saved = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(saved);
    document.querySelectorAll('.theme-btn').forEach(b => {
        if (b.dataset.theme === saved) b.classList.add('active');
    });
    if (saved === 'custom') {
        const panel = document.getElementById('customColorPanel');
        if (panel) panel.style.display = 'block';
    }
}

// ===== TAB CLOAK =====
const CLOAKS = {
    'none':             { title: 'Cool Science Games', favicon: '' },
    'schoology':        { title: 'Home | Schoology',   favicon: 'https://asset-cdn.schoology.com/sites/all/themes/schoology_theme/favicon.ico' },
    'google-classroom': { title: 'Home',               favicon: 'https://ssl.gstatic.com/classroom/favicon.png' },
    'zoom':             { title: 'Zoom',               favicon: 'https://zoom.us/favicon.ico' },
    'google':           { title: 'Google',             favicon: 'https://www.google.com/favicon.ico' },
    'youtube':          { title: 'YouTube',            favicon: 'https://www.youtube.com/favicon.ico' }
};

function setupTabCloaking() {
    document.querySelectorAll('.cloak-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyCloak(btn.dataset.cloak);
            document.querySelectorAll('.cloak-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function applyCloak(key) {
    const d = CLOAKS[key] || CLOAKS['none'];
    document.title = d.title;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
    link.href = d.favicon;
    localStorage.setItem('selectedCloak', key);
}

function loadSavedCloak() {
    const saved = localStorage.getItem('selectedCloak') || 'none';
    applyCloak(saved);
    document.querySelectorAll('.cloak-btn').forEach(b => {
        if (b.dataset.cloak === saved) b.classList.add('active');
    });
}
