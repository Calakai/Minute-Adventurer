# AGENTS.md

## Cursor Cloud specific instructions

### Overview

Minute Adventurer is a zero-dependency static PWA (Progressive Web App) — a text-based dark fantasy adventure game. The entire application is a single `index.html` with inline CSS and JS, plus `manifest.json`, `sw.js`, and icon assets. There is no package manager, no build system, no linting, and no automated test suite.

### Running the dev server

Serve the project root with any static HTTP server. The simplest option:

```
python3 -m http.server 8080
```

Then open `http://localhost:8080/index.html` in Chrome. The PWA service worker and manifest require HTTP (not `file://`) to function.

### Notes

- There are no dependencies to install, no `package.json`, no build step, and no lint/test commands.
- The service worker (`sw.js`) caches assets aggressively; if you modify files, do a hard refresh or clear the cache in DevTools.
- All game state is stored in browser `localStorage` under keys: `activeRun`, `manualSaves`, `quickSave`, `journalMeta`, and optionally `gameSettings` (high contrast, larger text).
- The game uses `index.html` (engine + UI) and `data.js` (ENEMIES, ITEMS, NPCS, SCENE_DATA, DEATH_QUOTES). Game logic modules (PA, SP, CL, CALC, GS, CMB, SE) are distinct from UI modules (UI, ML, CC). Play is choice-only: no text input; use the Actions button and scene/nav buttons.
- Combat state includes `debuffs` array on the run object (e.g. poison from Giant Spider). Consumables use a shared `useConsumable()` helper.
- The trail has 9 scenes: trailhead, midway, ooze, post_ooze, spider_ambush, post_spider, wolf_den, post_wolf, trail_end. Three enemies: Gray Ooze, Giant Spider (poison), Dire Wolf.
- The UI uses CSS custom properties defined in `:root`. Both new names (`--text`, `--text2`, `--border`) and legacy aliases (`--t1`, `--t2`, `--brd`) exist for backward compatibility with JS inline styles.
- When testing, clear `localStorage` to see the landing screen (no active save). With an active save, the landing screen shows Continue/New Adventure/Load Game buttons.
