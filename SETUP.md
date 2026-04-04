# Cool Science Games — Setup Guide

## Folder Structure

```
coolsciencegames/
├── index.html
├── script.js
├── style.css
├── assets/
│   ├── games/          ← put all your games here
│   ├── apps/           ← put all your apps here
│   └── thumbnails/     ← optional custom cover images
```

---

## Adding Games

### Single-file game
Drop any `.html` file into `assets/games/`:
```
assets/games/snake.html
assets/games/tetris.html
```

### Multi-file game (folder)
Create a folder inside `assets/games/` with an `index.html` inside:
```
assets/games/my-cool-game/
    index.html
    game.js
    style.css
    assets/
```
The site will auto-detect the folder and use `index.html` as the entry point.

---

## Adding Apps

Same as games, but put files in `assets/apps/` instead:
```
assets/apps/calculator.html
assets/apps/notepad/
    index.html
    app.js
```

---

## Automatic Game Images

Game cards automatically fetch a relevant image from the internet based on
the game's name — no setup needed. Every game always gets the same image
(deterministic, not random on each load).

**To use your own custom cover image instead:**
1. Name the image the same as your game file (no extension), e.g.:
   - Game file: `assets/games/snake.html` → Image: `assets/thumbnails/snake.jpg`
   - Folder game: `assets/games/my-cool-game/` → Image: `assets/thumbnails/my-cool-game.jpg`
2. Supported formats: `.jpg` (recommended), `.png`, `.webp`
3. Recommended size: **300×300px** (square)

The custom thumbnail takes priority over the auto-fetched image.

---

## Recently Added Detection

The site automatically tracks which games are new:
- **First visit:** all current games are saved as the baseline.
- **After you push new games:** on the next page load, the site compares
  the new list against the saved baseline and shows new additions under
  **"Recently Added"** on the Main Menu.

No extra steps needed — just push your files and the detection is automatic.

---

## Migrating Existing Games

If your games are currently in `assets/` (root), move them to `assets/games/`:

```bash
# In your repo root
mv assets/*.html assets/games/
```

Then commit and push:
```bash
git add .
git commit -m "Move games to assets/games/"
git push
```

The site also falls back to loading from `assets/` directly if `assets/games/`
is empty, so existing deploys won't break until you migrate.

---

## Tab Cloaking

Go to **Settings** → **Tab Cloak** to disguise the browser tab as:
- Schoology, Google Classroom, Zoom, Google, or YouTube

---

## Themes

Go to **Settings** → **Theme** to pick from 22 built-in themes, or create a
fully custom theme with your own colors and font.
