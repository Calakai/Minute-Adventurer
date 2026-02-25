# Class Spec Update Plan

## Overview

The New_CLASS_SPEC document defines a revised class system for Minute Adventurer. Classes no longer modify stats; they provide starting gear, one active ability, and gameplay identity. This plan maps the required changes from the current codebase to the new spec.

---

## 1. Data Structure Changes

### 1.1 Replace CL with CLASSES

**Current:** `CL` object with 4 classes (fighter, paladin, ranger, rogue). Each class has:
- `name`, `desc`, `stats` (string), `statMods`, `defBase`
- `wpn`, `oh`, `arm`, `bp` with different property names

**Target:** `CLASSES` object (or rename `CL` to match spec) with 6 classes. Each class has:
- `name`, `desc` (flavor text only — no stat summary)
- `ability` — `{ name, desc, cost, type, trigger, effect, requirement, conditions? }`
- `startGear` — `{ weapon, offhand, armor, backpack }` with spec property names

**Actions:**
- Remove `statMods` and `defBase` from all classes
- Add **Wizard** and **Berserker** classes
- Update property names: `wpn`→`weapon`, `oh`→`offhand`, `arm`→`armor`, `bp`→`backpack`
- Align weapon/armor/offhand schema (e.g., `dmgDice`, `dmgBonus`, `weight` as string)
- Add `ability` block per class per spec

### 1.2 Weight System

**Current:** Numeric `wt` (0=light, 1=medium, 2=heavy) with `WT_NAMES` lookup.

**Target:** Use string weight (`'light'`, `'medium'`, `'heavy'`) throughout. Spec defines penalties:
- Light: 0
- Medium: -1
- Heavy: -2

**Actions:**
- Add `WEIGHT_PENALTIES` map: `{ light: 0, medium: 1, heavy: 2 }` for penalty calc
- Update `CALC.totalWt()` and `CALC.effMov()` to use string weights
- Ensure equipment items use `weight: 'light'|'medium'|'heavy'`

### 1.3 Two-Handed Weapons

**Current:** Not implemented.

**Target:** Greataxe is two-handed. When equipped:
- Offhand slot displays "Locked (two-handed)" and cannot be used
- Unequipping frees the offhand

**Actions:**
- Add `twoHand: true` to Greataxe in Berserker startGear
- Add `CALC.isOffhandLocked(r)` — true if `r.wpn?.twoHand`
- Equipment tab: when offhand locked, show "Offhand: Locked — Greataxe (two-handed)" in `--text3`, italic
- Prevent equipping offhand items when weapon is two-handed
- On unequip of two-handed weapon, unlock offhand

---

## 2. Game State Changes

### 2.1 Character Creation & Stats

**Current:** `GS.newRun()` merges species stats with `cl.statMods` and `humanBonus`.

**Target:** Stats come from species/subspecies only. Skip class stat contribution.

**Actions:**
- In `GS.newRun()`, remove `c.statMods` from stats calculation
- `buildSum()`: remove `cl.statMods` from stats preview
- `playerDef()` in CALC: remove `CL[r.classes[0]].defBase`; defense comes from armor only

### 2.2 Combat State

**Current:** `GS.run.cs` has `enemy`, `dist`, `turns`, `fled`, `over`, `won`, `movedThisTurn`, `pBlk`.

**Target:** Add:
- `activeBuff: { name, turnsLeft, effect } | null` — class ability buff
- `turns` used for Backstab first-turn check

**Actions:**
- Initialize `activeBuff: null` in `CMB.start()`
- Decrement `activeBuff.turnsLeft` at end of each player turn (for Aggro)
- Clear buff when `turnsLeft` reaches 0; show "The red haze fades from your vision."

### 2.3 Run Schema

**Current:** `run.wpn`, `run.oh`, `run.arm` — property names differ from spec.

**Target:** Can keep `wpn`/`oh`/`arm`/`bp` for backward compatibility, but new runs use spec-compliant structure. Existing saves may need migration for `class` vs `classes`.

