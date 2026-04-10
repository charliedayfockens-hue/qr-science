// ===== GLOBALS =====
let allGames = [];
let showingFavorites = false;

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    startClock();
    setupFavoritesToggle();
    setupCloakMenu();
    loadSavedCloak();
    loadGamesAutomatically();
});

// ===== CLOCK =====
function startClock() {
    function tick() {
        const now = new Date();
        const timeEl = document.getElementById('clockTime');
        const dateEl = document.getElementById('clockDate');
        if (timeEl) {
            let h = now.getHours(), m = now.getMinutes(), s = now.getSeconds();
            const ampm = h >= 12 ? 'PM' : 'AM';
            h = h % 12 || 12;
            timeEl.textContent = `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')} ${ampm}`;
        }
        if (dateEl) {
            const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
            const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            dateEl.textContent = `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
        }
    }
    tick();
    setInterval(tick, 1000);
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

// ===== GAME LOADING =====
async function loadGamesAutomatically() {
    const grid = document.getElementById('gamesGrid');

    const cached = getCache('cache_games');
    if (cached && cached.length > 0) {
        allGames = cached;
        renderCards(allGames);
        updateCounter();
        return;
    }

    grid.innerHTML = '<p class="loading-msg">Loading games...</p>';

    const { username, repo } = getGitHubInfo();
    let result = [];

    if (username && repo) {
        result = await fetchFromAPI(username, repo, 'assets/games');
        if (!result.length) result = await fetchFromAPI(username, repo, 'assets');
    }
    if (!result.length) result = await fetchFromListing('assets/games/');
    if (!result.length) result = await fetchFromListing('assets/');

    if (result.length) {
        allGames = result;
        setCache('cache_games', allGames);
        renderCards(allGames);
        updateCounter();
    } else {
        grid.innerHTML = '<p class="loading-msg">No games found. Add folders or HTML files to <code>assets/games/</code>.</p>';
    }
}

function getGitHubInfo() {
    const host = window.location.hostname;
    const parts = window.location.pathname.split('/').filter(Boolean);
    if (host.includes('github.io') && parts.length >= 1)
        return { username: host.split('.')[0], repo: parts[0] };
    return { username: '', repo: '' };
}

async function fetchFromAPI(username, repo, path) {
    try {
        const r = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`);
        if (!r.ok) return [];
        const files = await r.json();
        const base = path + '/';
        const singles = files
            .filter(f => f.type === 'file' && f.name.endsWith('.html'))
            .map(f => ({ filename: f.name, displayName: formatName(f.name), basePath: base }));
        const folders = await Promise.all(
            files.filter(f => f.type === 'dir').map(async f => {
                const entry = await resolveAPIEntry(username, repo, path + '/' + f.name, f.name);
                if (!entry) return null;
                return { filename: f.name + '/' + entry, displayName: formatName(f.name), basePath: base };
            })
        );
        return [...singles, ...folders.filter(Boolean)];
    } catch { return []; }
}

