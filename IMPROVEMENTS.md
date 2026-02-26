# Minute Adventurer — Improvement Backlog

Planned batches of work. Check off as completed.

---

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

## Future work

- [ ] **Extra scene branch** — Optional side path (e.g. "Search the bog" vs "Stay on trail") with different encounter.
- [ ] **More status effects** — Bleed, slow, stun; additional enemies or abilities that apply them.
- [ ] **Gold / economy** — Wolf Pelt has `value` field; add a merchant NPC or shop at trail_end.
- [ ] **Second adventure** — New adventure beyond The Muddy Trail (Whispering Bog? Iron Hollows?).
- [ ] **Data validation** — Script to check data.js integrity (scene exits, enemy refs, item refs).

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

- [ ] All interactive elements keyboard-focusable and visible focus ring.
- [ ] ARIA labels and roles correct for modals, dialogs, tabs.
- [ ] Contrast: text/background meets target (e.g. 7:1 for AAA); check new palette.

### Content & copy

- [x] Death quotes consistent in tone (added spider/wolf quotes).
- [x] No placeholder or "TODO" strings in player-facing text.

### Optional automation

- [ ] If introducing a build step later: run a simple lint or size check.
- [ ] Manual smoke test: new run -> trailhead -> midway -> ooze -> post_ooze -> spider_ambush -> post_spider -> wolf_den -> post_wolf -> trail_end; save/load; combat actions; poison/antidote.

---

## Reference

- **Game state:** `activeRun`, `manualSaves`, `quickSave`, `journalMeta`, `gameSettings` (see AGENTS.md).
- **Modules:** PA, SP, CL, CALC, GS, CMB, SE, UI, ML, CC + helpers (`useConsumable`, `rollLoot`).
- **Data (in data.js):** ENEMIES, ITEMS, NPCS, SCENE_DATA, DEATH_QUOTES.
