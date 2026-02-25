# Class Specs Update Plan

## Overview

This plan covers updating the Minute Adventurer class system from its current 4-class implementation (Fighter, Paladin, Ranger, Rogue) to the new 6-class design (adding Wizard and Berserker). The new spec fundamentally changes how classes work: **classes no longer modify stats** — stats come from species/subspecies only. Instead, classes provide **starting gear**, **one active ability**, and a **gameplay identity**.

All changes are in `index.html` (single-file PWA, ~1246 lines).

---

## Current State vs. New Spec — Key Differences

| Feature | Current | New Spec |
|---|---|---|
| Number of classes | 4 (Fighter, Paladin, Ranger, Rogue) | 6 (+Wizard, +Berserker) |
| Stat modifiers | Each class has `statMods` (e.g. Fighter: melee+1, health+1) | **Removed** — stats come only from species/subspecies |
| Base defense | Each class has `defBase` (0 or 1) | **Removed** — defense comes from armor only |
| Active abilities | None | Each class has one active ability |
| Ability system | Does not exist | New buff/attack/heal system with MP costs |
| Weight system | Numeric (0, 1, 2) | String-based (`'light'`, `'medium'`, `'heavy'`) with penalty values (0, -1, -2) |
| Two-handed weapons | Not supported | Berserker's Greataxe locks offhand slot |
| Gear structure | `wpn`, `oh`, `arm`, `bp` with short property names | Same slots, but new properties on items (e.g. `twoHand`, `type` spelled out) |
| Pixel art icons | None for classes | 16×16 pixel art icon per class |
| Class flavor text | Short descriptions | Richer identity + flavor quote per class |
| Smarts mana discount | Not implemented | Smarts >= 7 reduces ability MP costs by 1 |

---

## Phase Breakdown

### Phase 1: Update CL Data Object
**Lines affected:** 480–502 (`const CL = { ... }`)

**What to do:**
1. Remove `statMods` and `defBase` from all four existing classes.
2. Remove `stats` display string from all classes (was used in character creation cards; replaced by ability info).
3. Update `desc` to the new flavor text for Fighter, Paladin, Ranger, Rogue.
4. Add `ability` object to each class with properties: `name`, `desc`, `cost`, `type` (buff | attack | heal), `trigger`, `effect`, `requirement`, and (for Backstab) `conditions`.
5. Update starting gear to match new spec:
   - Fighter: Sword, Chainmail, no offhand, empty backpack *(already matches, adjust weight format)*.
   - Paladin: Sword, Wooden Shield, Chainmail, empty backpack *(already matches, adjust weight format)*.
   - Ranger: Shortbow (10 arrows), Quiver, Leather Armor, Dagger in backpack *(already matches, adjust weight format and add `minRange` if missing)*.
   - Rogue: Dagger, Lantern, Leather Armor, empty backpack *(already matches, adjust weight format)*.
6. Add two new classes:
   - **Wizard**: Staff, Spellbook, Robes (+0 def), empty backpack. Ability: Arcane Bolt.
   - **Berserker**: Greataxe (two-handed, heavy), locked offhand, Leather Armor, empty backpack. Ability: Aggro.
7. Update `WT_NAMES` if weight encoding changes.

**Data structure per class (from spec):**
```js
fighter: {
  name: 'Fighter',
  desc: 'No tricks, no magic. Just steel and the skill to use it.',
  ability: {
    name: 'Power Strike',
    desc: 'Next melee attack deals double damage.',
    cost: 4,
    type: 'buff',
    trigger: 'melee_hit',
    effect: { dmgMult: 2 },
    requirement: 'melee_range'
  },
  startGear: {
    weapon: { name: 'Sword', type: 'melee', range: 5, dmgDice: 8, dmgBonus: 0, weight: 'medium' },
    offhand: null,
    armor: { name: 'Chainmail', defBonus: 2, weight: 'medium', desc: '+2 defense, medium' },
    backpack: []
  }
}
```

