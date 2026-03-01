# Minute Adventurer — Improvement Backlog

Planned batches of work. Check off as completed.

---

## Done (batch 6 — v0.8)

- [x] **Zone-based combat** — Replaced meter distance with Close/Mid/Far zones. Melee requires Close; ranged works from any zone with penalties at Close (-15%) and Far (-10%). Movement between zones costs an action.
- [x] **Free movement exceptions** — Quickfoot Halflings, Rogues (toward Close), and characters with Movement >= 7 get one free zone move per combat.
- [x] **Block rework** — Block now halves incoming damage for one round instead of flat reduction.
- [x] **Flee rework** — Fleeing only possible from Mid/Far zones; failed flee gives enemy a free attack.
- [x] **Enemy zone AI** — Melee enemies close in; ranged enemies retreat to Mid if at Close. Enemies use `preferredZone` field.
- [x] **Combat pacing** — 0.4s pause between player/enemy turns; double-click prevention on combat buttons.
- [x] **Toast notifications** — `showToast(message, type)` system with auto-dismiss, slide-up animation, info/error/success variants.
- [x] **Global error boundary** — `window.onerror` and `unhandledrejection` handlers with auto-save.
- [x] **Save/load hardening** — `_validateSave()` integrity check, quota error handling, corruption recovery with toast feedback.
- [x] **Character creation validation** — Name trimming/length check with shake animation, visual hints for missing selections.
- [x] **Combat edge-case guards** — HP/damage clamping (`CALC.safeDmg`), NaN protection, dead entity checks, invalid zone reset, missing enemy graceful exit.
- [x] **Scene navigation safety** — Guarded `SE.enter()` against undefined scenes, filtered exits for missing destinations, logged unknown NPCs.
- [x] **Pixel art redesign** — Redesigned 6 HUD icons, 5 species portraits, and 6 class icons with clearer silhouettes, 6-color max, 1px outlines.
- [x] **Gameplay balance audit** — Verified 5 combat scenarios, all 9 subspecies traits, and all 6 class abilities work correctly with zone system.

## Done (batch 5 — v0.7)

- [x] **Second adventure** — Iron Hollows: 9 new scenes, 3 enemies (Cave Crawler, Mine Shade, Iron Golem), 2 items (Dwarven Ale, Iron Shard), NPC Torgun. Player continues with existing character.
- [x] **More status effects** — Slow (halves movement, from Cave Crawler) and stun (skips player action, from Mine Shade). Generic 0-dmg debuff tick support.
- [x] **Data validation** — `validate.js` Node script checks scene exits, enemy refs, NPC refs, loot item refs.
- [x] **Accessibility: keyboard** — `tabindex="-1"` on narrative container; auto-focus first interactive after scene enter.
- [x] **Accessibility: ARIA** — `aria-label` on gold display; `role=tablist`/`tabpanel` and `aria-selected` on character modal tabs.
- [x] **Accessibility: contrast** — Bumped `--text3` to `#847a6c` (~4.6:1 AA); high-contrast mode `--text3` to `#9a9080` (~6.5:1).

## Done (batch 4 — v0.6)

- [x] **Gold / economy** — Gold field on run state; enemies drop gold on defeat; items have sell values; Sell button in backpack.
- [x] **Merchant NPC** — Garrett the Peddler at trail_end; buy (Health Potion 12g, Mana Potion 12g, Antidote 10g) and sell flow.
- [x] **New item** — Marsh Root (consumable, heals 5 HP, value 5g); drops from Bog Wraith.
- [x] **Bleed status effect** — Dire Wolf applies bleed (30% chance, 1 dmg/turn, 3 turns); Stoneblood immune; generic debuff tick.

## Done (batch 3 — v0.5)

- [x] **Extra scene branch** — Whispering Bog optional side path from midway; Bog Wraith enemy; Gather Herbs search yields Mana Potion.

## Done (batch 2 — v0.4)

- [x] **More enemies** — Giant Spider (poison, ranged) and Dire Wolf (fast melee).
- [x] **More items** — Mana Potion, Antidote, Wolf Pelt.
- [x] **New scenes** — spider_ambush, post_spider, wolf_den, post_wolf (trail is now 9 scenes).
- [x] **Richer NPC dialogue** — Aldric warns about spiders/wolves on return visits; Mira heals on revisit, hints at Whispering Bog and Iron Hollows.
- [x] **Combat item use** — Full consumable support: Health Potion, Mana Potion, Antidote all usable in combat and explore.
- [x] **Status effects** — Poison (DoT) from Giant Spider; Antidote cures; Stoneblood dwarves immune; ticks at start of player turn.
- [x] **Loot table** — Weighted per-enemy loot; shown in victory card with Take/Leave buttons.
- [x] **Data extraction** — ENEMIES, ITEMS, NPCS, SCENE_DATA, DEATH_QUOTES moved to `data.js`.
- [x] **Audit: dead code** — Removed legacy CSS variable aliases (`--t1`, `--t2`, etc.); no CP references remain.
- [x] **Audit: naming** — All legacy CSS var aliases removed; only canonical names (`--text`, `--text2`, `--border` etc.) remain.
- [x] **Audit: dedup** — Shared `useConsumable()` helper used by action sheet, backpack modal, and combat.
- [x] **Audit: a11y & copy** — Added death quotes for spiders/wolves; verified bestiary auto-populates for new enemies; all buttons have text labels.

