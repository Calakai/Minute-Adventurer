# Class Specs Update Plan

## Overview

This plan covers updating the class system in `index.html` from the current 4-class implementation (Fighter, Paladin, Ranger, Rogue) to the new 6-class system defined in the **New CLASS SPEC** document. The new spec introduces two new classes (Wizard, Berserker), removes stat modifiers from classes, adds active abilities, and requires significant combat system changes.

---

## Current State Analysis

### Current `CL` Object (4 classes)

| Class   | Stat Mods          | defBase | Weapon    | Offhand        | Armor         | Backpack |
|---------|--------------------|---------|-----------|---------       |---------------|----------|
| Fighter | Melee +1, Health +1| 1       | Sword     | None           | Chainmail     | —        |
| Paladin | Health +1          | 1       | Sword     | Wooden Shield  | Chainmail     | —        |
| Ranger  | Ranged +1, Sight +1| 0       | Shortbow  | Quiver         | Leather Armor | Dagger   |
| Rogue   | Melee +1, Mvmt +1  | 0       | Dagger    | Lantern        | Leather Armor | —        |

### What the current system lacks
- No Wizard or Berserker classes
- No class active abilities or buff system
- No ability UI in combat
- No two-handed weapon logic
- No Arcane Bolt (magic attack) system
- No MP-spending combat actions
- No buff tracking in combat state
- No Smarts-based mana discount
- No class pixel art icons

---

## What Changes

### 1. Remove Stat Modifiers from Classes

**Spec rule:** "Classes do NOT modify stats — stats come from species/subspecies only."

**Current code (to remove):**
```js
// Current: each class has statMods and defBase
fighter: { statMods: {melee:1, health:1}, defBase: 1, ... }
```

**Impact:**
- Remove `statMods` and `defBase` from all class definitions
- Update `GS.newRun()` — stop applying `c.statMods[k]` to stats during character creation
- Update `CALC.playerDef()` — stop reading `CL[r.classes[0]].defBase`; defense now comes purely from armor
- Update `CC.buildSum()` — stop applying `cl.statMods` in the summary preview
- Update Journal Classes tab — stop showing `c.stats` string

### 2. Replace `CL` Data Structure with New `CLASSES` Object

Replace the entire `CL` constant with the new `CLASSES` structure from the spec. The new format is:

```js
const CLASSES = {
  fighter: {
    name: 'Fighter',
    desc: '...flavor text...',
    ability: { name, desc, cost, type, trigger, effect, requirement },
    startGear: { weapon: {...}, offhand, armor, backpack }
  },
  // ... 5 more classes
};
```

**Key data differences per class:**

| Property       | Old `CL`             | New `CLASSES`                      |
|----------------|----------------------|------------------------------------|
| `statMods`     | Present              | **Removed**                        |
| `defBase`      | Present              | **Removed**                        |
| `ability`      | **Not present**      | New — name/cost/type/effect/req    |
| `startGear`    | `wpn/oh/arm/bp`      | `weapon/offhand/armor/backpack`    |
| Weapon fields  | `t/wt/rng/dD/dB`     | `type/weight/range/dmgDice/dmgBonus` |

**All references to `CL` must be updated to `CLASSES` (or the `CL` variable renamed).** A global rename is simpler. References exist in:
- `GS.newRun()` — gear assignment
- `CALC.playerDef()` — defense calculation
- `UI.updateHUD()` — class name lookup
- `UI.buildLandingButtons()` — class name display
- `ML.openChar()` — class name in stats tab
- `ML.openMenu()` — class name in save slots
- `ML.openJrn()` — journal Classes tab
- `CC.buildCL()` — class creation cards
- `CC.buildSum()` — summary display

### 3. Add Two New Classes

#### Wizard
- **Weapon:** Staff (melee, 5m, 1d4, light)
- **Offhand:** Spellbook (required for Arcane Bolt, light)
- **Armor:** Robes (+0 defense, light)
- **Ability:** Arcane Bolt (3 MP, or 2 if Smarts ≥ 7) — ranged magic attack, 2d6 damage, uses Smarts for hit chance, requires Spellbook in offhand

