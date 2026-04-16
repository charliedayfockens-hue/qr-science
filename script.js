/* =============================================
   QR-SCIENCE ARCADE — SCRIPT
   ============================================= */

const REPO         = 'charliedayfockens-hue/qr-science';
const GAMES_PATH   = 'assets/games';
const API_URL      = `https://api.github.com/repos/${REPO}/contents/${GAMES_PATH}`;
const REQUEST_URL  = 'https://docs.google.com/forms/d/e/1FAIpQLSeYC0XjyDXIJ06ONok-MgkyP1dqASSCabBcJ2ZIfPCU6Su3cQ/viewform?usp=publish-editor';
const STARBOARD_URL = 'https://change-me.example.com'; // ← change this link

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

document.getElementById('starboard-btn').addEventListener('click', () => {
  window.open(STARBOARD_URL, '_blank', 'noopener,noreferrer');
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

// ── INIT ──
fetchGames();