## Done (batch 1 — v0.3)

- [x] **Choice-only UI** — Removed text input; all actions via Actions sheet + scene/nav buttons.
- [x] **New color palette** — Replaced blue theme with warm amber/umber palette.
- [x] **Menu extras** — Changelog, How to play, optional high contrast and font size in Menu.
- [x] **Audit & cleanup process** — Documented below; run periodically.
- [x] **Backlog and data-extraction plan** — This file; data.js extraction documented.

---

## Done (batch 7 — v0.9)

- [x] **Combat overhaul** — Enemy HP bars with animated fill and color transitions (green/amber/red). Tier badges on enemy names. Screen shake and red/gold flash on hit. Floating damage/miss popups. Variable suspense delay between player and enemy turns scaled by tier.
- [x] **Enemy tiers** — 5-tier system (Common, Uncommon, Dangerous, Elite, Boss) assigned to all 7 enemies. Tier badge colors: text3, text, gold, red, purple. Tier data on ENEMIES in data.js.
- [x] **Multi-wave encounters** — `scene.events.combat` now supports arrays for sequential waves. HP/MP carry over. Loot collected per wave. Victory only after all waves cleared. Backward compatible with single-string combat fields.
- [x] **Quick Resolve** — When player level >= tier*3+2, a "Quick Resolve" button appears at combat start. Auto-calculates outcome with minimal damage, grants full XP/gold/loot. Skips turn-by-turn for trivial fights.
- [x] **Hearthstone Tavern** — New hub scene (`tavern_hub`) accessible from trailhead, trail_end, ih_entrance, ih_exit. NPC Brynn the Innkeeper (heals, directs to bounty board).
- [x] **Bounty Board** — 7 bounties across all 5 tiers in `BOUNTIES` data. Board shows up to 5 randomly selected bounties weighted by player level. Accept → combat in `bounty_arena` → reward + return to tavern. Refresh button re-rolls available bounties.
- [x] **Quest system** — 7 one-off quests in `QUESTS` data with progress tracking. Accept from bounty board, progress tracked automatically via `_trackQuestProgress()`. Completion rewards (gold, XP, items) with toast notification. State persisted in `activeQuests`, `completedQuests`, `questProgress`.
- [x] **Bounty combat** — Generic `bounty_arena` scene with dynamic description and enemy. Non-lethal defeat (HP set to 1, returned to tavern). Victory triggers `completeBounty()` with bonus rewards on top of normal combat drops.
- [x] **Save compatibility** — `_validateSave()` backfills `activeQuests`, `completedQuests`, `questProgress`, `activeBounty`, `bountyBoard` for old saves.

## Future work

- [ ] **Third adventure** — Another continuation beyond Iron Hollows.
- [ ] **More items/enemies** — Expand loot variety and encounter diversity.

---

## Audit & cleanup process

Run periodically (e.g. before a release or after a batch of features).

### Code

- [x] Remove dead code (unused functions, unused CSS, commented blocks).
- [x] Unify naming: canonical CSS vars only.
- [x] Consolidate duplicate logic (shared `useConsumable()` helper).
- [x] Single source of truth for "current available actions" (SE.getActions() used by action sheet).

### Data & structure

- [x] No orphaned scene IDs or missing ENEMIES/ITEMS/NPCS references.
- [x] localStorage keys documented (activeRun, manualSaves, quickSave, journalMeta, gameSettings).

### Accessibility

- [x] All interactive elements keyboard-focusable and visible focus ring.
- [x] ARIA labels and roles correct for modals, dialogs, tabs.
- [x] Contrast: text/background meets target (AA minimum); `--text3` bumped to `#847a6c`.

### Content & copy

- [x] Death quotes consistent in tone (added spider/wolf quotes).
- [x] No placeholder or "TODO" strings in player-facing text.

### Optional automation

- [ ] If introducing a build step later: run a simple lint or size check.
- [ ] Manual smoke test: new run -> trailhead -> tavern_hub (talk to Brynn, check bounty board, accept bounty, complete bounty, accept quest) -> trailhead -> midway -> (optional: whispering_bog -> post_bog -> midway) -> ooze -> post_ooze -> spider_ambush -> post_spider -> wolf_den -> post_wolf -> trail_end -> continue to Iron Hollows -> ih_entrance -> ih_tunnels -> ih_crawler_lair -> ih_post_crawler -> ih_shade_hall -> ih_post_shade -> ih_forge -> ih_post_golem -> ih_exit; save/load; zone-based combat (close/mid/far movement, block, flee); debuffs (poison/bleed/slow/stun); gold/buy/sell with Garrett; toast notifications; error recovery; enemy HP bars + tier badges; visual FX (damage popups, screen shake, flash); quick resolve for trivial fights; bounty board gameplay loop.

---

## Reference

- **Game state:** `activeRun`, `manualSaves`, `quickSave`, `journalMeta`, `gameSettings` (see AGENTS.md).
- **Modules:** PA, SP, CL, CALC, GS, CMB, SE, UI, ML, CC + helpers (`useConsumable`, `rollLoot`).
- **Data (in data.js):** ENEMIES, ITEMS, NPCS, SCENE_DATA, DEATH_QUOTES.
- **Validation:** `node validate.js` checks all data.js cross-references.
