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
    setupRandomButton();
    setupFavoritesToggle();
    setupSearch();
    setupAppsSearch();
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
    document.querySelectorAll('.nav-btn').forEach(btn => {
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
    // Reset favorites mode when leaving games view
    if (name !== 'games' && showingFavorites) {
        showingFavorites = false;
        const fav = document.getElementById('favoritesToggle');
        if (fav) fav.textContent = '⭐ Favorites';
    }
}

// ===== GAME LOADING =====
async function loadGamesAutomatically() {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '<div class="loading">Loading games...</div>';

    const { username, repo } = getGitHubInfo();

    // Method 1: GitHub API — assets/games/
    if (username && repo) {
        const result = await fetchFromGitHubAPI(username, repo, 'assets/games');
        if (result.length > 0) {
            allGames = result;
            displayCards(allGames, 'gamesGrid', 'noResults');
            updateGameCounter();
            detectNewGames(allGames);
            return;
        }
        // Fallback: try root assets/ (backward compat)
        const fallback = await fetchFromGitHubAPI(username, repo, 'assets');
        if (fallback.length > 0) {
            allGames = fallback;
            displayCards(allGames, 'gamesGrid', 'noResults');
            updateGameCounter();
            detectNewGames(allGames);
            return;
        }
    }

    // Method 2: Directory listing
    let result = await fetchFromDirectoryListing('assets/games/');
    if (result.length === 0) result = await fetchFromDirectoryListing('assets/');
    if (result.length > 0) {
        allGames = result;
        displayCards(allGames, 'gamesGrid', 'noResults');
        updateGameCounter();
        detectNewGames(allGames);
        return;
    }

    grid.innerHTML = '<div class="loading">No games found. Add HTML files or folders to <code>assets/games/</code>.</div>';
}

async function loadAppsAutomatically() {
    const grid = document.getElementById('appsGrid');
    grid.innerHTML = '<div class="loading">Loading apps...</div>';

    const { username, repo } = getGitHubInfo();

    if (username && repo) {
        const result = await fetchFromGitHubAPI(username, repo, 'assets/apps');
        if (result.length > 0) {
            allApps = result;
            displayCards(allApps, 'appsGrid', 'noAppsResults');
            document.getElementById('appsCounter').textContent = `${allApps.length} App${allApps.length !== 1 ? 's' : ''}`;
            return;
        }
    }

    const result = await fetchFromDirectoryListing('assets/apps/');
    if (result.length > 0) {
        allApps = result;
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
        const games = [];
        files.filter(f => f.type === 'file' && f.name.endsWith('.html'))
            .forEach(f => games.push({ filename: f.name, displayName: formatGameName(f.name), basePath }));
        files.filter(f => f.type === 'dir')
            .forEach(f => games.push({ filename: f.name + '/index.html', displayName: formatGameName(f.name), basePath }));
        return games;
    } catch { return []; }
}

async function fetchFromDirectoryListing(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) return [];
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const games = [];
        doc.querySelectorAll('a').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;
            if (href.endsWith('.html')) {
                const filename = href.split('/').pop().split('?')[0];
                games.push({ filename, displayName: formatGameName(filename), basePath: path });
            } else if (href.endsWith('/') && href !== '../' && href !== './' && !href.startsWith('?')) {
                const folderName = href.replace(/\/$/, '').split('/').pop();
                if (folderName) games.push({ filename: folderName + '/index.html', displayName: formatGameName(folderName), basePath: path });
            }
        });
        return games;
    } catch { return []; }
}

// ===== FORMAT NAME =====
function formatGameName(filename) {
    let name = filename.replace(/\/index\.html$/, '').replace(/\.html$/, '');
    name = name.replace(/[_-]/g, ' ');
    return name.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ===== IMAGE HELPERS =====
function getGameImageUrl(displayName) {
    let hash = 0;
    for (let i = 0; i < displayName.length; i++) {
        hash = ((hash << 5) - hash) + displayName.charCodeAt(i);
        hash |= 0;
    }
    const lock = Math.abs(hash) % 10000;
    const keyword = encodeURIComponent(displayName.toLowerCase());
    return `https://loremflickr.com/300/300/${keyword},game?lock=${lock}`;
}

function getHashColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0;
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 55%, 38%)`;
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

        // Image layer
        const imgDiv = document.createElement('div');
        imgDiv.className = 'card-img';
        imgDiv.style.backgroundColor = getHashColor(item.displayName);
        imgDiv.style.backgroundImage = `url('${getGameImageUrl(item.displayName)}')`;

        // Try local thumbnail (overrides loremflickr if it exists)
        const basename = item.filename.replace(/\/index\.html$/, '').replace(/\.html$/, '');
        const localThumb = `assets/thumbnails/${basename}.jpg`;
        const testImg = new Image();
        testImg.onload = () => { imgDiv.style.backgroundImage = `url('${localThumb}')`; };
        testImg.src = localThumb;

        // Name overlay (shows on hover)
        const nameDiv = document.createElement('div');
        nameDiv.className = 'card-name';
        nameDiv.textContent = item.displayName;

        card.appendChild(imgDiv);
        card.appendChild(nameDiv);

        card.addEventListener('click', () => launchGameViewer(item));
        grid.appendChild(card);
    });
}

// ===== GAME VIEWER =====
function launchGameViewer(game) {
    if (!game || !game.filename) return;
    currentGame = { filename: game.filename, displayName: game.displayName };

    // basePath was stored when loading (e.g. "assets/games/" or "assets/apps/")
    // Fall back to assets/ for backwards compatibility
    const base = game.basePath || 'assets/';
    const src = base + game.filename;

    document.getElementById('gameFrame').src = src;
    document.getElementById('viewerGameTitle').textContent = game.displayName;
    document.getElementById('gameViewer').classList.add('active');

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

function setupAppsSearch() {
    const bar = document.getElementById('appsSearchBar');
    if (!bar) return;
    bar.addEventListener('input', e => {
        const term = e.target.value.toLowerCase().trim();
        if (!term) {
            displayCards(allApps, 'appsGrid', 'noAppsResults');
        } else {
            displayCards(allApps.filter(a =>
                a.displayName.toLowerCase().includes(term) || a.filename.toLowerCase().includes(term)
            ), 'appsGrid', 'noAppsResults');
        }
    });
    bar.addEventListener('keydown', e => {
        if (e.key === 'Escape') { bar.value = ''; displayCards(allApps, 'appsGrid', 'noAppsResults'); bar.blur(); }
    });
}

// ===== FAVORITES =====
function setupFavoritesToggle() {
    const btn = document.getElementById('favoritesToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
        showView('games');
        showingFavorites = !showingFavorites;
        if (showingFavorites) {
            btn.textContent = '🎮 All Games';
            displayCards(allGames.filter(g => isGameFavorited(g.filename)), 'gamesGrid', 'noResults');
        } else {
            btn.textContent = '⭐ Favorites';
            displayCards(allGames, 'gamesGrid', 'noResults');
        }
    });
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