#### Berserker
- **Weapon:** Greataxe (melee, 5m, 1d10, heavy, **two-handed**)
- **Offhand:** null (locked by two-handed weapon)
- **Armor:** Leather Armor (+1 defense, light)
- **Ability:** Aggro (5 MP) — 3-turn buff: +2 melee damage, +10% hit, +1 incoming damage

### 4. Implement Active Ability System

This is the largest change. Each class now has an active ability that costs MP.

#### Ability Types

| Type     | Classes                    | Behavior                                          |
|----------|----------------------------|-------------------------------------------------  |
| `buff`   | Fighter, Ranger, Rogue, Berserker | Sets a buff that resolves on next attack or over time |
| `attack` | Wizard                     | Immediate ranged magic attack                     |
| `heal`   | Paladin                    | Immediate HP restore                              |

#### Combat State Changes

Add to `GS.run.cs` (combat state):
```js
activeBuff: null  // { name, turnsLeft, effect, trigger }
```

#### Buff Resolution Logic

- **Power Strike (Fighter):** On next melee hit, multiply weapon damage by 2. Consumed after hit or combat end.
- **Aimed Shot (Ranger):** On next ranged hit, +20% hit chance, ignore close-range penalty. Consumed after hit or combat end.
- **Backstab (Rogue):** On next melee hit, 3× damage if first turn OR moved this turn; 1× otherwise. MP spent regardless.
- **Aggro (Berserker):** For 3 turns: +2 melee damage, +10% hit chance, +1 incoming damage. Decrements each turn.

#### Buff Stacking Rules
- New class buff **replaces** old class buff
- Class buffs **stack with** species/subspecies traits (Bloodrage, Twilight Instinct, etc.)
- Arcane Bolt and Holy Light are immediate — not buffs

#### Smarts Mana Discount
- If `stats.smarts >= 7`, reduce all ability MP costs by 1 (minimum 1)
- Apply at cost calculation time, not in data definitions
- Add helper: `CALC.abilityCost(r, ability)` 

### 5. Implement Arcane Bolt (Special Attack)

Arcane Bolt is a unique attack path that bypasses the normal weapon system:

- Range: 5–25m (works at any distance within range)
- Damage: 2d6 (roll two d6, sum)
- Hit chance: `55% + (Smarts - 5) × 5% - (enemy_def × 3%)`
- **Not** affected by weapon type, close-range penalties, or arrow count
- Requires Spellbook in offhand slot
- If Spellbook unequipped, cannot cast

**Implementation:**
- Add `'arcane_bolt'` as a new combat action in `CMB.pAct()`
- Wire it to the ability button UI in combat
- Create `CALC.arcaneBoltHit(r, eDef)` for the Smarts-based hit formula

### 6. Implement Two-Handed Weapon Logic

The Berserker's Greataxe is two-handed:

- When a two-handed weapon is equipped (`weapon.twoHand: true`), the offhand slot displays **"Locked (two-handed)"** and cannot be used
- Unequipping the two-handed weapon frees the offhand slot
- If a player equips a one-handed weapon, the offhand unlocks automatically
- In Equipment tab, the offhand row shows: `"Offhand: Locked — Greataxe (two-handed)"` in `--text3`, italic

**Implementation:**
- Add `twoHand: true` to Greataxe weapon data
- Update `ML.openChar('equip')` — show lock state when two-handed weapon equipped
- Update equip/unequip logic to enforce lock
- Prevent equipping offhand items when two-handed weapon is active

### 7. Add Ability Buttons to Combat UI

Add ability-specific UI to the combat interface:

- **Buff abilities** (Power Strike, Aimed Shot, Backstab, Aggro): Button appears in combat actions when requirements are met and MP >= cost
- **Arcane Bolt**: Appears as primary combat action when Spellbook equipped and MP >= cost
- **Holy Light**: Appears in combat AND exploration when HP < max and MP >= cost
- **Backstab**: Shows condition indicator — "Backstab (3× dmg)" or "Backstab (1× dmg)"
- **Aggro**: Shows "(3 turns)" on button; turn counter in narrative

**Where to add:**
- Bottom combat bar (`#combat-bar`) — add a 5th button for class ability
- HUD combat buttons — add ability button
- Actions modal — add ability as an action option
- Exploration actions — add Holy Light when applicable

### 8. Add Class Pixel Art Icons

Define 16×16 pixel art grids for each class icon, following the existing `PA` system:

