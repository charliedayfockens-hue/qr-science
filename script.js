/* =============================================
   QR-SCIENCE ARCADE — SCRIPT
   ============================================= */

const REPO         = 'charliedayfockens-hue/qr-science';
const GAMES_PATH   = 'assets/games';
const API_URL      = `https://api.github.com/repos/${REPO}/contents/${GAMES_PATH}`;
const REQUEST_URL  = 'https://docs.google.com/forms/d/e/1FAIpQLSeYC0XjyDXIJ06ONok-MgkyP1dqASSCabBcJ2ZIfPCU6Su3cQ/viewform?usp=publish-editor';

// ── LOGO ──
document.getElementById('site-logo').textContent = 'QR-SCIENCE';

// ── STATE ──
let ALL_GAMES    = [];  // [{name, isMulti}]
let favorites    = JSON.parse(localStorage.getItem('qrs-favs') || '[]');
let activeFilter = 'all';
let searchQuery  = '';

// ── UTILS ──
function gamePath({ name, isMulti }) {
  const enc = encodeURIComponent(name);
  return isMulti
    ? `${GAMES_PATH}/${enc}/index.html`
    : `${GAMES_PATH}/${enc}.html`;
}

function isFav(name) { return favorites.includes(name); }

function saveFavs() {
  localStorage.setItem('qrs-favs', JSON.stringify(favorites));
}

function toggleFav(name, e) {
  e.stopPropagation();
  const idx = favorites.indexOf(name);
  if (idx === -1) favorites.push(name);
  else favorites.splice(idx, 1);
  saveFavs();
  renderGames();
}

// ── FETCH GAMES FROM GITHUB API ──
async function fetchGames() {
  // Use sessionStorage to avoid hammering the API on every visit
  const cached = sessionStorage.getItem('qrs-games');
  if (cached) {
    ALL_GAMES = JSON.parse(cached);
    renderGames();
    return;
  }

  showLoading(true);
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error(`API error ${res.status}`);
    const items = await res.json();

    ALL_GAMES = items
      .filter(item => item.type === 'dir' || (item.type === 'file' && item.name.endsWith('.html')))
      .map(item => ({
        name:    item.type === 'dir' ? item.name : item.name.replace(/\.html$/, ''),
        isMulti: item.type === 'dir'
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    sessionStorage.setItem('qrs-games', JSON.stringify(ALL_GAMES));
  } catch (err) {
    console.error('Failed to load games:', err);
    showError();
  } finally {
    showLoading(false);
  }

  renderGames();
}

function showLoading(on) {
  let el = document.getElementById('loading-msg');
  if (on) {
    if (!el) {
      el = document.createElement('div');
      el.id = 'loading-msg';
      el.className = 'no-results';
      el.innerHTML = '<span class="nr-prefix">&gt;&gt;</span><span class="nr-text">LOADING GAMES<span class="blink">_</span></span>';
      document.getElementById('game-grid').after(el);
    }
    el.classList.remove('hidden');
  } else {
    if (el) el.classList.add('hidden');
  }
}

function showError() {
  const el = document.getElementById('loading-msg');
  if (el) el.innerHTML = '<span class="nr-prefix" style="color:#ff2a2a">&gt;&gt;</span><span class="nr-text">FAILED TO LOAD GAMES. CHECK CONNECTION.</span>';
}

// ── CLOCK ──
function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const ss  = String(now.getSeconds()).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mo  = String(now.getMonth() + 1).padStart(2, '0');
  const dd  = String(now.getDate()).padStart(2, '0');
  document.getElementById('time-display').textContent = `${hh}:${mm}:${ss}`;
  document.getElementById('date-display').textContent = `${yyyy}-${mo}-${dd}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── THEME ──
const root       = document.documentElement;
const themeBtn   = document.getElementById('theme-toggle');
const themeIcon  = document.getElementById('theme-icon');
const themeLabel = document.getElementById('theme-label');

let currentTheme = localStorage.getItem('qrs-theme') || 'dark';
applyTheme(currentTheme);

themeBtn.addEventListener('click', () => {
  currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(currentTheme);
  localStorage.setItem('qrs-theme', currentTheme);
});

function applyTheme(t) {
  root.setAttribute('data-theme', t);
  if (t === 'dark') {
    themeIcon.textContent  = '◑';
    themeLabel.textContent = 'LIGHT';
  } else {
    themeIcon.textContent  = '○';
    themeLabel.textContent = 'DARK';
  }
}

// ── REQUEST GAMES BUTTON ──
document.getElementById('request-btn').addEventListener('click', () => {
  window.open(REQUEST_URL, '_blank', 'noopener,noreferrer');
});

// ── SEARCH ──
const searchInput = document.getElementById('search-input');
const searchCount = document.getElementById('search-count');

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  renderGames();
});

// ── FILTER TABS ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderGames();
  });
});

// ── RENDER ──
const grid      = document.getElementById('game-grid');
const noResults = document.getElementById('no-results');

function renderGames() {
  const list = ALL_GAMES.filter(g => {
    if (activeFilter === 'favorites' && !isFav(g.name)) return false;
    if (searchQuery && !g.name.toLowerCase().includes(searchQuery)) return false;
    return true;
  });

  searchCount.textContent = `${list.length} GAME${list.length !== 1 ? 'S' : ''}`;
  grid.innerHTML = '';

  if (list.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }
  noResults.classList.add('hidden');

  const frag = document.createDocumentFragment();
  list.forEach((g, i) => {
    const card  = document.createElement('div');
    card.className = 'game-card';
    card.style.animationDelay = `${Math.min(i * 6, 250)}ms`;
    const faved = isFav(g.name);

    card.innerHTML = `
      <div class="card-name">${escHtml(g.name)}</div>
      <div class="card-meta">
        <button class="fav-btn${faved ? ' is-fav' : ''}" title="${faved ? 'Unfavorite' : 'Favorite'}">
          ${faved ? '★' : '☆'}
        </button>
      </div>`;

    card.querySelector('.fav-btn').addEventListener('click', e => toggleFav(g.name, e));
    card.addEventListener('click', () => launchGame(g));
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

function escHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── GAME LAUNCHER ──
const overlay      = document.getElementById('game-overlay');
const frame        = document.getElementById('game-frame');
const overlayTitle = document.getElementById('overlay-title');
const closeBtn     = document.getElementById('overlay-close');
const fsBtn        = document.getElementById('overlay-fullscreen');

function launchGame(g) {
  overlayTitle.textContent = g.name.toUpperCase();
  frame.src = gamePath(g);
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeGame() {
  overlay.classList.add('hidden');
  frame.src = '';
  document.body.style.overflow = '';
}

closeBtn.addEventListener('click', closeGame);

fsBtn.addEventListener('click', () => {
  const el = frame;
  if (el.requestFullscreen)            el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.mozRequestFullScreen)    el.mozRequestFullScreen();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !overlay.classList.contains('hidden')) closeGame();
});

overlay.addEventListener('click', e => {
  if (e.target === overlay) closeGame();
});

// ── INIT ──
fetchGames();