**Decision point — gear property naming:** The current code uses terse property names (`t`, `wt`, `rng`, `dD`, `dB`). The spec document uses verbose names (`type`, `weight`, `range`, `dmgDice`, `dmgBonus`). We should **keep the current terse naming convention** for consistency with the rest of the codebase (it's a minified single-file app) but adopt the spec's structural changes (ability objects, two-handed flag, weight-as-string). This avoids a massive rename across all game systems.

**Recommended internal format:**
```js
// Keep terse property names but switch weight to string
weapon: { name:'Sword', t:'melee', wt:'med', rng:5, dD:8, dB:0, desc:'Melee 5m, 1d8' }
// 'med' -> -1 penalty, 'lgt' -> 0, 'hvy' -> -2
// OR keep numeric 0/1/2 and just map for display (simpler, fewer changes)
```

**Recommendation:** Keep numeric weights (0=light, 1=medium, 2=heavy) internally. The `WT_NAMES` array already maps these for display. This minimizes changes to `CALC.totalWt()` and other weight-dependent code.

---

### Phase 2: Remove Stat Modifiers from Character Creation
**Lines affected:** 534–536 (GS.newRun), 1028–1042 (CC.buildSum), 1027 (CC.buildCL), 994–1008 (CC.mkCard)

**What to do:**
1. **`GS.newRun()` (line 536):** Remove `(c.statMods[k]||0)` from stat calculation. Stats should come from species only:
   ```js
   // Before:
   stats[k] = (s.stats[k]||5) + (c.statMods[k]||0);
   // After:
   stats[k] = (s.stats[k]||5);
   ```
2. **`CC.buildSum()` (line 1030):** Same removal of `cl.statMods`:
   ```js
   // Before:
   stats[k] = (sp.stats[k]||5) + (cl.statMods[k]||0);
   // After:
   stats[k] = (sp.stats[k]||5);
   ```
3. **`CC.mkCard()` (lines 1000–1003):** Update card rendering to show ability info instead of stat modifiers. Currently renders `data.stats` string. Should instead render ability name and one-line description.
4. **`CC.buildCL()` (line 1027):** No structural change needed, but the cards should now show ability info. Consider rendering a small canvas icon for each class.

---

### Phase 3: Remove `defBase` from Defense Calculation
**Lines affected:** 518 (CALC.playerDef)

**What to do:**
1. Remove `defBase` lookup from `playerDef()`:
   ```js
   // Before:
   playerDef(r) { return (r.arm ? r.arm.dB : 0) + (CL[r.classes[0]] ? CL[r.classes[0]].defBase : 0) }
   // After:
   playerDef(r) { return (r.arm ? r.arm.dB : 0) }
   ```
2. Defense now comes purely from armor and shield blocking.

---

### Phase 4: Update Starting Gear Assignment
**Lines affected:** 542–543 (GS.newRun)

**What to do:**
1. If keeping current property names (`wpn`, `oh`, `arm`, `bp`), update to reference new CL structure. The spec uses `startGear.weapon`, `startGear.offhand`, `startGear.armor`, `startGear.backpack` — but we can keep the flat structure (`c.wpn`, `c.oh`, `c.arm`, `c.bp`) in our CL definition for compatibility.
2. Add `twoHand` flag handling: if weapon has `twoHand: true`, the offhand should be stored as `null` and the game state should indicate the offhand is locked.
3. Add a `twoHand` flag to game state or derive it from equipped weapon at runtime.

**Recommendation:** Derive two-handed lock at runtime by checking `r.wpn && r.wpn.twoHand`. No need to store a separate flag in game state.

---

### Phase 5: Implement Ability System (New Code)
**Location:** New section between CALC and GS modules (~line 530), or as part of CMB module

**What to do:**

1. **Add active buff tracking to combat state.** In `CMB.start()` (line 575), add:
   ```js
   activeBuff: null  // { name, turnsLeft, effect, trigger }
   ```

2. **Create ability activation function.** New `CMB.useAbility()` method:
   - Check MP cost (apply Smarts discount if applicable).
   - Check requirements (melee_range, ranged_equipped, spellbook_equipped).
   - For `type: 'buff'`: set `cs.activeBuff` with effect and trigger.
   - For `type: 'attack'` (Arcane Bolt): resolve immediately with special hit/damage calc.
   - For `type: 'heal'` (Holy Light): heal immediately, clamp to max HP.

3. **Modify attack resolution** in `CMB.pAct('attack')` (lines 591–612):
   - After damage calculation, check `cs.activeBuff` for matching trigger (`melee_hit` or `ranged_hit`).
   - Apply buff effects (damage multiplier, hit bonus, etc.).
   - Clear one-shot buffs after resolution.
   - For Backstab: check conditions (`first_turn`, `moved_this_turn`) to determine multiplier.
   - For Aggro: apply `dmgBonus` and `hitBonus` passively each turn, apply `incomingDmgBonus` when taking damage, decrement `turnsLeft` at end of turn.

4. **Arcane Bolt special attack path:**
   - Range 5–25m, uses Smarts for hit calculation instead of Ranged.
   - Hit formula: `55% + (Smarts - 5) × 5% - (enemy def × 3%)`.
   - Damage: 2d6 (roll two d6 and sum).
   - Requires Spellbook in offhand.
   - No close-range penalty, no arrow consumption.

5. **Smarts mana discount:** If `r.stats.smarts >= 7`, reduce ability MP cost by 1 (minimum 1). Apply at activation time.

6. **Buff stacking rules:**
   - New class buff replaces old class buff.
   - Species traits (Bloodrage, Twilight Instinct, Vanish, etc.) remain separate and always stack.

---

### Phase 6: Implement Two-Handed Weapon Logic
**Lines affected:** Equipment display in ML (character modal), combat actions, equip/unequip logic

**What to do:**
1. When a weapon with `twoHand: true` is equipped, the offhand slot is locked.
2. Display in Equipment tab: "Offhand: Locked — Greataxe (two-handed)" in `--text3`, italic.
3. Prevent equipping offhand items while two-handed weapon is equipped.
4. Unequipping a two-handed weapon frees the offhand slot.
5. Equipping a one-handed weapon unlocks offhand automatically.

**Note:** The current game does not have a full equipment swap UI. The Berserker starts with a locked offhand, and until an inventory/equipment management system is built, the two-handed logic mainly applies to the starting state and any future equip commands.

---

### Phase 7: Add Combat UI for Abilities
**Lines affected:** 310–320 (combat bar HTML), 729–741 (UI.setCombatMode, updateCombatUI), 862–883 (ML.openActs combat section)

**What to do:**
1. Add ability button to combat bar or action modal.
2. Button shows ability name, MP cost, and condition indicator (e.g., Backstab shows "3× dmg" or "1× dmg").
3. Button is disabled/hidden when:
   - MP < cost (after Smarts discount).
   - Requirement not met (not in melee range, no ranged weapon, no spellbook).
4. For Holy Light: also show button during exploration (in action modal) when HP < max and MP >= cost.
5. For Aggro: show remaining turns in HUD or combat narrative.

---

### Phase 8: Add Pixel Art Icons for Classes
**Lines affected:** 429+ (PA.icons section)

**What to do:**
1. Add 6 new icon functions to `PA.icons`:
   - `fighter()` — Crossed sword and shield silhouette.
   - `paladin()` — Shield with radiant emblem (shield in `--text2`, emblem in `--gold`).
   - `ranger()` — Bow with nocked arrow.
   - `rogue()` — Angled dagger with drops.
   - `wizard()` — Pointed hat with star (hat in `--text2`, star in `--gold`).
   - `berserker()` — Screaming face / horned skull.
2. Each icon is a 16×16 grid (matching existing icon format, which uses 8×8 grids for HUD icons). For class selection cards, render at 32×32 or 48×48.
3. Update `CC.buildCL()` to render class icons on the canvas element in each card.
4. Optionally update `CC.mkCard()` to handle class icon rendering differently from species portrait rendering.

---

### Phase 9: Update Character Creation Class Cards
**Lines affected:** 1027 (CC.buildCL), 994–1008 (CC.mkCard)

**What to do:**
1. Class cards should now show:
   - Pixel art icon (rendered on canvas).
   - Class name.
   - Flavor text (description).
   - Starting gear summary (weapon, armor, offhand).
   - Ability name and one-line description.
2. Remove stat modifier display from cards (no longer applicable).
3. Consider adding gear weight summary or mobility hint to cards.

---

### Phase 10: Update Journal Classes Tab
**Lines affected:** 899 (pgs.Classes rendering)

**What to do:**
1. Update the Classes tab in Player's Guide to show:
   - Class name and flavor text.
   - Active ability: name, MP cost, description.
   - Starting gear list.
2. Remove stat modifier display.
3. Optionally show synergy notes from the spec.

---

### Phase 11: Update HUD, Landing, and Save/Load Displays
**Lines affected:** 708–710, 745–746, 920–921, 927–928

**What to do:**
1. These sections reference `CL[r.classes[0]].name` — this continues to work as-is since the `name` property is preserved.
2. No changes needed here unless we want to show ability info or class icon in the HUD.

---

### Phase 12: Handle Aggro Turn Counter in Combat
**Lines affected:** CMB module (573–650)

**What to do:**
1. At the end of each player turn, decrement `activeBuff.turnsLeft` for sustained buffs (Aggro).
2. When `turnsLeft` reaches 0, clear the buff and show expiry message: "The red haze fades from your vision."
3. While Aggro is active, show "Aggro: X turns remaining" in combat narrative.
4. Aggro effects: +2 melee damage bonus, +10% hit chance bonus, +1 incoming damage per hit received.

---

### Phase 13: Handle Backstab Conditions
**Lines affected:** CMB.pAct (attack resolution)

**What to do:**
1. When Backstab buff is active and a melee hit lands:
   - Check `cs.turns === 0` (first turn of combat).
   - Check `cs.movedThisTurn` (player moved toward enemy this turn).
   - If either condition is true: apply `dmgMult: 3` (triple damage).
   - If neither condition is met: apply `condDmgMult: 1` (normal damage, MP still spent).
2. UI indicator shows "Backstab (3× dmg)" when conditions are met, "Backstab (1× dmg)" when not.

---

### Phase 14: Handle Vanish + Backstab Interaction
**Lines affected:** CMB.pAct, traitState handling

**What to do:**
1. Vanish (Shadowstep subspecies trait) gives 2× damage.
2. Backstab (Rogue class ability) gives 3× damage.
3. When both are active, they stack **multiplicatively**: 2 × 3 = 6× weapon damage.
4. Cost: 6 MP total (2 for Vanish + 4 for Backstab).
5. Requires: Shadowstep subspecies + Rogue class + correct timing.
6. Implementation: apply Vanish multiplier first, then Backstab multiplier, so the total is `baseDmg × vanishMult × backstabMult`.

---

## Implementation Order (Recommended)

```
Phase 1  → Update CL data object (foundation for everything else)
Phase 3  → Remove defBase from CALC.playerDef
Phase 2  → Remove statMods from GS.newRun and CC.buildSum
Phase 4  → Update starting gear assignment  
Phase 5  → Implement ability system (core new feature)
Phase 6  → Two-handed weapon logic
Phase 7  → Combat UI for abilities
Phase 12 → Aggro turn counter
Phase 13 → Backstab conditions
Phase 14 → Vanish + Backstab interaction
Phase 8  → Pixel art icons
Phase 9  → Update character creation cards
Phase 10 → Update journal
Phase 11 → Verify HUD/landing/save displays
```

Phases 1–4 are breaking changes that should be done together.
Phases 5–7 and 12–14 are the ability system and should be done together.
Phases 8–11 are UI polish and can be done last.

---

## Risk Areas & Edge Cases

1. **Save compatibility:** Existing saves reference old class keys (fighter, paladin, ranger, rogue). These still exist, so loading works. However, old saves will have stat modifiers baked into `stats` — this is fine since stats are stored as computed values, not recalculated from class.
2. **Old saves with `defBase`:** Removing `defBase` from `playerDef()` means existing characters will lose 0–1 defense. This is a balance change, not a bug.
3. **Two-handed weapon + offhand items found in-game:** Need to handle the case where a player finds an offhand item but has a two-handed weapon equipped. The item should go to backpack with a message explaining the offhand is locked.
4. **Arcane Bolt without Spellbook:** If a Wizard unequips the Spellbook, Arcane Bolt becomes unavailable. UI must reflect this.
5. **MP economy:** Abilities cost 3–5 MP. Base MP is `mana × 4` (default mana = 5, so 20 MP base). Abilities are usable ~4–6 times without regen. Balance seems reasonable.
6. **Smarts discount:** Only applies if `stats.smarts >= 7`. Default smarts is 5, so most characters need a species bonus or level-up investment to unlock this.

---

## Files Modified

- `index.html` — All changes are in this single file.

## No Changes Needed

- `manifest.json` — No changes.
- `sw.js` — No changes (but cache version should be bumped if aggressive caching is in use).
- `AGENTS.md` — May want to update the module description to note the ability system.
