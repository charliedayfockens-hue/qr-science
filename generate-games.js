/* ============================================================
   QR-SCIENCE — script.js
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   GAME REGISTRY
   Add your games here.

   id       : unique slug (used internally)
   name     : display name on the card
   icon     : emoji shown on card
   multi    : true  → assets/games/<id>/index.html
              false → assets/games/<id>.html
   ────────────────────────────────────────────── */
const GAME_REGISTRY = [
  { id: 'snake',       name: 'SNAKE',       icon: '🐍', multi: false },
  { id: 'tetris',      name: 'TETRIS',      icon: '🟦', multi: false },
  { id: 'pong',        name: 'PONG',        icon: '🏓', multi: false },
  { id: 'pacman',      name: 'PACMAN',      icon: '👾', multi: true  },
  { id: 'space-inv',   name: 'SPACE INV',   icon: '🚀', multi: true  },
  { id: 'minesweeper', name: 'MINESWEEPER', icon: '💣', multi: false },
  /* ── add more games below this line ── */
  // { id: 'mygame', name: 'MY GAME', icon: '🎮', multi: true },
];

/* ──────────────────────────────────────────────
   STATE
   ────────────────────────────────────────────── */
let favorites    = JSON.parse(localStorage.getItem('qrscience_favs') || '[]');
let activeFilter = 'all';
let searchQuery  = '';
let currentGame  = null;

/* ──────────────────────────────────────────────
   DOM REFERENCES
   ────────────────────────────────────────────── */
const grid           = document.getElementById('gameGrid');
const searchInput    = document.getElementById('searchInput');
const clearSearch    = document.getElementById('clearSearch');
const noResults      = document.getElementById('noResults');
const gameCount      = document.getElementById('gameCount');
const favCount       = document.getElementById('favCount');
const themeToggle    = document.getElementById('themeToggle');
const themeIcon      = document.getElementById('themeIcon');
const gameOverlay    = document.getElementById('gameOverlay');
const gameFrame      = document.getElementById('gameFrame');
const overlayClose   = document.getElementById('overlayClose');
const overlayFavBtn  = document.getElementById('overlayFavBtn');
const overlayFsBtn   = document.getElementById('overlayFullscreen');
const overlayName    = document.getElementById('overlayGameName');
const clockEl        = document.getElementById('clock');
const dateEl         = document.getElementById('date');
const terminalTextEl = document.getElementById('terminalText');
const toastEl        = document.getElementById('toast');
const tabBtns        = document.querySelectorAll('.tab');

/* ──────────────────────────────────────────────
   CLOCK & DATE
   ────────────────────────────────────────────── */
const DAYS   = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN',
                'JUL','AUG','SEP','OCT','NOV','DEC'];

function updateClock() {
  const now = new Date();
  const hh  = String(now.getHours()).padStart(2, '0');
  const mm  = String(now.getMinutes()).padStart(2, '0');
  const ss  = String(now.getSeconds()).padStart(2, '0');
  const day = DAYS[now.getDay()];
  const dd  = String(now.getDate()).padStart(2, '0');
  const mon = MONTHS[now.getMonth()];
  const yr  = now.getFullYear();
  clockEl.textContent = `${hh}:${mm}:${ss}`;
  dateEl.textContent  = `${day} ${dd} ${mon} ${yr}`;
}
updateClock();
setInterval(updateClock, 1000);

/* ──────────────────────────────────────────────
   TERMINAL TYPEWRITER
   ────────────────────────────────────────────── */
const TERMINAL_LINES = [
  'initializing qr-science...',
  'scanning /assets/games/...',
  `${GAME_REGISTRY.length} game(s) found.`,
  'all systems nominal.',
  'welcome back, operator.',
  'choose your game. escape is not an option.',
  'qr-science: where curiosity meets code.',
];
let tIdx = 0, cIdx = 0, deleting = false, tPause = 0;

function typeTerminal() {
  if (tPause > 0) { tPause--; setTimeout(typeTerminal, 80); return; }
  const line = TERMINAL_LINES[tIdx];
  if (!deleting) {
    cIdx++;
    terminalTextEl.textContent = line.slice(0, cIdx);
    if (cIdx >= line.length) { deleting = true; tPause = 30; }
    setTimeout(typeTerminal, 60);
  } else {
    cIdx--;
    terminalTextEl.textContent = line.slice(0, cIdx);
    if (cIdx <= 0) {
      deleting = false;
      tIdx = (tIdx + 1) % TERMINAL_LINES.length;
      tPause = 8;
    }
    setTimeout(typeTerminal, 30);
  }
}
setTimeout(typeTerminal, 800);

/* ──────────────────────────────────────────────
   THEME TOGGLE
   ────────────────────────────────────────────── */