| Class      | Icon Description                                    |
|------------|-----------------------------------------------------|
| Fighter    | Crossed sword and shield silhouette                 |
| Paladin    | Shield with radiant 4-pointed star/cross emblem     |
| Ranger     | Bow with nocked arrow                               |
| Rogue      | Angled dagger with drip drops                       |
| Wizard     | Pointed wizard hat with star                        |
| Berserker  | Screaming face / horned skull                       |

**Implementation:**
- Add `PA.classIcons` object with 6 generator functions
- Render on class creation cards at 32×32 or 48×48
- Render in-game references at 16×16 or 20×20

### 9. Update Character Creation Flow

Class selection step (`ccs5`) needs enhanced cards showing:
- Pixel art class icon
- Class name
- Flavor text (desc)
- Starting gear summary (weapon, armor, offhand, weight)
- Active ability name + one-line description

**Implementation:**
- Update `CC.buildCL()` to pass richer data into `CC.mkCard()` (or create specialized class cards)
- Render class icon using `PA.classIcons[key]()` on card canvas
- Add gear summary line and ability line to card info area

### 10. Update All `CL` References

Every reference to the old `CL` object must be updated. Here is a comprehensive list:

| Location                          | Current Usage                         | Required Change                              |
|-----------------------------------|---------------------------------------|----------------------------------------------|
| `GS.newRun()`                     | `CL[cl]` for statMods, gear           | Use `CLASSES[cl]`, remove statMods, update gear keys |
| `CALC.playerDef()`               | `CL[r.classes[0]].defBase`            | Remove defBase; use only `r.arm.dB`          |
| `UI.updateHUD()`                  | `CL[r.classes[0]].name`               | `CLASSES[r.classes[0]].name`                 |
| `UI.buildLandingButtons()`        | `CL[r.classes[0]].name`               | `CLASSES[r.classes[0]].name`                 |
| `ML.openChar()`                   | `CL[r.classes[0]].name`               | `CLASSES[r.classes[0]].name`                 |
| `ML.openMenu()`                   | `CL[...]` for class name in saves     | `CLASSES[...]`                               |
| `ML.openJrn()`                    | `Object.values(CL)` for journal tab   | `Object.values(CLASSES)`                     |
| `CC.buildCL()`                    | `Object.entries(CL)`                  | `Object.entries(CLASSES)`                    |
| `CC.buildSum()`                   | `CL[this.cl]` for statMods, summary   | `CLASSES[this.cl]`, remove statMods          |

### 11. Update Weight System

Weapon weights in the new spec use string values (`'light'`, `'medium'`, `'heavy'`) with numeric penalties:
- Light = 0 weight penalty
- Medium = -1 weight penalty  
- Heavy = -2 weight penalty

The current system already uses numeric `wt` (0, 1, 2) which maps to the same values. The new spec data uses string weight names in the CLASSES definition, so either:
- (A) Convert string weights to numeric at data definition time, or
- (B) Update `CALC.totalWt()` to handle string weights

**Recommendation:** Keep numeric weights internally (0=light, 1=medium, 2=heavy) as the current system does. Map the spec's string names to numeric values in the CLASSES data.

---

## Implementation Order

The changes should be implemented in this order to minimize breakage:

### Phase 1: Data Structure Update
1. **Replace `CL` with `CLASSES`** — new data structure, all 6 classes, no statMods/defBase
2. **Global rename `CL` → `CLASSES`** across all references
3. **Update `GS.newRun()`** — remove statMod application, update gear field names
4. **Update `CALC.playerDef()`** — remove defBase usage
5. **Update `CC.buildSum()`** — remove statMod application from preview

### Phase 2: Two-Handed & Equipment
6. **Add two-handed weapon logic** — `twoHand` flag, offhand locking
7. **Update Equipment tab** — show locked offhand state
8. **Update equip/unequip logic** — enforce two-handed lock

### Phase 3: Ability System (Core)
9. **Add `activeBuff` tracking** to combat state in `CMB.start()`
10. **Add `CALC.abilityCost(r, ability)`** — Smarts discount helper
11. **Implement buff abilities** (Power Strike, Aimed Shot, Backstab) in `CMB.pAct()`
12. **Implement Aggro** with turn counter and decrement logic
13. **Implement Arcane Bolt** as a direct attack path
14. **Implement Holy Light** as an instant heal (combat + exploration)
15. **Add buff resolution** — apply buff effects when attacks land
16. **Add buff expiry/replacement** rules

