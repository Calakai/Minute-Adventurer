# Class Specs Update Plan

## Source Document
`New_CLASS_SPEC.pdf` — "MINUTE ADVENTURER — CLASS MECHANICS SPEC, Phase 3: Classes"

---

## Current State vs. Target State

### Current (4 classes, simple data objects)
- **Classes**: Fighter, Paladin, Ranger, Rogue
- Stats come from species + class `statMods` (e.g. Fighter: melee+1, health+1)
- `defBase` provides a class-based defense bonus (0 or 1)
- No active abilities — classes only provide starting gear
- Weight uses numeric values (0=Light, 1=Medium, 2=Heavy)
- No two-handed weapons
- No buff/ability system in combat

### Target (6 classes, ability system)
- **Classes**: Fighter, Paladin, Ranger, Rogue, **Wizard**, **Berserker** (2 new)
- Classes do **NOT** modify stats — stats come from species/subspecies only
- Classes provide: starting gear, one active ability, gameplay identity
- Active ability system integrated into combat
- Two-handed weapon mechanic (Berserker's Greataxe)
- Smarts-based mana discount for abilities
- New pixel art icons for class selection cards
- Buff stacking rules (class buffs replace each other; species traits stack)

---

## Implementation Steps

### Step 1: Replace CL Data Object with New CLASSES Structure

**File**: `index.html` (lines ~480–502)

**What changes**:
- Replace the entire `CL` object with new `CL` structure matching the spec
- Remove `stats`, `statMods`, `defBase` from every class — these no longer exist
- Add `ability` object to each class (name, desc, cost, type, trigger, effect, requirement)
- Add `desc` (flavor text) updates to match spec
- Add 2 new classes: `wizard` and `berserker`
- Update starting gear to use the spec's format
- Add `twoHand: true` property to Berserker's Greataxe
- Add new item types: `spellbook` (Wizard offhand), locked offhand state

**New CL structure** (per spec p.7-9):
```js
const CL = {
  fighter: {
    name: 'Fighter',
    desc: 'No tricks, no magic. Just steel and the skill to use it.',
    ability: { name: 'Power Strike', desc: 'Next melee attack deals double damage.', cost: 4, type: 'buff', trigger: 'melee_hit', effect: { dmgMult: 2 }, requirement: 'melee_range' },
    wpn: { name: 'Sword', t: 'melee', wt: 1, rng: 5, dD: 8, dB: 0, desc: 'Melee 5m, 1d8' },
    oh: null,
    arm: { name: 'Chainmail', dB: 2, wt: 1, desc: '+2 defense (Medium)' },
    bp: []
  },
  paladin: { ... },  // Holy Light (heal)
  ranger: { ... },   // Aimed Shot (buff)
  rogue: { ... },     // Backstab (conditional buff)
  wizard: { ... },    // Arcane Bolt (attack)
  berserker: { ... }  // Aggro (sustained buff)
};
```

**Dependencies**: None — this is the foundational data change.

---

### Step 2: Remove statMods from Character Creation

**File**: `index.html`

**What changes**:
- `GS.newRun()` (~line 536): Remove class stat modifier application. Currently does:
  ```js
  STAT_NAMES.forEach(k => { stats[k] = (s.stats[k]||5) + (c.statMods[k]||0) });
  ```
  Change to:
  ```js
  STAT_NAMES.forEach(k => { stats[k] = s.stats[k] || 5 });
  ```
- `CC.buildSum()` (~line 1030): Same stat calculation fix for the summary preview
- `CALC.playerDef()` (~line 518): Remove `defBase` lookup:
  ```js
  // Before:
  playerDef(r) { return (r.arm ? r.arm.dB : 0) + (CL[r.classes[0]] ? CL[r.classes[0]].defBase : 0) }
  // After:
  playerDef(r) { return r.arm ? r.arm.dB : 0 }
  ```

**Dependencies**: Step 1 (new CL structure must exist).

---

### Step 3: Add Two-Handed Weapon System

**File**: `index.html`

**What changes**:
- Berserker's Greataxe gets `twoHand: true` property
- Equipment tab: when `wpn.twoHand === true`, offhand row shows "Locked — [weapon name] (two-handed)" in italic, `--text3` color
- Prevent equipping offhand items when two-handed weapon is equipped
- When unequipping a two-handed weapon, free the offhand slot
- When equipping a one-handed weapon over a two-handed weapon, unlock offhand
- Update `CALC.totalWt()` to handle heavy weight (wt: 2)

**Affected code areas**:
- `ML.openChar()` — Equipment tab rendering (~line 836-847)
- Backpack equip handler (~line 862-863)
- `CP.parse()` — equip command (~line 1069-1071)

**Dependencies**: Step 1 (Berserker data with twoHand weapon).

---

### Step 4: Implement Active Ability System (Combat Integration)

**File**: `index.html`

This is the largest and most complex step. It involves adding an ability execution system to the combat loop.

#### 4a: Add activeBuff to Combat State

- In `CMB.start()` (~line 575): Add `activeBuff: null` to the combat state object
- Track: `{ name, turnsLeft, effect, trigger }`

#### 4b: Add Ability Activation Logic

Create a new method `CMB.useAbility()` that:
1. Checks MP cost (with Smarts discount: if `stats.smarts >= 7`, cost - 1, min 1)
2. Checks requirement (melee_range, ranged_equipped, spellbook_equipped, or null)
3. For buff-type abilities (`Power Strike`, `Aimed Shot`, `Backstab`, `Aggro`):
   - Sets `cs.activeBuff` with the ability's effect data
   - New buff replaces existing buff (no stacking between class abilities)
4. For attack-type abilities (`Arcane Bolt`):
   - Resolves immediately as a Smarts-based ranged attack
   - Hit chance: `55% + (Smarts - 5) * 5% - (enemyDef * 3%)`
   - Damage: 2d6
   - Range: 5-25m (no close-range penalty)
   - Requires Spellbook in offhand
5. For heal-type abilities (`Holy Light`):
   - Heals 8 HP immediately (cannot exceed max HP)
   - Usable in combat and exploration

#### 4c: Modify Attack Resolution to Apply Buffs

In `CMB.pAct('attack')` (~line 591-613):
- After calculating damage, check `cs.activeBuff`:
  - **Power Strike** (`trigger: 'melee_hit'`): On melee hit, multiply damage by `dmgMult` (2). Consume buff.
  - **Aimed Shot** (`trigger: 'ranged_hit'`): On ranged attack, add `hitBonus` (+20%), ignore close-range penalty. Consume buff.
  - **Backstab** (`trigger: 'melee_hit'`): On melee hit, check conditions (`first_turn` OR `moved_this_turn`). If met: multiply by `dmgMult` (3). If not: multiply by `condDmgMult` (1). Consume buff.
  - **Aggro** (`trigger: 'sustained'`): Each turn while active: +2 melee dmg, +10% hit. On enemy hit, +1 incoming damage. Decrement `turnsLeft` each turn. Show "Aggro: X turns remaining" in narrative.

#### 4d: Add Ability UI Buttons

In the combat actions modal (`ML.openAct()`, ~line 869) and the combat bar:
- Add ability button when requirements are met and MP is sufficient
- Show ability name, MP cost, and condition indicator for Backstab
- For Aggro, show "(3 turns)" on button

#### 4e: Add Exploration Heal (Paladin)

- When not in combat, if HP < max and MP >= cost, show "Holy Light" button in the action modal or explore bar

#### 4f: Ability Commands in Text Parser

In `CP.parse()` (~line 1046-1083):
- Add commands: `power strike`, `holy light`, `arcane bolt`, `aimed shot`, `backstab`, `aggro`
- Map to `CMB.useAbility()` or `CMB.pAct('ability')`

**Dependencies**: Steps 1, 2 (new CL structure, no statMods).

---

### Step 5: Implement Buff Stacking & Expiry Rules

**File**: `index.html`

**What changes**:
- Class ability buffs do NOT stack with each other — using a new one replaces the old
- Class ability buffs CAN stack with species/subspecies traits (Bloodrage, Twilight Instinct, Vanish, etc.)
- Track separately: `activeBuff` for class ability, species trait effects remain computed from state
- **Aggro** turn counter: decrement at end of each player turn in `CMB.pAct()`. Show "Aggro: X turns remaining" in narrative. At 0, clear buff and show "The red haze fades from your vision."
- **Vanish + Backstab** interaction: Vanish gives 2× damage, Backstab gives 3×. They stack multiplicatively = 6× weapon damage. This costs 6 MP total (2 Vanish + 4 Backstab). Already partially implemented in `traitState.hidden`/`_wasHidden` — extend to interact with Backstab's multiplier.

**Dependencies**: Step 4 (ability system exists).

---

### Step 6: Add Smarts-Based Mana Discount

**File**: `index.html`

**What changes**:
- At ability cost calculation time (not in data definitions):
  - If `character.stats.smarts >= 7`, reduce ability MP cost by 1 (minimum 1)
- This affects all abilities, not just Arcane Bolt
- Update UI to show discounted cost when applicable

**Dependencies**: Step 4 (ability system exists).

---

### Step 7: Add Pixel Art Icons for All 6 Classes

**File**: `index.html`

**What changes**:
- Add 6 new 16×16 pixel art icon definitions to the `PA` module, matching the spec:
  1. **Fighter**: Crossed sword and shield silhouette. Sword diagonal upper-left to lower-right, shield overlapping lower-left. `--text2` color.
  2. **Paladin**: Shield with radiant emblem. Pointed-bottom shield with 4-pointed star/cross center. Shield in `--text2`, emblem in `--gold`.
  3. **Ranger**: Bow with nocked arrow. Bow curved left, arrow upper-right, bowstring visible. `--text2` color.
  4. **Rogue**: Angled dagger with drops. Blade upper-right ~45°, 2-3 drip pixels below tip. `--text2` color.
  5. **Wizard**: Pointed wizard hat with star. Cone hat with 4-pointed star near tip. Hat `--text2`, star `--gold`.
  6. **Berserker**: Screaming face/horned skull. Simplified skull with horn pixels, open mouth. `--text2` color.
- Render at 32×32 or 48×48 for creation cards, 16×16 or 20×20 in-game
- Follow existing `PA` module pattern for icon definitions (color grid arrays)

**Dependencies**: None — can be done in parallel with other steps.

---

### Step 8: Update Character Creation Cards

**File**: `index.html`

**What changes**:
- `CC.buildCL()` (~line 1027): Update to render class cards with:
  - Pixel art icon (from Step 7)
  - Class name
  - Flavor text (desc)
  - Starting gear summary
  - Ability name and one-line description
- Update `CC.mkCard()` to handle ability display
- Remove stat modifier display from class cards (classes no longer have statMods)

**Dependencies**: Steps 1, 7 (new CL data, pixel art icons).

---

### Step 9: Update Character Sheet & Journal

**File**: `index.html`

**What changes**:
- `ML.openChar()` Stats tab (~line 808-834): Add "Class Ability" section showing active ability info
- Equipment tab: Handle two-handed weapon lock display
- Journal "Classes" tab (~line 899): Show all 6 classes with abilities

**Dependencies**: Steps 1, 3, 4.

---

### Step 10: Update Save/Load Compatibility

**File**: `index.html`

**What changes**:
- Old saves store `classes: ['fighter']` etc. with stat modifiers baked into `stats`
- New system: stats should NOT include class modifiers
- Add migration logic in `GS.loadA()` and `GS.mLoad()`:
  - If loading a legacy save, detect and subtract old `statMods` from stored stats
  - Handle missing `activeBuff` in combat state gracefully
- Ensure backward compat for old class keys (fighter, paladin, ranger, rogue)
- New classes (wizard, berserker) won't appear in old saves

**Dependencies**: Steps 1, 2, 4.

---

## Implementation Order (Recommended)

```
Step 1 ──► Step 2 ──► Step 3 ──────────────────────────► Step 10
                  └──► Step 4 ──► Step 5 ──► Step 6
Step 7 ──────────────► Step 8 ──► Step 9
```

**Phase A** (Data layer):
1. Step 1: Replace CL data object
2. Step 2: Remove statMods from creation & defense calc
3. Step 7: Pixel art icons (parallel)

**Phase B** (Mechanics):
4. Step 3: Two-handed weapon system
5. Step 4: Active ability system (biggest task)
6. Step 5: Buff stacking & expiry
7. Step 6: Smarts mana discount

**Phase C** (UI & Polish):
8. Step 8: Character creation cards
9. Step 9: Character sheet & journal updates
10. Step 10: Save/load compatibility

---

## Risk Areas & Notes

- **Step 4 is the heaviest lift** — the ability system touches combat resolution, UI rendering, the command parser, and exploration actions. Break it into sub-steps (4a-4f).
- **Backward compatibility** (Step 10) is important since saves are in localStorage. A migration path is needed for existing players.
- The spec mentions "Skill trees will be added later with the Prestige system" — `classPoints` and `prestigeLevel` already exist as stubs in the run state. These should be left in place for future use.
- The `defBase` removal (Step 2) is a gameplay balance change — Fighter and Paladin lose 1 base defense. Their increased starting armor and abilities compensate.
- **Vanish + Backstab** multiplicative stacking (6× damage) is intentional per the spec. The existing Vanish code in `traitState` needs to interact with the new Backstab buff system.
- Weight values in current code: 0=Light, 1=Medium, 2=Heavy. The Berserker's Greataxe introduces `wt: 2` (Heavy) which is new — verify `CALC.totalWt()` and `effMov()` handle it correctly (they already do via numeric addition).

---

## Testing Strategy

Since there's no automated test suite, all testing is manual via the browser:

1. **Character creation flow**: Create a character of each class, verify starting gear and stats (no class stat bonuses)
2. **Combat abilities**: Enter combat with each class, test ability activation, MP consumption, buff application, damage resolution
3. **Two-handed weapons**: Equip/unequip Berserker's Greataxe, verify offhand lock/unlock
4. **Arcane Bolt**: Test Smarts-based hit chance, range restrictions, Spellbook requirement
5. **Holy Light**: Test in combat and exploration, HP cap
6. **Backstab conditions**: Test first-turn and moved-this-turn triggers
7. **Aggro duration**: Verify 3-turn countdown and expiry message
8. **Buff replacement**: Activate one buff, then another — verify first is replaced
9. **Vanish + Backstab**: Test multiplicative 6× damage with Shadowstep Rogue
10. **Smarts discount**: Test with Smarts >= 7 and < 7
11. **Save/load**: Save with new classes, reload, verify state integrity
12. **Legacy save compat**: Load a pre-update save, verify migration
