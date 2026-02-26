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

- There are no dependencies to install, no `package.json`, no build step, and no lint/test commands. A data validation script (`node validate.js`) checks `data.js` integrity (scene exits, enemy refs, NPC refs, loot item refs).
- The service worker (`sw.js`) caches assets aggressively; if you modify files, do a hard refresh or clear the cache in DevTools.
- All game state is stored in browser `localStorage` under keys: `activeRun`, `manualSaves`, `quickSave`, `journalMeta`, and optionally `gameSettings` (high contrast, larger text). The run object includes `gold` (integer), `adventure` (string: `'muddy_trail'` or `'iron_hollows'`), and `debuffs` (array). Save data is validated on load via `GS._validateSave()`.
- The game uses `index.html` (engine + UI) and `data.js` (ENEMIES, ITEMS, NPCS, SCENE_DATA, DEATH_QUOTES). Game logic modules (PA, SP, CL, CALC, GS, CMB, SE) are distinct from UI modules (UI, ML, CC). Play is choice-only: no text input; use the Actions button and scene/nav buttons.
- Two adventures exist: The Muddy Trail (11 scenes) and The Iron Hollows (9 scenes). After completing the Muddy Trail, the player can continue to Iron Hollows keeping their character (level, gear, gold). The `adventure` field on the run state tracks which adventure is active. `SE.startAdventure(advId)` transitions between adventures.
- Combat uses a zone system (Close/Mid/Far) instead of meter-based distance. Combat state (`cs`) includes `playerZone`, `turnCount`, `freeMovedThisCombat`, and `blocking`. Movement between zones costs the player's action, with free-move exceptions for Quickfoot Halflings, Rogues (toward Close), and characters with Movement >= 7 (once per combat). Melee attacks require Close zone; ranged attacks work from any zone with penalties at Close (-15%) and Far (-10%). Block halves incoming damage for one round. Fleeing is only possible from Mid/Far and a failed flee gives the enemy a free attack. Enemy AI uses `preferredZone` (defined per enemy in `data.js`).
- Combat state includes `debuffs` array on the run object. Debuff types: poison (from Giant Spider), bleed (from Dire Wolf), slow (from Cave Crawler — halves movement), stun (from Mine Shade — skips player action). The tick logic is generic; 0-dmg debuffs skip damage but still tick duration. Consumables use a shared `useConsumable()` helper.
- Seven enemies: Gray Ooze, Giant Spider (poison), Dire Wolf (bleed), Bog Wraith, Cave Crawler (slow), Mine Shade (stun), Iron Golem (boss). Four NPCs: Aldric (gatekeeper), Mira (healer), Garrett (merchant), Torgun (Iron Hollows, heals on first visit).
- Error handling: toast notifications (`showToast`) for user-facing errors; global error boundary (`window.onerror`, `unhandledrejection`) with auto-save; character creation input validation with shake/hint feedback; combat edge-case guards (`CALC.safeDmg` for NaN protection, dead entity checks); scene navigation guards for undefined scenes and exits.
- The UI uses CSS custom properties defined in `:root`. `--text3` meets WCAG AA contrast. High-contrast mode overrides include `--text3`.
- Pixel art assets (HUD icons, species portraits, class icons) are rendered via 2D JS arrays in the `PA` module. Icons are 8x8; portraits and class icons are 16x16. Style: dark silhouettes, max 6 colors, 1px outlines.
- When testing, clear `localStorage` to see the landing screen (no active save). With an active save, the landing screen shows Continue/New Adventure/Load Game buttons.