### Phase 4: UI Updates
17. **Add ability button** to combat bar and HUD combat buttons
18. **Add ability to Actions modal** combat options
19. **Add Holy Light** to exploration actions when applicable
20. **Show buff status** in combat narrative (Aggro turn counter, etc.)
21. **Show Backstab condition indicator** on button text
22. **Add class pixel art icons** to `PA.classIcons`
23. **Update class creation cards** — icon, gear summary, ability info
24. **Update Journal Classes tab** — show abilities and new class info

### Phase 5: Command Parser & Polish
25. **Add ability commands** to `CP.parse()` — "power strike", "arcane bolt", "holy light", etc.
26. **Add Arcane Bolt hit chance** display to combat UI (distance meter, attack button)
27. **Test all class + species combinations** for balance and correctness
28. **Update save compatibility** — handle old saves missing new fields gracefully

---

## Detailed File Changes

All changes are in **`index.html`** (the single-file application). No other files are affected.

### JavaScript Sections Modified

| Module   | Changes                                                        |
|----------|----------------------------------------------------------------|
| `CL`     | **Replaced entirely** with `CLASSES` constant                  |
| `CALC`   | Add `abilityCost()`, `arcaneBoltHit()`. Update `playerDef()`  |
| `GS`     | Update `newRun()` to remove statMods, update gear field names  |
| `CMB`    | Add `activeBuff` to combat state, ability actions, buff resolution, Aggro counter |
| `UI`     | Add ability button, rename all `CL` refs, update combat UI    |
| `ML`     | Update char sheet, journal, menu to use `CLASSES`. Add ability info |
| `CC`     | Update `buildCL()` cards, `buildSum()`. Remove statMod previews |
| `CP`     | Add ability commands to parser                                 |
| `SE`     | Add Holy Light to exploration actions, show buff status        |
| `PA`     | Add `classIcons` object with 6 icon generators                 |

### CSS Additions (if needed)

- Ability button styling in combat bar (may reuse `.cbtn` or add `.abtn`)
- Buff indicator styling in HUD or narrative
- Two-handed lock display styling in Equipment tab
- Class icon sizing on creation cards

---

## Risk Assessment

| Risk                                    | Severity | Mitigation                                     |
|-----------------------------------------|----------|-------------------------------------------------|
| Save compatibility (old saves lack fields) | Medium  | Add fallbacks in `GS.loadA()` for missing fields |
| Buff stacking bugs                      | Medium   | Clear unit of test: one buff active at a time    |
| Arcane Bolt balance                     | Low      | Follows spec formula exactly                     |
| Two-handed equip edge cases             | Medium   | Guard all equip/unequip paths                    |
| `CL` → `CLASSES` rename misses a reference | High  | Search for all `CL[` and `CL.` patterns         |
| Backstab condition logic errors         | Medium   | Verify `turns === 0` and `movedThisTurn` checks  |

---

## Testing Strategy

Since there are no automated tests, all testing is manual via the browser:

1. **New character creation** — verify all 6 classes appear with correct info, icons, and gear
2. **Stat verification** — confirm classes no longer modify stats (only species/subspecies do)
3. **Equipment display** — check Berserker's locked offhand, all starting gear correct
4. **Combat abilities** — test each class's active ability in combat against Gray Ooze
5. **Arcane Bolt** — test Wizard casting, Smarts hit chance, Spellbook requirement
6. **Aggro** — test 3-turn duration, damage bonus, incoming damage penalty, expiry message
7. **Backstab conditions** — test first-turn trigger, movement trigger, and failed condition
8. **Holy Light** — test in combat and exploration
9. **Buff replacement** — activate one buff, then another; confirm first is replaced
10. **Buff + trait stacking** — test Aggro + Bloodrage, Vanish + Backstab
11. **Two-handed equip/unequip** — equip one-handed → offhand unlocks, equip two-handed → locks
12. **Save/Load** — save with new class, load, verify state preserved
13. **Old save compatibility** — ensure old saves without ability fields don't crash
14. **Weight penalties** — verify movement penalties match the spec's weight table
15. **Smarts discount** — verify Smarts ≥ 7 reduces ability costs by 1
