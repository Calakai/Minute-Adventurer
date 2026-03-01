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
- All game state is stored in browser `localStorage` under keys: `activeRun`, `manualSaves`, `quickSave`, `journalMeta`, and optionally `gameSettings` (high contrast, larger text). The run object includes `gold` (integer), `adventure` (string: `'muddy_trail'`, `'iron_hollows'`, or `'ashen_waste'`), `debuffs` (array), `activeBounty` (object or null), `bountyBoard` (array or null), `activeQuests` (array), `completedQuests` (object), and `questProgress` (object). Save data is validated on load via `GS._validateSave()` which backfills missing quest/bounty fields.
- The game uses `index.html` (engine + UI) and `data.js` (ENEMIES, ITEMS, NPCS, SCENE_DATA, DEATH_QUOTES, BOUNTIES, QUESTS). Game logic modules (PA, SP, CL, CALC, GS, CMB, SE) are distinct from UI modules (UI, ML, CC). Play is choice-only: no text input; use the Actions button and scene/nav buttons.
- Three adventures exist: The Muddy Trail (11 scenes), The Iron Hollows (9 scenes), and The Ashen Waste (10 scenes). After completing each adventure, the player can continue to the next keeping their character (level, gear, gold). The `adventure` field on the run state tracks which adventure is active. `SE.startAdventure(advId)` transitions between adventures.
- Combat uses a zone system (Close/Mid/Far) instead of meter-based distance. Combat state (`cs`) includes `playerZone`, `turnCount`, `freeMovedThisCombat`, and `blocking`. Movement between zones costs the player's action, with free-move exceptions for Quickfoot Halflings, Rogues (toward Close), and characters with Movement >= 7 (once per combat). Melee attacks require Close zone; ranged attacks work from any zone with penalties at Close (-15%) and Far (-10%). Block halves incoming damage for one round. Fleeing is only possible from Mid/Far and a failed flee gives the enemy a free attack. Enemy AI uses `preferredZone` (defined per enemy in `data.js`).
- Combat state includes `debuffs` array on the run object. Debuff types: poison, bleed, slow, stun, burn, curse (-10% hit), blind (-20% hit), weaken (-1 damage). The tick logic is generic; 0-dmg debuffs skip damage but still tick duration. Consumables use a shared `useConsumable()` helper that supports combined heal+mana+cure items.
- 39 enemies across 5 tiers. 17 NPCs (5 with hardcoded dialogue, 12 with data-driven dialogue trees). Each class has 3 abilities unlocked at levels 1, 4, and 8 via `abilities` array with `unlockLevel` field. `getAbilities(r)` returns unlocked abilities for the current level.
- Enemies have a `tier` field (1–5: Common, Uncommon, Dangerous, Elite, Boss). Tier affects HP bar color, badge display, bounty rewards, and quick-resolve eligibility. `TIER_LABELS` maps tier numbers to names.
- Combat UI features an enemy HP bar (`#enemy-hp-wrap`) with animated fill and tier-colored name badge. Visual feedback: screen shake on player hit, red/gold flash overlay (`#hit-flash`), floating damage/miss popups (`.dmg-pop`). Turn pacing uses variable suspense delay scaled by enemy tier.
- Multi-wave encounters: `scene.events.combat` can be a string (single enemy) or array (sequential waves). `_startCombat` handles both. HP/MP carry over between waves. Loot per wave; victory after all waves.
- Quick Resolve: when `player.level >= enemy.tier * 3 + 2`, a "Quick Resolve" button appears at combat start, auto-resolving the fight with minimal damage.
- The Hearthstone Tavern (`tavern_hub`) is a hub with 4 sub-scenes: tavern_hub (Brynn, Finn), market_square (Elara, Rook, Durak, Brother Cedric), guard_post (Captain Vane, Thorne), tavern_cellar (Whisper, Old Sana). Accessible from trailhead, trail_end, ih_entrance, ih_exit, and ash_gate.
- Data-driven NPC dialogue: NPCs with a `dialogue` property use `SE.talkNPC(nid)` which walks a tree structure with `initial`/`returning` entry points, `options` for choices, `next` for navigation, and `effect` for gameplay triggers (`'heal'`, `'shop'`, `'bounty_board'`, `'give_item:key'`).
- Generic shop system: NPCs with a `shop.stock` array use `SE.openShop(nid)` for buy/sell UI. Multiple merchants: Elara (weapons/armor), Rook (weapons), Whisper (rare items), Brother Cedric (cures/potions), Grizelda (potions), Durak (heavy weapons).
- Lootable gear: backpack equip buttons for `armor`, `shield`, `quiver`, `spellbook`, `light` item types. Equip logic routes to correct slot (`r.arm` for armor, `r.oh` for offhand, `r.wpn` for weapons). Two-handed weapons block offhand equip.
- Bounty system: `BOUNTIES` in `data.js`, 25 bounties across 5 tiers. Board shows up to 5 randomly selected (weighted by level). Accept → `bounty_arena` combat → `completeBounty()` reward → return to tavern. Non-lethal defeat on bounties (HP set to 1, `failBounty()`).
- Quest system: `QUESTS` in `data.js`, 17 one-off quests. Tracked via `r.activeQuests`, `r.completedQuests`, `r.questProgress`. Progress incremented by `_trackQuestProgress(trigger)` on bounty completion and enemy defeats.
- Error handling: toast notifications (`showToast`) for user-facing errors; global error boundary (`window.onerror`, `unhandledrejection`) with auto-save; character creation input validation with shake/hint feedback; combat edge-case guards (`CALC.safeDmg` for NaN protection, dead entity checks); scene navigation guards for undefined scenes and exits.
- The UI uses CSS custom properties defined in `:root`. `--text3` meets WCAG AA contrast. High-contrast mode overrides include `--text3`.
- Pixel art assets (HUD icons, species portraits, class icons) are rendered via 2D JS arrays in the `PA` module. Icons are 8x8; portraits and class icons are 16x16. Style: dark silhouettes, max 6 colors, 1px outlines.
- When testing, clear `localStorage` to see the landing screen (no active save). With an active save, the landing screen shows Continue/New Adventure/Load Game buttons.