---

## 3. Ability System

### 3.1 Ability Types

| Class    | Ability      | Type   | Cost | Trigger / Behavior |
|----------|--------------|--------|------|--------------------|
| Fighter  | Power Strike | buff   | 4 MP | melee_hit, 2× dmg  |
| Paladin  | Holy Light   | heal   | 5 MP | instant 8 HP      |
| Ranger   | Aimed Shot   | buff   | 3 MP | ranged_hit, +20% hit, ignore close penalty |
| Rogue    | Backstab     | buff   | 4 MP | melee_hit, 3× if conditions else 1× |
| Wizard   | Arcane Bolt  | attack | 3 MP | direct 2d6, Smarts-based |
| Berserker| Aggro        | buff   | 5 MP | sustained 3 turns, +2 dmg, +10% hit, +1 incoming |

### 3.2 Implementation Tasks

1. **Combat loop**
   - Before resolving attack: check `activeBuff`; if `trigger === 'melee_hit'` or `'ranged_hit'`, apply effect (dmgMult, hitBonus, etc.) then clear buff.
   - For Aggro: apply `dmgBonus`, `hitBonus`, `incomingDmgBonus` when `activeBuff` is set; decrement at end of turn.

2. **Power Strike**
   - Button in combat when melee range and MP ≥ 4.
   - On use: set `activeBuff = { name: 'Power Strike', effect: { dmgMult: 2 }, trigger: 'melee_hit' }`, spend 4 MP.

3. **Holy Light**
   - Usable in combat and exploration.
   - Combat: add as combat action when MP ≥ 5.
   - Exploration: add to Actions modal when HP < max HP and MP ≥ 5.
   - Heal 8 HP (capped at max).

4. **Aimed Shot**
   - Button when ranged weapon equipped and MP ≥ 3.
   - `activeBuff`: `{ hitBonus: 20, ignoreClosePenalty: true }`, trigger `ranged_hit`.
   - Ranged attack resolution: add 20% to hit; if `ignoreClosePenalty`, skip close-range penalty.

5. **Backstab**
   - Button when melee range and MP ≥ 4. Show "Backstab (3× dmg)" or "Backstab (1× dmg)" based on conditions.
   - Conditions (OR): `first_turn` (combatState.turns === 0) OR `moved_this_turn` (combatState.movedThisTurn).
   - On melee hit: if conditions met, apply 3×; else 1× (MP still spent).

6. **Arcane Bolt**
   - Direct attack, not weapon attack. Range 5–25m. Deals 2d6. Hit chance: 55% + (Smarts−5)×5% − enemy def×3%.
   - Requires Spellbook in offhand. If Smarts ≥ 7, cost 2 MP.
   - Implement as separate attack path in `CMB.pAct('arcane_bolt')` or similar.
   - Primary combat action when Spellbook equipped and MP ≥ cost.

7. **Aggro**
   - Button when MP ≥ 5. Shows "(3 turns)".
   - On use: set `activeBuff = { name: 'Aggro', turnsLeft: 3, effect: { dmgBonus: 2, hitBonus: 10, incomingDmgBonus: 1 } }`.
   - Each player turn end: decrement `turnsLeft`; if 0, clear and show expiry message.
   - HUD/narrative: "Aggro: X turns remaining."

### 3.3 Buff Stacking Rules

- Class buffs do NOT stack. New buff replaces current.
- Class buffs CAN stack with species traits (Bloodrage, Twilight Instinct, etc.).
- Track `activeBuff` separately from trait effects.

### 3.4 Smarts Discount

- If `r.stats.smarts >= 7`, reduce all ability MP costs by 1 (min 1).
- Apply at cost-calculation time, not in data definitions.

---

## 4. UI Changes

### 4.1 Combat Actions

