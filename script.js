/* =============================================
   QR-SCIENCE ARCADE — SCRIPT
   ============================================= */

const REPO        = 'charliedayfockens-hue/qr-science';
const GAMES_PATH  = 'assets/games';
const API_URL     = `https://api.github.com/repos/${REPO}/contents/${GAMES_PATH}`;
const REQUEST_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSeYC0XjyDXIJ06ONok-MgkyP1dqASSCabBcJ2ZIfPCU6Su3cQ/viewform?usp=publish-editor';

// ── STATE ──
let ALL_GAMES    = [];   // [{name, isMulti}]
let favorites    = JSON.parse(localStorage.getItem('qrs-favs') || '[]');
let activeFilter = 'all';
let searchQuery  = '';
let activeGame   = null; // currently loaded game name

// ── UTILS ──
function isFav(name) { return favorites.includes(name); }

function saveFavs() { localStorage.setItem('qrs-favs', JSON.stringify(favorites)); }

function toggleFav(name, e) {
  e.stopPropagation();
  const idx = favorites.indexOf(name);
  if (idx === -1) favorites.push(name);
  else favorites.splice(idx, 1);
  saveFavs();
  renderList();
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── FETCH GAMES ──
async function fetchGames() {
  const cached = sessionStorage.getItem('qrs-games');
  if (cached) {
    ALL_GAMES = JSON.parse(cached);
    renderList();
    return;
  }

  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API ${res.status}`);
    const items = await res.json();

    ALL_GAMES = items
      .filter(i => i.type === 'dir' || (i.type === 'file' && i.name.endsWith('.html')))
      .map(i => ({
        name:    i.type === 'dir' ? i.name : i.name.replace(/\.html$/, ''),
        isMulti: i.type === 'dir'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    sessionStorage.setItem('qrs-games', JSON.stringify(ALL_GAMES));
  } catch (err) {
    console.error('Failed to load games:', err);
    document.getElementById('list-loading').innerHTML =
      '<span style="color:#ff3333">FAILED TO LOAD</span>';
    return;
  }

  renderList();
}

// ── CLOCK ──
function updateClock() {
  const n  = new Date();
  const hh = String(n.getHours()).padStart(2,'0');
  const mm = String(n.getMinutes()).padStart(2,'0');
  const ss = String(n.getSeconds()).padStart(2,'0');
  const yyyy = n.getFullYear();
  const mo = String(n.getMonth()+1).padStart(2,'0');
  const dd = String(n.getDate()).padStart(2,'0');
  document.getElementById('time-display').textContent = `${hh}:${mm}:${ss}`;
  document.getElementById('date-display').textContent = `${yyyy}-${mo}-${dd}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── THEME ──
let currentTheme = localStorage.getItem('qrs-theme') || 'dark';
applyTheme(currentTheme);

document.getElementById('theme-toggle').addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem('qrs-theme', currentTheme);
});

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('theme-icon').textContent  = t === 'dark' ? '◑' : '○';
  document.getElementById('theme-label').textContent = t === 'dark' ? 'LIGHT' : 'DARK';
}

// ── REQUEST BUTTON ──
document.getElementById('request-btn').addEventListener('click', () => {
  window.open(REQUEST_URL, '_blank', 'noopener,noreferrer');
});

// ── SEARCH ──
document.getElementById('search-input').addEventListener('input', function () {
  searchQuery = this.value.trim().toLowerCase();
  renderList();
});

// ── FILTER TABS ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderList();
  });
});

// ── RENDER LIST ──
const listEl   = document.getElementById('game-list');
const countEl  = document.getElementById('game-count');