const savedTheme = localStorage.getItem('qrscience_theme') || 'dark';
setTheme(savedTheme);

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  themeIcon.textContent = t === 'dark' ? '◐' : '●';
  localStorage.setItem('qrscience_theme', t);
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
  showToast(current === 'dark' ? '// LIGHT MODE ENGAGED' : '// DARK MODE ENGAGED');
});

/* ──────────────────────────────────────────────
   TOAST
   ────────────────────────────────────────────── */
let toastTimer;
function showToast(msg, duration = 2200) {
  clearTimeout(toastTimer);
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), duration);
}

/* ──────────────────────────────────────────────
   FAVORITES
   ────────────────────────────────────────────── */
function isFav(id) { return favorites.includes(id); }

function toggleFav(id, e) {
  if (e) e.stopPropagation();
  if (isFav(id)) {
    favorites = favorites.filter(f => f !== id);
    showToast('★ removed from favorites');
  } else {
    favorites.push(id);
    showToast('★ added to favorites');
  }
  localStorage.setItem('qrscience_favs', JSON.stringify(favorites));
  renderGrid();
  syncOverlayFavBtn();
}

function syncOverlayFavBtn() {
  if (!currentGame) return;
  if (isFav(currentGame.id)) {
    overlayFavBtn.classList.add('active');
    overlayFavBtn.title = 'Unfavorite';
  } else {
    overlayFavBtn.classList.remove('active');
    overlayFavBtn.title = 'Favorite';
  }
}

/* ──────────────────────────────────────────────
   GAME URL RESOLVER
   ────────────────────────────────────────────── */
function getGameURL(game) {
  return game.multi
    ? `assets/games/${game.id}/index.html`
    : `assets/games/${game.id}.html`;
}

/* ──────────────────────────────────────────────
   OPEN / CLOSE GAME
   ────────────────────────────────────────────── */
function openGame(game) {
  currentGame = game;
  overlayName.textContent = game.name;
  gameFrame.src = getGameURL(game);
  gameOverlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  syncOverlayFavBtn();
  showToast(`// LOADING ${game.name}...`, 1800);
}

function closeGame() {
  gameOverlay.classList.add('hidden');
  gameFrame.src = '';
  currentGame = null;
  document.body.style.overflow = '';
}

overlayClose.addEventListener('click', closeGame);

overlayFavBtn.addEventListener('click', () => {
  if (currentGame) toggleFav(currentGame.id);
});

overlayFsBtn.addEventListener('click', () => {
  if (gameFrame.requestFullscreen)       gameFrame.requestFullscreen();
  else if (gameFrame.webkitRequestFullscreen) gameFrame.webkitRequestFullscreen();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !gameOverlay.classList.contains('hidden')) closeGame();
});

/* ──────────────────────────────────────────────
   SEARCH & FILTER
   ────────────────────────────────────────────── */
searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value.trim().toLowerCase();
  renderGrid();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchInput.focus();
  renderGrid();
});

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    renderGrid();
  });
});

function getFilteredGames() {
  let list = [...GAME_REGISTRY];
  if (activeFilter === 'favorites') list = list.filter(g => isFav(g.id));
  if (searchQuery) list = list.filter(g =>
    g.name.toLowerCase().includes(searchQuery)
  );
  return list;
}

/* ──────────────────────────────────────────────
   RENDER GRID
   ────────────────────────────────────────────── */
function renderGrid() {
  const list = getFilteredGames();
  grid.innerHTML = '';

  if (list.length === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    list.forEach((game, i) => {
      grid.appendChild(buildCard(game, i));
    });
  }

  const totalFavs = favorites.length;
  gameCount.textContent = `${list.length} GAME${list.length !== 1 ? 'S' : ''} LOADED`;
  favCount.textContent  = `${totalFavs} FAVORITE${totalFavs !== 1 ? 'S' : ''}`;
}

/* ──────────────────────────────────────────────
   BUILD CARD
   ────────────────────────────────────────────── */
function buildCard(game, index) {
  const card = document.createElement('div');
  card.className = 'game-card entering';
  card.style.animationDelay = `${index * 0.04}s`;

  const typeLabel = game.multi ? 'MULTI-FILE' : 'SINGLE FILE';
  const favActive = isFav(game.id);

  card.innerHTML = `
    <button
      class="fav-btn${favActive ? ' active' : ''}"
      data-id="${game.id}"
      title="${favActive ? 'Unfavorite' : 'Favorite'}"
    >★</button>
    <div class="card-icon">${game.icon}</div>
    <div class="card-name">${game.name}</div>
    <div class="card-type">${typeLabel}</div>
  `;

  card.addEventListener('click', () => openGame(game));

  card.querySelector('.fav-btn').addEventListener('click', e => {
    toggleFav(game.id, e);
  });

  return card;
}

/* ──────────────────────────────────────────────
   INIT
   ────────────────────────────────────────────── */
renderGrid();