async function resolveAPIEntry(username, repo, folderPath, folderName) {
    const PRIORITY = ['index.html', 'main.html', 'game.html', 'app.html'];
    try {
        const r = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${folderPath}`);
        if (!r.ok) return 'index.html';
        const files = await r.json();
        const html = files.filter(f => f.type === 'file' && f.name.endsWith('.html')).map(f => f.name);
        if (!html.length) return null;
        for (const p of PRIORITY) if (html.includes(p)) return p;
        return html.find(f => f.replace('.html','').toLowerCase() === folderName.toLowerCase()) || html[0];
    } catch { return 'index.html'; }
}

async function fetchFromListing(path) {
    try {
        const r = await fetch(path);
        if (!r.ok) return [];
        const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
        const singles = [], folderNames = [];
        doc.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('href');
            if (!href) return;
            if (href.endsWith('.html'))
                singles.push({ filename: href.split('/').pop().split('?')[0], displayName: formatName(href), basePath: path });
            else if (href.endsWith('/') && href !== '../' && href !== './' && !href.startsWith('?'))
                folderNames.push(href.replace(/\/$/, '').split('/').pop());
        });
        const folders = await Promise.all(folderNames.map(async n => {
            const entry = await resolveListingEntry(path + n + '/', n);
            if (!entry) return null;
            return { filename: n + '/' + entry, displayName: formatName(n), basePath: path };
        }));
        return [...singles, ...folders.filter(Boolean)];
    } catch { return []; }
}

async function resolveListingEntry(url, name) {
    const PRIORITY = ['index.html', 'main.html', 'game.html', 'app.html'];
    try {
        const r = await fetch(url);
        if (!r.ok) return 'index.html';
        const doc = new DOMParser().parseFromString(await r.text(), 'text/html');
        const html = [...doc.querySelectorAll('a')]
            .map(a => a.getAttribute('href')).filter(h => h && h.endsWith('.html'))
            .map(h => h.split('/').pop().split('?')[0]);
        if (!html.length) return null;
        for (const p of PRIORITY) if (html.includes(p)) return p;
        return html.find(f => f.replace('.html','').toLowerCase() === name.toLowerCase()) || html[0];
    } catch { return 'index.html'; }
}

function formatName(filename) {
    let name = filename.replace(/\/index\.html$/, '').replace(/\.html$/, '').split('/').pop();
    return name.replace(/[_-]/g, ' ').split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

// ===== RENDER CARDS =====
function renderCards(items) {
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
        star.className = 'card-star' + (isFav(item.filename) ? ' active' : '');
        star.textContent = '⭐';
        star.title = 'Favorite';
        star.addEventListener('click', e => {
            e.stopPropagation();
            toggleFav(item.filename);
            star.classList.toggle('active');
        });

        const label = document.createElement('div');
        label.className = 'card-name';
        label.textContent = item.displayName;

        card.appendChild(star);
        card.appendChild(label);
        card.addEventListener('click', () => openGame(item));
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

function updateCounter() {
    const el = document.getElementById('gameCounter');
    if (el) el.textContent = `${allGames.length} Game${allGames.length !== 1 ? 's' : ''}`;
}

// ===== OPEN GAME IN NEW TAB =====
function openGame(game) {
    if (!game || !game.filename) return;
    const src = (game.basePath || 'assets/') + game.filename;
    window.open(src, '_blank');
}

// ===== FAVORITES =====
function isFav(filename) {
    try { return JSON.parse(localStorage.getItem('fav_' + filename) || 'false'); } catch { return false; }
}
function toggleFav(filename) {
    localStorage.setItem('fav_' + filename, JSON.stringify(!isFav(filename)));
}

function setupFavoritesToggle() {
    const btn = document.getElementById('favFilterBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        showingFavorites = !showingFavorites;
        btn.classList.toggle('active', showingFavorites);
        btn.textContent = showingFavorites ? '🎮 All Games' : '⭐ Favorites';
        const list = showingFavorites ? allGames.filter(g => isFav(g.filename)) : allGames;
        renderCards(list);
    });
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

function setupCloakMenu() {
    const btn  = document.getElementById('cloakBtn');
    const menu = document.getElementById('cloakMenu');
    if (!btn || !menu) return;

    btn.addEventListener('click', e => {
        e.stopPropagation();
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    document.addEventListener('click', () => { menu.style.display = 'none'; });

    menu.querySelectorAll('.cloak-opt').forEach(opt => {
        opt.addEventListener('click', e => {
            e.stopPropagation();
            applyCloak(opt.dataset.cloak);
            menu.querySelectorAll('.cloak-opt').forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            menu.style.display = 'none';
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
    document.querySelectorAll('.cloak-opt').forEach(o => {
        if (o.dataset.cloak === saved) o.classList.add('active');
    });
}
