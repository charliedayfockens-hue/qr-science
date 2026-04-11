/* =============================================
   QR-SCIENCE ARCADE — SCRIPT
   ============================================= */

// ── ALL GAMES (single-file .html unless in MULTI set) ──
const GAMES = [
  "12 Mini Battles","1v1.LoL","3D Bolt Master","3D Bowling",
  "64 in 1 NES","8 Ball Billiards Classic","8 Ball Pool","99 Balls",
  "A Bite at Freddy","A Dance of Fire and Ice","A Difficult Game About Climbing",
  "A Game About Feeding A Black Hole","A Small World Cup","Abandoned",
  "Achievement Unlocked","Achievement Unlocked 2","Achievement Unlocked 3",
  "AdVenture Capitalist","Adventure Driver","Ages of Conflict","Alien Hominid",
  "Amanda the Adventurer","Amaze","Among Us","Andy's Apple Farm",
  "Angry Birds","Angry Birds Showdown","Aquapark.io","Archery World Tour",
  "Attack Hole","Aviamasters","BLOODMONEY!","Backrooms","Bacon May Die",
  "Bad Ice Cream","Bad Ice Cream 2","Bad Ice Cream 3","Bad Monday Simulator",
  "Bad Parenting","Bad Time Simulator","Baldi's Basics",
  "Baldi's Basics Classic Remastered","Baldi's Basics Plus",
  "Ball Blast","Bank Robbery","Bank Robbery 2","Bank Robbery 3",
  "Bart Bash","Bart Blast","Baseball Bros","Basket Battle","Basket Bros",
  "Basket Random","Basketball Frvr","Basketball Stars","Bazooka Boy",
  "Bendy and the Ink Machine","Big ICE Tower Tiny Square",
  "Big NEON Tower Tiny Square","Big Tower Tiny Square","Big Tower Tiny Squares 2",
  "Binding of Issac Wrath of the Lamb","Bit Guns","BitLife","BitPlanes",
  "Black Jack","Blade Ball","Block Blast","Block Post","Blocky Snakes",
  "Bloons TD","Bloons TD 2","Bloons TD 3","Bloons TD 4","Bloons TD 5",
  "Bloxors","Blumgi Rocket","Bob The Robber 2","Boom Slinger Reboom",
  "Bottle Jump 3D","Bouncemasters","Bowmasters","Boxing Random",
  "Brawl Guys.io","Brawl Simulator 3D","Breaklock","Breath of the Wild NDS",
  "Bridge Race","Brotato","Buildnow.gg","Burrito Bison","Bust-A-Loop",
  "CG FC 25","Call of Duty Nazi Zombie Portable","Candy Crush","Cannon Balls 3D",
  "Cannon Basketball","Cannon Basketball 2","Carrom Clash",
  "CaseOh's Basics in Eating and Fast Food","Cat Connection",
  "Cat Gunner - Super Zombie Shoot","Cave Story","Celeste","Celeste PICO-8",
  "Cheese Chompers 3D","Cheese Rolling","Chess Classics","Chiikawa Puzzle",
  "Choppy Orc","Christmas Massacre","CircleO","CircleO 2","City Smash",
  "Clash of Vikings","Class of 09","Clothing Shop 3D","Clover Pit",
  "Cluster Truck","Code Editor","Color Match","Color Water Sort 3D",
  "Cookie Clicker","Cooking Mama","Cooking Mama 2","Cooking Mama 3",
  "Core Ball","Crazy Cars","Crazy Chicken 3D","Crazy Kitty 3D","Crossy Road",
  "Cubefield","Cuphead","Cut the Rope","Cut the Rope Holiday",
  "Cut the Rope Time Travel","DON'T YOU LECTURE ME","DOOM","Dadish",
  "Dadish 2","Dadish 3","Dadish 3D","Daily Dadish","Dan the Man","Dead Plate",
  "Death Run 3D","Deltatraveler","Dice a Million","Dig Deep",
  "Do NOT Take This Cat Home","Doge Miner","Doodle Jump","Doom 2","Doom 3",
  "Dragon Vs Bricks","Draw Climber","Draw Joust","Draw the Line",
  "Dreadhead Parkour","Drift Boss","Drift Hunters","Drive Mad","Driven Wild",
  "Duck Life","Duck Life 2","Duck Life 3","Duck Life 4","Duck Life 5","Duck Life 8",
  "Dumb Ways to Die","Elastic Man","EmulatorJS","Endoparasitic",
  "Endoparasitic 2","Endroll","Escape Road","Escape Road City 2","Evil Glitch",
  "EvoWars.io","Evolving Bombs 3D","FIFA 10","FIFA 11","FISH","Fallout",
  "Famidash","Fancy Pants Adventure","Fancy Pants Adventure 2",
  "Fancy Pants Adventure 3","Fancy Pants Adventure 4 Part 1",
  "Fancy Pants Adventure 4 Part 2","Fears to Fathom Home Alone",
  "Final Fantasy 7 (Disk 1)","Fireboy & Watergirl 2 Light Temple",
  "Fireboy & Watergirl 3 Ice Temple","Five Night's at Shrek's Hotel",
  "Five Nights At Candys","Five Nights At Candys 2","Five Nights at Epstein's",
  "Five Nights at Freddy's","Five Nights at Freddy's 2",
  "Five Nights at Freddy's 3","Five Nights at Freddy's 4",
  "Five Nights at Freddy's 4_ Halloween","Five Nights at Freddy's_ Pizza Simulator",
  "Five Nights at Freddy's_ Sister Location",
  "Five Nights at Freddy's_ Ultimate Custom Night",
  "Five Nights at Freddy's_ World","Five Nights at Freddy's_ World Refreshed",
  "Five Nights at Last Breath","Five Nights at Winston's","Flappy Bird",
  "Flappy Dunk","Flying Gorilla 3D","Football Bros","Fork N Sausage",
  "Fortzone Battle Royale","Friday Night Funkin",
  "Friday Night Funkin 17 Buck Floor 1","Friday Night Funkin B-Sides",
  "Friday Night Funkin BopCity","Friday Night Funkin Cyber Sensation",
  "Friday Night Funkin Darkness Takeover",
  "Friday Night Funkin FIRE IN THE HOLE Lobotomy Dash Funkin",
  "Friday Night Funkin Hit Single Real","Friday Night Funkin Indie Cross",
  "Friday Night Funkin Jeffy's Endless Aethos",
  "Friday Night Funkin Mario's Madness",
  "Friday Night Funkin Mistful Crimson Morning Reboot",
  "Friday Night Funkin Neo","Friday Night Funkin Pibby Apocalypse",
  "Friday Night Funkin Sarvente's Mid-Fight Masses","Friday Night Funkin Soft",
  "Friday Night Funkin Sonic EXE 4.0","Friday Night Funkin Sonic Legacy",
  "Friday Night Funkin Sunday Night Suicide (Rookie Edition)",
  "Friday Night Funkin Twiddlefinger","Friday Night Funkin VS Impostor v4",
  "Friday Night Funkin VS. KAPI","Friday Night Funkin Vs. Dave and Bambi v3",
  "Friday Night Funkin vs Bob v2.0 (Bob's Onslaught)",
  "Friday Night Funkin vs Carol V2","Friday Night Funkin vs Creepypasta JP",
  "Friday Night Funkin vs Garcello","Friday Night Funkin vs Hatsune Miku",
  "Friday Night Funkin vs Hex","Friday Night Funkin vs Hypno's Lullaby",
  "Friday Night Funkin vs Hypno's Lullaby V2",
  "Friday Night Funkin vs Imposter Alternate","Friday Night Funkin vs Nonsense",
  "Friday Night Funkin vs Shaggy","Friday Night Funkin vs Sky",
  "Friday Night Funkin vs Tricky","Friday Night Funkin vs Undertale",
  "Friday Night Funkin'_ V.S. Whitty","Friday Night Funkin'_ vs. QT",
  "Friday Night Funkin' Wednesday's Infidelity",
  "Fruit Ninja","Fused 240","Gameboy Advance Emulator","Generic Fighter Maybe",
  "Get Yoked","Getaway Shootout","Getting Over It with Bennett Foddy",
  "Gladihoppers","Gobble","God's Flesh","Godzilla Diakaiju Battle Royale",
  "Going Balls","Google Feud","Gorilla Tag","Grand Theft Auto Vice City",
  "Granny","Granny 2","Granny 3","Groon Groon","Growden.io",
  "Guess Their Answer","Gunspin","Half Life","Half Life_ Opposing Force",
  "Happy Sheepies","Happy Wheels","Harvest.io","Hide N Seek",
  "Highway Racer","Highway Racer 2","Highway Racer 2 REMASTERED",
  "Hill Climb Racing Lite","Hobo","Hobo 2","Hobo 3","Hobo 4",
  "Hobo 5","Hobo 6","Hobo 7","Hollow Knight","Hollow Knight_ Silksong",
  "Hotline Miami","House of Hazards","Hypper Sandbox","Ice Dodo",
  "Idle Breakout","Idle Dice","Idle Lumber Inc.","Idle Mining Empire",
  "In Stars and Time","Iron Lung","JavascriptPS1",
  "Jeffrey Epstein Basics In Education And Kidnapping","Jelly Drift",
  "Jelly Mario","Jelly Resturant","Jetpack Joyride","Johnny Trigger",
  "Journey Downhill","Jumbo Mario","JustFall.lol","Karlson",
  "Kindergarten","Kindergarten 2","Kindergarten 3","Kirby Super Star Ultra",
  "Kitchen Bazar","KittyToy","Lacey's Flash Games",
  "Learn 2 Fly","Learn 2 Fly 2","Learn 2 Fly 3","Learn 2 Fly Idle",
  "Line Rider","Little Runmo","Love Letters","Madalin Stunt Cars 2",
  "Madalin Stunt Cars 3","Magic Tiles 3","Match Triple 3D","Meat Boy",
  "Melon Playground","Metal Gear Solid","Midnight Shift",
  "Minecraft 1.5.2","Minecraft 1.8.8","Minecraft 1.12.2","Minecraft 1.21.4",
  "Minecraft Alpha 1.2.6","Minecraft Beta 1.3","Minecraft Beta 1.7.3",
  "Minecraft Indev","Minecraft Pocket Edition","Minesweeper Mania",
  "MinesweeperPlus","Mob Control","Monkey Mart","Monster Tracks",
  "Moto X3M","Moto X3M 2","Moto X3M 3","Moto X3M Pool Party",
  "Moto X3M Spooky","Moto X3M Winter","Mountain Bike Racer","My Teardrop",
  "N-gon","Newgrounds Rumble","Ninja vs EVILCORP","Nubby's Number Factory",
  "Off","OffRoad Mountain Bike","Omori","Oneshot Legacy","Orange Roulette",
  "Oshi Oshi Punch","OvO","OvO 2","OvO Dimensions",
  "Pac-Man Superfest","Pac-man (Horror)","Pac-man World","Pac-man World 2",
  "Papa's Bakeria","Papa's Burgeria","Papa's Cheeseria","Papa's Cupcakeria",
  "Papa's Donutria","Papa's Freezeria","Papa's Hot Dogeria","Papa's Pancakeria",
  "Papa's Pastaria","Papa's Pizzeria","Papa's Scooperia","Papa's Sushiria",
  "Papa's Taco Mia","Papa's Wingeria","Paper.io 2","Papers Please",
  "Papery Planes","Parappa The Rapper","Parking Fury 3D","Parking Rush",
  "Peggle","People Playground","Pico's School","Pixel Gun Survival",
  "Pizza Tower","Pizza Tower Scoutdigo","Plants vs Zombies",
  "Please Dont Touch Anything","Plinko","Pokemon Emerald","Pokemon Red",
  "Pokey Ball","Portaboy+","Pottery Master","Pou","Power Hover","Protektor",
  "PvZ2 Gardenless","Quake 3 Arena","R.E.P.O.","RE RUN",
  "Race Master","Race Master 3D","Raft","Raft Wars","Raft Wars 2",
  "Ragdoll Archers","Ragdoll Hit","Rainbow Obby","Raldi's Crackhouse",
  "Real Flight Simulator","Recoil","Red Ball","Red Ball 2","Red Ball 3",
  "Red Ball 4","Red Ball 4 Vol. 2","Red Ball 4 Vol. 3",
  "Resident Evil","Resident Evil 2","Retro Bowl","Retro Bowl College",
  "Riddle School","Riddle School 2","Riddle School 3","Riddle School 4",
  "Riddle School 5","Riddle Transfer","Riddle Transfer 2","RigBMX","RigBMX 2",
  "Road of Fury Desert Strike","Rogue Sergent The Final Operation",
  "Rolling Sky","Rolly Vortex","Rooftop Snipers","Rooftop Snipers 2",
  "Room Sort","Royal Towers_ Medieval TD","Run","Run 2","Run 3",
  "Sandboxels","Sandspiel","Sandstone","Sandtris",
  "Scary Shawarma Kiosk_ the ANOMALY","Schoolboy Runaway","Scrap Metal 3",
  "Shapez.io","Shift at Midnight","Shipo.io","ShredSauce","Side Effects",
  "Sky Riders","Slender The Eight Pages","Slice It All","Slime Rancher",
  "Slither.io","Slope","Slope 2","Slowroads","Smash Karts","Snow Rider 3D",
  "Snowbattle.io","Soccer Random","Solar Smash","Sonic 2 Community Cut",
  "Sonic 3 Angel Island Remastered","Sonic CD","Sonic Mania",
  "Sonic Robo Blast 2","Sort The Court!","Soundboard","Space Waves",
  "Speed Stars","Spelunky Classic HD","Spider Doll","Sprunki",
  "State.io","Station 141","Station Saturn","Steal A Brainrot",
  "Stick War_ Legacy","Stick With It","Stickman & Guns","Stickman Boost",
  "Stickman Climb","Stickman Duel","Stickman Fight Ragdoll","Stickman Golf",
  "Stickman Hook","Stickman Kombat 2D","Sticky Dash",
  "Subway Surfers Barcelona","Subway Surfers Beijing","Subway Surfers Berlin",
  "Subway Surfers Buenos Aires","Subway Surfers Havana","Subway Surfers Houston",
  "Subway Surfers Iceland","Subway Surfers London","Subway Surfers Mexico",
  "Subway Surfers Miami","Subway Surfers Monaco","Subway Surfers New Orleans",
  "Subway Surfers St. Petersburg","Subway Surfers Winter Holiday",
  "Subway Surfers Zurich","Subway Surfers_ San Francisco",
  "Suika Game","Super Mario 63","Super Mario 64",
  "Super Mario Bros.","Super Mario Bros. Remastered","Super Monkey Ball 1&2",
  "Super Smash Flash","Super Star Car","Superhot","Supreme Duelist",
  "Survival Race","Survivor.io","Swordfight","Swords & Souls",
  "Tall Man Run","Tall.io","Tanuki Sunset","Tattletail","Temple Run 2",
  "Ten Minutes Till Dawn","Terraria","Territorial.io","Tetris",
  "That's Not My Neighbor","The Deadseat","The Final Earth 2",
  "The Impossible Quiz","The Legend Of Zelda Ocarina of Time",
  "The Legend of Zelda Majora's Mask","The Man From The Window",
  "The Man In The Window","The Oregon Trail (Text Version)",
  "The World's Hardest Game","The World's Hardest Game 3",
  "The World's Hardest Game 4","They Are Coming",
  "This is the Only Level","This is the Only Level 2","Tiletopia",
  "Time Shooter 1","Time Shooter 2","Time Shooter 3_ SWAT",
  "Tiny Fishing","Tomb of the Mask","Tomodachi Collection","Toss the Turtle",
  "Touhou Luminous Strike","Touhou Mother","Tower Crash 3D","Toy Rider",
  "Traffic Racer","Traffic Rider","Trivia Crack","Tube Jumpers",
  "Tunnel Rush","Turbo Stars","ULTRAKILL","Ultrapool",
  "Undertale","Undertale Last Breath PHASE THREE","Undertale Yellow",
  "Undertale_ Last Breath","Untitled Goose Game","VS Rewrite_ ROUND 2",
  "Vex","Vex 2","Vex 3","Vex 3 Xmas","Vex 4","Vex 5","Vex 6","Vex 7","Vex 8",
  "Vex Challenges","Vex X3M","Vex X3M 2",
  "War The Knights","Waterworks","We Become What We Behold","Webfishing",
  "Wheely","Wheely 2","Wheely 3","Wheely 4 Time Travel",
  "Wheely 5 Armageddon","Wheely 6 Fairy Tale","Wheely 7 Detective",
  "Wheely 8 Alien","Wordle","World Box","Worst Time Simulator",
  "Yandere Simulator","Yume Nikki",
  "game inside a game inside a game inside a game inside a game inside a game",
  "osu!"
];

