// =============================================
// qr-science // RETRO HACKER ARCADE GAME HUB
// 3-file static site - GitHub ready
// Edit the gamesData array below to match your assets/games folder
// =============================================

const defaultGames = [
    {
        name: "PONG 1972",
        path: "pong/",                    // folder → loads index.html automatically
        thumbnail: null
    },
    {
        name: "SNAKE MATRIX",
        path: "snake.html",               // single file game
        thumbnail: null
    },
    {
        name: "INVADERS 8-BIT",
        path: "invaders/", 
        thumbnail: null
    },
    {
        name: "TETRIS RETRO",
        path: "tetris.html",
        thumbnail: null
    }
    // ADD YOUR REAL GAMES HERE ↓↓↓
    // Example:
    // {
    //     name: "My Awesome Game",
    //     path: "mygamefolder/",        // ends with / for multifile (index.html inside folder)
    //     thumbnail: "assets/games/mygamefolder/thumb.png"   // optional
    // },
    // {
    //     name: "Single File Game",
    //     path: "single-game.html",     // ends with .html for single-file games
    //     thumbnail: null
    // }
];

let gamesData = [...defaultGames];
let favorites = JSON.parse(localStorage.getItem('qr-favorites')) || [];
let showOnlyFavorites = false;

// Generate slug for identification (used for favorites)
function getSlug(game) {
    return game.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

// Open game in isolated about:blank window with full-screen iframe
function launchGame(game) {
    const currentDir = new URL('./', window.location.href).href;
    const gameFullUrl = new URL(`assets/games/${game.path}`, currentDir).href;

    const newWin = window.open('about:blank', '_blank');
    
    if (!newWin) {
        alert('POPUP BLOCKED\nAllow popups for this site to launch games in hacker isolation mode');
        return;
    }

    newWin.document.write(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>${game.name} // qr-science PAYLOAD</title>
            <style>
                body, html {
                    margin: 0;
                    padding: 0;
                    height: 100%;
                    overflow: hidden;
                    background: #000;
                }
                iframe {
                    width: 100vw;
                    height: 100vh;
                    border: none;
                }
                .crt {
                    position: fixed;
                    top: 0; left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    background: repeating-linear-gradient(
                        transparent 0px,
                        transparent 3px,
                        rgba(0, 255, 65, 0.1) 3px,
                        rgba(0, 255, 65, 0.1) 6px
                    );
                    z-index: 9999;
                    animation: crt-scan 4s linear infinite;
                }
                @keyframes crt-scan {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100%; }
                }
            </style>
        </head>
        <body>
            <iframe src="${gameFullUrl}" allowfullscreen></iframe>
            <div class="crt"></div>
        </body>
        </html>
    `);
    newWin.document.close();
}

// Toggle favorite
function toggleFavorite(game, event) {
    event.stopImmediatePropagation();
    const slug = getSlug(game);
    
    if (favorites.includes(slug)) {
        favorites = favorites.filter(s => s !== slug);
    } else {
        favorites.push(slug);
    }
    
    localStorage.setItem('qr-favorites', JSON.stringify(favorites));
    renderGames();
}

// Render the game grid
function renderGames() {
    const container = document.getElementById('games-container');
    container.innerHTML = '';
    
    let filtered = gamesData;
    
    // Apply search
    const searchTerm = document.getElementById('search-input').value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(game => 
            game.name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply favorites filter
    if (showOnlyFavorites) {
        filtered = filtered.filter(game => favorites.includes(getSlug(game)));
    }
    
    document.getElementById('results-count').textContent = filtered.length;
    
    if (filtered.length === 0) {
        document.getElementById('empty-state').classList.remove('hidden');
        return;
    } else {
        document.getElementById('empty-state').classList.add('hidden');
    }
    
    filtered.forEach(game => {
        const slug = getSlug(game);
        const isFav = favorites.includes(slug);
        
        const cardHTML = `
            <div class="game-card" onclick="launchGame(gamesData.find(g => getSlug(g) === '${slug}'))">
                <div class="thumbnail-container">
                    ${game.thumbnail 
                        ? `<img src="${game.thumbnail}" class="thumbnail" alt="${game.name}">` 
                        : `<div class="placeholder">🎮</div>`
                    }
                </div>
                <div class="game-info">
                    <div class="game-name">${game.name}</div>
                    <div class="fav-star" onclick="toggleFavorite(gamesData.find(g => getSlug(g) === '${slug}'), event)">
                        ${isFav ? '★' : '☆'}
                    </div>
                </div>
            </div>
        `;
        
        container.innerHTML += cardHTML;
    });
}

// Update live clock + date
function updateClock() {
    const now = new Date();
    
    const time = now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    const date = now.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
    
    document.getElementById('datetime').innerHTML = `
        <div><strong>TIME:</strong> ${time}</div>
        <div><strong>DATE:</strong> ${date}</div>
    `;
    
    // Footer time
    document.getElementById('footer-time').textContent = time;
}

// Theme toggle
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const btn = document.getElementById('theme-toggle');
    btn.textContent = document.body.classList.contains('light-mode') ? '☽' : '☀️';
    
    // Save preference
    localStorage.setItem('qr-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

// Favorites toggle
function toggleFavoritesMode() {
    showOnlyFavorites = !showOnlyFavorites;
    const btn = document.getElementById('favorites-toggle');
    btn.querySelector('#fav-text').textContent = showOnlyFavorites ? 'FAVS' : 'ALL';
    renderGames();
}

// Reset search
function resetSearch() {
    document.getElementById('search-input').value = '';
    showOnlyFavorites = false;
    document.getElementById('favorites-toggle').querySelector('#fav-text').textContent = 'ALL';
    renderGames();
}

// Initialize everything
function init() {
    // Load saved theme
    if (localStorage.getItem('qr-theme') === 'light') {
        document.body.classList.add('light-mode');
        document.getElementById('theme-toggle').textContent = '☽';
    }
    
    // Real-time clock
    updateClock();
    setInterval(updateClock, 1000);
    
    // Search live filtering
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        renderGames();
    });
    
    // Keyboard shortcut (Ctrl/Cmd + K) to focus search
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
    });
    
    // Theme button
    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
    
    // Favorites button
    document.getElementById('favorites-toggle').addEventListener('click', toggleFavoritesMode);
    
    // Initial render
    renderGames();
    
    console.log('%cqr-science TERMINAL BOOTED SUCCESSFULLY', 'color:#00ff41; font-family:Courier New; font-size:13px');
}

// Boot the system
window.onload = init;