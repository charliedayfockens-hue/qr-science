/* =============================================
   QR-SCIENCE ARCADE — SCRIPT
   ============================================= */

const REPO          = 'charliedayfockens-hue/qr-science';
const GAMES_PATH    = 'assets/games';
const API_URL       = `https://api.github.com/repos/${REPO}/contents/${GAMES_PATH}`;
const STARBOARD_URL = 'https://change-me.example.com'; // ← change this link

// ── UPDATE BOARD CONTENT ──────────────────────────────────────────────────────
// Edit these entries to update what everyone sees on the board.
// Each entry needs a date, title, and body.
const BOARD_UPDATES = [
  {
    date:  '2026-04-19',
    title: 'Welcome to QR-Science!',
    body:  'The arcade is now live. Games are being added regularly.\nCheck back often for new additions.'
  },
  // Add more entries below — newest first:
  // {
  //   date:  'YYYY-MM-DD',
  //   title: 'Update title here',
  //   body:  'Write your update text here.'
  // },
];
// ─────────────────────────────────────────────────────────────────────────────

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

// ── STARBOARD BUTTON ──
document.getElementById('starboard-btn').addEventListener('click', () => {
  window.open(STARBOARD_URL, '_blank', 'noopener,noreferrer');
});

// ── UPDATE BOARD ──
const boardModal    = document.getElementById('board-modal');
const boardRead     = document.getElementById('board-read');
const boardEdit     = document.getElementById('board-edit');
const boardEditBtn  = document.getElementById('board-edit-btn');
const boardTextarea = document.getElementById('board-textarea');
const BOARD_KEY     = 'qrs-board-override';

function serializeBoard(entries) {
  return entries.map(e =>
    `DATE: ${e.date}\nTITLE: ${e.title}\n\n${e.body}`
  ).join('\n\n---\n\n');
}

function parseBoard(text) {
  return text.split(/\n---\n/).map(block => {
    const lines = block.trim().split('\n');
    const date  = (lines.find(l => l.startsWith('DATE:'))  || '').replace('DATE:', '').trim();
    const title = (lines.find(l => l.startsWith('TITLE:')) || '').replace('TITLE:', '').trim();
    const body  = lines.filter(l => !l.startsWith('DATE:') && !l.startsWith('TITLE:')).join('\n').trim();
    return { date, title, body };
  }).filter(e => e.title || e.body);
}

function getActiveBoard() {
  const override = localStorage.getItem(BOARD_KEY);
  if (override) return parseBoard(override);
  return BOARD_UPDATES;
}

function renderBoardRead() {
  const entries = getActiveBoard();
  if (!entries.length) {
    boardRead.innerHTML = '<div class="board-empty">NO UPDATES YET.</div>';
    return;
  }
  boardRead.innerHTML = entries.map(e => `
    <div class="board-entry">
      <div class="board-entry-header">
        <span class="board-entry-title">${escHtml(e.title)}</span>
        <span class="board-entry-date">${escHtml(e.date)}</span>
      </div>
      <div class="board-entry-body">${escHtml(e.body)}</div>
    </div>`).join('');
}

function openBoard() {
  boardModal.classList.remove('hidden');
  showReadView();
  renderBoardRead();
}
function closeBoard() {
  boardModal.classList.add('hidden');
  showReadView();
}
function showReadView() {
  boardRead.classList.remove('hidden');
  boardEdit.classList.add('hidden');
  boardEditBtn.textContent = '✎ EDIT';
}
function showEditView() {
  const entries = getActiveBoard();
  boardTextarea.value = serializeBoard(entries);
  boardRead.classList.add('hidden');
  boardEdit.classList.remove('hidden');
  boardEditBtn.textContent = '← BACK';
}

document.getElementById('board-btn').addEventListener('click', openBoard);
document.getElementById('board-close').addEventListener('click', closeBoard);
boardModal.addEventListener('click', e => { if (e.target === boardModal) closeBoard(); });

boardEditBtn.addEventListener('click', () => {
  boardEdit.classList.contains('hidden') ? showEditView() : showReadView();
});

document.getElementById('board-save').addEventListener('click', () => {
  localStorage.setItem(BOARD_KEY, boardTextarea.value);
  showReadView();
  renderBoardRead();
});

document.getElementById('board-cancel').addEventListener('click', showReadView);

document.getElementById('board-reset').addEventListener('click', () => {
  localStorage.removeItem(BOARD_KEY);
  showReadView();
  renderBoardRead();
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

// Recursively search a directory (via GitHub API url) for the best HTML entry point.
// Returns a relative path from the game root, e.g. "subfolder/index.html".
async function findHtmlInDir(apiUrl, relPath, depth) {
  if (depth > 3) return null; // safety cap
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    const items = await res.json();
    if (!Array.isArray(items)) return null;

    const htmlFiles = items.filter(i => i.type === 'file' && i.name.toLowerCase().endsWith('.html'));
    const dirs      = items.filter(i => i.type === 'dir');

    // Prefer index.html at this level first
    const index = htmlFiles.find(f => f.name.toLowerCase() === 'index.html');
    if (index) return relPath ? `${relPath}/${index.name}` : index.name;

    // Any other html file at this level
    if (htmlFiles.length) {
      const f = htmlFiles[0];
      return relPath ? `${relPath}/${f.name}` : f.name;
    }

    // Recurse into subdirectories (in parallel)
    const results = await Promise.all(
      dirs.map(d => findHtmlInDir(d.url, relPath ? `${relPath}/${d.name}` : d.name, depth + 1))
    );
    return results.find(r => r !== null) || null;
  } catch {
    return null;
  }
}

// Resolve entry file for multi-file games, searching recursively if needed.
async function resolveMultiEntry(name) {
  const key    = `qrs-entry-${name}`;
  const cached = sessionStorage.getItem(key);
  if (cached) return cached;

  const rootUrl = `https://api.github.com/repos/${REPO}/contents/${GAMES_PATH}/${encodeURIComponent(name)}`;
  const entry   = await findHtmlInDir(rootUrl, '', 0);
  const result  = entry || 'index.html';
  sessionStorage.setItem(key, result);
  return result;
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