// Games that live in a folder — launch index.html inside
const MULTI_FILE_GAMES = new Set(["Among Us"]);

// ── STATE ──
let favorites  = JSON.parse(localStorage.getItem('qrs-favs') || '[]');
let activeFilter = 'all';
let searchQuery  = '';

// ── UTILS ──
function gamePath(name) {
  const enc = encodeURIComponent(name);
  return MULTI_FILE_GAMES.has(name)
    ? `assets/games/${enc}/index.html`
    : `assets/games/${enc}.html`;
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

// ── CLOCK ──
function updateClock() {
  const now  = new Date();
  const hh   = String(now.getHours()).padStart(2, '0');
  const mm   = String(now.getMinutes()).padStart(2, '0');
  const ss   = String(now.getSeconds()).padStart(2, '0');
  const yyyy = now.getFullYear();
  const mo   = String(now.getMonth() + 1).padStart(2, '0');
  const dd   = String(now.getDate()).padStart(2, '0');
  document.getElementById('time-display').textContent = `${hh}:${mm}:${ss}`;
  document.getElementById('date-display').textContent = `${yyyy}-${mo}-${dd}`;
}
setInterval(updateClock, 1000);
updateClock();

// ── THEME ──
const root        = document.documentElement;
const themeBtn    = document.getElementById('theme-toggle');
const themeIcon   = document.getElementById('theme-icon');
const themeLabel  = document.getElementById('theme-label');

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
  let list = GAMES.filter(name => {
    if (activeFilter === 'favorites' && !isFav(name)) return false;
    if (searchQuery && !name.toLowerCase().includes(searchQuery)) return false;
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
  list.forEach((name, i) => {
    const card = document.createElement('div');
    card.className = 'game-card';
    card.style.animationDelay = `${Math.min(i * 8, 300)}ms`;

    const isMulti = MULTI_FILE_GAMES.has(name);
    const faved   = isFav(name);

    card.innerHTML = `
      <div class="card-name">${escHtml(name)}</div>
      <div class="card-meta">
        <span class="card-type${isMulti ? ' multi' : ''}">${isMulti ? 'MULTI' : 'HTML'}</span>
        <button class="fav-btn${faved ? ' is-fav' : ''}" title="${faved ? 'Unfavorite' : 'Favorite'}">
          ${faved ? '★' : '☆'}
        </button>
      </div>`;

    card.querySelector('.fav-btn').addEventListener('click', e => toggleFav(name, e));
    card.addEventListener('click', () => launchGame(name));
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

function launchGame(name) {
  const path = gamePath(name);
  overlayTitle.textContent = name.toUpperCase();
  frame.src = path;
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

// close overlay if clicking outside the frame
overlay.addEventListener('click', e => {
  if (e.target === overlay) closeGame();
});

// ── INIT ──
renderGames();