- Add class ability buttons to combat bar / Actions modal when requirements met.
- Ability buttons show cost (e.g., "Power Strike (4 MP)").
- For Backstab, show conditional mult: "Backstab (3× dmg)" vs "Backstab (1× dmg)".

### 4.2 Actions Modal (Exploration)

- Add Holy Light when HP < max and MP ≥ 5.

### 4.3 Equipment Tab

- Offhand row: when two-handed equipped, show "Offhand: Locked — Greataxe (two-handed)" in `--text3`, italic.
- Disable unequip/equip for offhand when locked.

### 4.4 HUD / Narrative

- Aggro: show turn counter in combat narrative or HUD.
- On Aggro expiry: "The red haze fades from your vision."

### 4.5 Character Creation

- Class cards: use new flavor text from spec.
- Add pixel art icons per class (16×16 grids).
- Show: class name, flavor text, starting gear summary, ability name + one-line description.
- Remove `stats` / `statMods` display from class cards.

---

## 5. Pixel Art Icons

Add to `PA.icons` (or `PA.classIcons`) for each class:

| Class    | Description |
|----------|-------------|
| Fighter  | Crossed sword and shield, –text2 color |
| Paladin  | Shield with radiant emblem, shield –text2, emblem –gold |
| Ranger   | Bow with nocked arrow, –text2 |
| Rogue    | Angled dagger with drips, –text2 |
| Wizard   | Wizard hat with star, hat –text2, star –gold |
| Berserker| Horned skull / screaming face, –text2 |

16×16 grid, rendered 32×32 or 48×48 for creation cards.

---

## 6. CALC / CMB Updates

### CALC

- `playerDef(r)`: armor defense only (remove defBase).
- `totalWt(r)`: use weight penalties from string weights.
- `abilityCost(r, baseCost)`: apply Smarts discount if smarts ≥ 7.
- `meleeDmgMod(r)`, `rangedDmgMod(r)`: add `activeBuff.dmgBonus` when applicable.
- `meleeHit(r, eDef)`, `rangedHit(r, eDef)`: add `activeBuff.hitBonus` when applicable.
- Enemy damage to player: add `activeBuff.incomingDmgBonus` when Aggro active.

### CMB

- Resolve buffs on hit: check `activeBuff.trigger` before damage calc.
- Arcane Bolt: new attack resolution using Smarts, 2d6, range 5–25m.
- Aggro: decrement at end of `pAct()` after eTurn.
- Backstab conditions: `cs.turns === 0` or `cs.movedThisTurn`.

---

## 7. Species Trait Interactions

Documented in spec (no code change beyond ensuring they run alongside class buffs):

- Vanish + Backstab: stack multiplicatively (2× × 3× = 6×) when both conditions met.
- Bloodrage, Twilight Instinct, etc. remain passive; computed from state.

---

## 8. Migration

- Existing saves with `classes` array remain valid.
- Old saves may have `class` (singular); ensure both work when looking up class data.
- Consider adding save-version field for future migrations.

---

## 9. Implementation Order

1. **Phase A — Data**
   - Update CL → CLASSES structure.
   - Add Wizard and Berserker.
   - Remove statMods, add ability definitions.
   - Align startGear schema and weight strings.

2. **Phase B — Core**
   - Remove class stat contributions from GS.newRun and CALC.
   - Implement weight penalties from string weights.
   - Implement two-handed weapon locking.

3. **Phase C — Abilities**
   - Add `activeBuff` to combat state.
   - Implement Power Strike, Holy Light, Aimed Shot, Backstab, Arcane Bolt, Aggro.
   - Add ability buttons to combat and exploration UI.

4. **Phase D — Polish**
   - Pixel art icons for class creation.
   - Aggro turn counter and expiry message.
   - Equipment tab locked offhand display.
   - Journal Classes section update.

---

## 10. Files Affected

- `index.html` — all changes (single-file app)
- `CLASS_SPEC_UPDATE_PLAN.md` — this plan

No other project files need modification per AGENTS.md.