function renderList() {
  const filtered = ALL_GAMES.filter(g => {
    if (activeFilter === 'favorites' && !isFav(g.name)) return false;
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  countEl.textContent = `${filtered.length} GAME${filtered.length !== 1 ? 'S' : ''}`;
  listEl.innerHTML = '';

  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="list-empty">NO GAMES FOUND<span class="blink">_</span></div>`;
    return;
  }

  const frag = document.createDocumentFragment();
  filtered.forEach(g => {
    const item = document.createElement('div');
    item.className = 'game-item' + (activeGame === g.name ? ' active' : '');
    item.dataset.name = g.name;

    const faved = isFav(g.name);
    item.innerHTML = `
      <span class="item-name">${escHtml(g.name)}</span>
      <button class="item-fav${faved ? ' is-fav' : ''}" title="${faved ? 'Unfavorite' : 'Favorite'}">${faved ? '★' : '☆'}</button>`;

    item.querySelector('.item-fav').addEventListener('click', e => toggleFav(g.name, e));
    item.addEventListener('click', () => launchGame(g));
    frag.appendChild(item);
  });
  listEl.appendChild(frag);
}

// ── GAME LAUNCHER ──
const idleScreen    = document.getElementById('idle-screen');
const gameFrame     = document.getElementById('game-frame');
const displayLabel  = document.getElementById('display-label');
const displayCtrls  = document.getElementById('display-controls');

// Resolve entry file for multi-file games
async function resolveMultiEntry(name) {
  const key    = `qrs-entry-${name}`;
  const cached = sessionStorage.getItem(key);
  if (cached) return cached;

  try {
    const res   = await fetch(`https://api.github.com/repos/${REPO}/contents/${GAMES_PATH}/${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error();
    const files = await res.json();
    const htmls = files.filter(f => f.type === 'file' && f.name.toLowerCase().endsWith('.html'));
    const entry = htmls.find(f => f.name.toLowerCase() === 'index.html') || htmls[0];
    const name_ = entry ? entry.name : 'index.html';
    sessionStorage.setItem(key, name_);
    return name_;
  } catch {
    return 'index.html';
  }
}

async function launchGame(g) {
  activeGame = g.name;
  renderList(); // highlight active item

  displayLabel.textContent = g.name.toUpperCase();
  displayCtrls.classList.add('visible');

  // Show iframe, hide idle
  idleScreen.classList.add('hidden');
  gameFrame.src = '';

  if (g.isMulti) {
    const entry = await resolveMultiEntry(g.name);
    gameFrame.src = `${GAMES_PATH}/${encodeURIComponent(g.name)}/${entry}`;
  } else {
    gameFrame.src = `${GAMES_PATH}/${encodeURIComponent(g.name)}.html`;
  }
}

function exitGame() {
  activeGame = null;
  gameFrame.src = '';
  idleScreen.classList.remove('hidden');
  displayLabel.textContent = 'LOOKING FOR GAME';
  displayCtrls.classList.remove('visible');
  renderList(); // clear active highlight
}

// ── DISPLAY CONTROLS ──
document.getElementById('btn-exit').addEventListener('click', exitGame);

document.getElementById('btn-fullscreen').addEventListener('click', () => {
  const el = gameFrame;
  if (el.requestFullscreen)            el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
});

// ── RECENTLY ADDED ──
const recentModal = document.getElementById('recent-modal');
const recentBody  = document.getElementById('recent-body');

document.getElementById('recent-btn').addEventListener('click', openRecentModal);
document.getElementById('recent-close').addEventListener('click', closeRecentModal);
recentModal.addEventListener('click', e => { if (e.target === recentModal) closeRecentModal(); });

function openRecentModal() {
  recentModal.classList.remove('hidden');
  loadRecentGames();
}
function closeRecentModal() {
  recentModal.classList.add('hidden');
}

async function loadRecentGames() {
  const cacheKey = 'qrs-recent';
  const cached   = sessionStorage.getItem(cacheKey);
  if (cached) {
    renderRecentGames(JSON.parse(cached));
    return;
  }

  recentBody.innerHTML = '<div class="modal-loading">FETCHING COMMITS<span class="blink">_</span></div>';

  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const commitsRes = await fetch(
      `https://api.github.com/repos/${REPO}/commits?since=${since}&per_page=50`
    );
    if (!commitsRes.ok) throw new Error(`API ${commitsRes.status}`);
    const commits = await commitsRes.json();

    if (!commits.length) {
      recentBody.innerHTML = '<div class="modal-empty">NO GAMES ADDED IN THE LAST 7 DAYS.</div>';
      return;
    }

    // Fetch each commit's file list in parallel (cap at 15 commits to stay under rate limit)
    const toCheck = commits.slice(0, 15);
    const details = await Promise.all(
      toCheck.map(c =>
        fetch(`https://api.github.com/repos/${REPO}/commits/${c.sha}`)
          .then(r => r.json())
          .catch(() => null)
      )
    );

    // Map sha → commit date for labelling
    const shaDate = {};
    commits.forEach(c => { shaDate[c.sha] = c.commit.author.date; });

    // Collect added game files, newest first, deduplicated by game name
    const seen    = new Set();
    const results = [];

    for (const detail of details) {
      if (!detail || !detail.files) continue;
      const date = shaDate[detail.sha] || '';

      for (const file of detail.files) {
        if (file.status !== 'added') continue;
        if (!file.filename.startsWith(`${GAMES_PATH}/`)) continue;

        // Strip leading path
        const rel   = file.filename.slice(GAMES_PATH.length + 1); // e.g. "Game.html" or "Game/index.html"
        const parts = rel.split('/');
        const gameName = parts[0].endsWith('.html')
          ? parts[0].slice(0, -5)
          : parts[0];

        if (seen.has(gameName)) continue;
        seen.add(gameName);

        // Only show if this game is actually in our list (skip sub-assets)
        const inList = ALL_GAMES.some(g => g.name === gameName);
        if (!inList && parts.length === 1 && !parts[0].endsWith('.html')) continue;

        results.push({ name: gameName, date });
      }
    }

    sessionStorage.setItem(cacheKey, JSON.stringify(results));
    renderRecentGames(results);

  } catch (err) {
    console.error(err);
    recentBody.innerHTML = '<div class="modal-error">FAILED TO FETCH — CHECK CONNECTION.</div>';
  }
}

function renderRecentGames(list) {
  if (!list.length) {
    recentBody.innerHTML = '<div class="modal-empty">NO GAMES ADDED IN THE LAST 7 DAYS.</div>';
    return;
  }

  recentBody.innerHTML = '';
  const frag = document.createDocumentFragment();

  list.forEach(({ name, date }) => {
    const game = ALL_GAMES.find(g => g.name === name);

    const item = document.createElement('div');
    item.className = 'recent-item';

    const d   = date ? new Date(date) : null;
    const label = d
      ? `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`
      : '';

    item.innerHTML = `
      <span class="recent-item-name">${escHtml(name)}</span>
      <span class="recent-item-date">${label}</span>`;

    item.addEventListener('click', () => {
      closeRecentModal();
      if (game) launchGame(game);
    });

    frag.appendChild(item);
  });

  recentBody.appendChild(frag);
}

// ── INIT ──
fetchGames();
