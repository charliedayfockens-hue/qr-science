/* ============================================================
   MORE COOL SCIENCE GAMES — APP.JS
   ============================================================ */

/** @type {Game[]} */
let allGames = [];
let filteredGames = [];
let activeCategory = 'All';

const gameGrid    = document.getElementById('gameGrid');
const searchInput = document.getElementById('searchInput');
const searchClear = document.getElementById('searchClear');
const resultCount = document.getElementById('resultCount');
const categoryNav = document.getElementById('categoryNav');
const emptyState  = document.getElementById('emptyState');

// Modal elements
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalEmoji   = document.getElementById('modalEmoji');
const modalTitle   = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDesc    = document.getElementById('modalDesc');
const modalTags    = document.getElementById('modalTags');
const gameFrame    = document.getElementById('gameFrame');
const btnFullscreen = document.getElementById('btnFullscreen');
const btnOpen      = document.getElementById('btnOpen');

// ============================================================
// INIT
// ============================================================
async function init() {
  try {
    const res = await fetch('games.json');
    allGames = await res.json();
    buildCategoryNav();
    applyFilters();
  } catch (err) {
    console.error('Failed to load games.json:', err);
    gameGrid.innerHTML = '<p style="color:var(--accent3);padding:32px;font-family:var(--font-body)">Error loading games. Check games.json.</p>';
  }
}

// ============================================================
// CATEGORY NAV
// ============================================================
function buildCategoryNav() {
  const categories = ['All', ...new Set(allGames.map(g => g.category))].sort((a, b) =>
    a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b)
  );

  categoryNav.innerHTML = categories.map(cat => `
    <button class="cat-btn${cat === activeCategory ? ' active' : ''}" data-cat="${cat}">${cat}</button>
  `).join('');

  categoryNav.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.cat;
      categoryNav.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyFilters();
    });
  });
}

// ============================================================
// FILTER + RENDER
// ============================================================
function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();

  filteredGames = allGames.filter(game => {
    const matchCat = activeCategory === 'All' || game.category === activeCategory;
    const matchSearch = !query ||
      game.title.toLowerCase().includes(query) ||
      game.description.toLowerCase().includes(query) ||
      game.tags.some(t => t.toLowerCase().includes(query)) ||
      game.category.toLowerCase().includes(query);
    return matchCat && matchSearch;
  });

  renderGrid();
  updateResultCount();
}

function renderGrid() {
  if (filteredGames.length === 0) {
    gameGrid.style.display = 'none';
    emptyState.style.display = 'block';
    return;
  }

  gameGrid.style.display = 'grid';
  emptyState.style.display = 'none';

  gameGrid.innerHTML = filteredGames.map((game, i) => `
    <div class="game-card" data-id="${game.id}" style="animation-delay:${i * 40}ms">
      <div class="card-thumb">
        <span>${game.thumbnail}</span>
        <div class="card-scan"></div>
      </div>
      <div class="card-body">
        <span class="card-category">${game.category}</span>
        <h3 class="card-title">${game.title}</h3>
        <p class="card-desc">${game.description}</p>
        <div class="card-tags">
          ${game.tags.map(t => `<span class="tag">${t}</span>`).join('')}
        </div>
        <button class="card-play">▶ Launch Simulation</button>
      </div>
    </div>
  `).join('');

  gameGrid.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
      const game = allGames.find(g => g.id === card.dataset.id);
      if (game) openModal(game);
    });
  });
}

function updateResultCount() {
  const total = allGames.length;
  const shown = filteredGames.length;
  resultCount.textContent = shown === total
    ? `${total} simulations`
    : `${shown} of ${total} simulations`;
}

// ============================================================
// SEARCH
// ============================================================
searchInput.addEventListener('input', () => {
  searchClear.classList.toggle('visible', searchInput.value.length > 0);
  applyFilters();
});

searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchClear.classList.remove('visible');
  searchInput.focus();
  applyFilters();
});

// ============================================================
// MODAL
// ============================================================
function openModal(game) {
  modalEmoji.textContent    = game.thumbnail;
  modalTitle.textContent    = game.title;
  modalCategory.textContent = game.category;
  modalDesc.textContent     = game.description;
  modalTags.innerHTML       = game.tags.map(t => `<span class="tag">${t}</span>`).join('');
  gameFrame.src             = game.url;
  btnOpen.href              = game.url;

  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  // Slight delay so animation plays before iframe unloads
  setTimeout(() => { gameFrame.src = ''; }, 280);
}

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ============================================================
// FULLSCREEN
// ============================================================
btnFullscreen.addEventListener('click', () => {
  const el = document.getElementById('gameFrame');
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
});

// ============================================================
// BOOT
// ============================================================
init();
