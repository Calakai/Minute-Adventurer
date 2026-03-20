#!/usr/bin/env node
// Smoke test: simulates a playthrough path and key game logic without a browser.
// Run: node smoke-test.js

const fs = require('fs');
const vm = require('vm');

// Load data.js (same as validate.js)
const dataSrc = fs.readFileSync(__dirname + '/data.js', 'utf8');
const dataWrapped = dataSrc + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;this.REGION_DATA=REGION_DATA;this.EXPLORATION_EVENTS=EXPLORATION_EVENTS;this.DUNGEON_DEFS=DUNGEON_DEFS;this.ENEMY_SYNERGIES=ENEMY_SYNERGIES;this.DUNGEON_LOOT=DUNGEON_LOOT;this.COMBAT_BYPASS=COMBAT_BYPASS;this.RECIPES=RECIPES;this.ITEM_RARITY=ITEM_RARITY;this.RARITY_COLORS=RARITY_COLORS;this.RARITY_NAMES=RARITY_NAMES;this.ENEMY_STATUS_DATA=ENEMY_STATUS_DATA;this.BESTIARY_THRESHOLDS=BESTIARY_THRESHOLDS;this.PEDIA_SECTIONS=PEDIA_SECTIONS;this.SYSTEMS_GUIDE_SECTIONS=SYSTEMS_GUIDE_SECTIONS;this.CLASS_MILESTONES=CLASS_MILESTONES;this.SPIRITFIRE_REWARDS=SPIRITFIRE_REWARDS;this.RUN_MODIFIERS=RUN_MODIFIERS;this.CLASS_TREE=CLASS_TREE;this.SHRINE_UPGRADES=SHRINE_UPGRADES;this.STATUS_EFFECTS=STATUS_EFFECTS;this.TAVERN_NPCS=TAVERN_NPCS;this.ADVENTURE_SIDE_NPCS=ADVENTURE_SIDE_NPCS;this.TAVERN_STATES=TAVERN_STATES;this.REPUTATION_TIERS=REPUTATION_TIERS;this.CLASS_UNLOCK_TIERS=CLASS_UNLOCK_TIERS;this.MILESTONES=MILESTONES;this.BOUNTIES=BOUNTIES;this.SUBCLASS_ABILITIES=SUBCLASS_ABILITIES;this.CLASS_OOC_ABILITIES=CLASS_OOC_ABILITIES;';
const dataSandbox = { UI: { addN() {} } };
vm.createContext(dataSandbox);
vm.runInContext(dataWrapped, dataSandbox);
const { ENEMIES, ITEMS, NPCS, SCENE_DATA, REGION_DATA, EXPLORATION_EVENTS, DUNGEON_DEFS, ENEMY_SYNERGIES, DUNGEON_LOOT, COMBAT_BYPASS, RECIPES, ITEM_RARITY, RARITY_COLORS, RARITY_NAMES, ENEMY_STATUS_DATA, BESTIARY_THRESHOLDS, PEDIA_SECTIONS, SYSTEMS_GUIDE_SECTIONS, CLASS_MILESTONES, SPIRITFIRE_REWARDS, RUN_MODIFIERS, CLASS_TREE, SHRINE_UPGRADES, STATUS_EFFECTS, TAVERN_NPCS, ADVENTURE_SIDE_NPCS, TAVERN_STATES, REPUTATION_TIERS, CLASS_UNLOCK_TIERS, MILESTONES, BOUNTIES, SUBCLASS_ABILITIES, CLASS_OOC_ABILITIES } = dataSandbox;

// Replicate rollLoot from index.html
function rollLoot(enemy) {
  if (!enemy.loot || !enemy.loot.length) return null;
  const total = enemy.loot.reduce((s, l) => s + l.weight, 0);
  let roll = Math.random() * total;
  for (const l of enemy.loot) {
    roll -= l.weight;
    if (roll <= 0) return l.item ? { ...ITEMS[l.item] } : null;
  }
  return null;
}

let errors = 0;
function err(msg) {
  errors++;
  console.error('ERROR:', msg);
}

// 1) Walk all scenes from trailhead and ih_entrance; verify exits and combat refs
const startScenes = ['trailhead', 'ih_entrance'];
const visited = new Set();
const queue = [...startScenes];

while (queue.length) {
  const sid = queue.shift();
  if (visited.has(sid)) continue;
  visited.add(sid);
  const scene = SCENE_DATA[sid];
  if (!scene) {
    err('Missing scene: ' + sid);
    continue;
  }
  if (scene.events && scene.events.combat) {
    const ek = scene.events.combat;
    if (!ENEMIES[ek]) err('Scene "' + sid + '" combat enemy missing: ' + ek);
    else {
      const enemy = ENEMIES[ek];
      for (let i = 0; i < 20; i++) {
        const loot = rollLoot(enemy);
        if (loot && loot.name === undefined) err('rollLoot returned invalid item for ' + ek);
      }
    }
  }
  if (scene.exits) {
    for (const [dir, exit] of Object.entries(scene.exits)) {
      if (exit.scene && !SCENE_DATA[exit.scene]) err('Scene "' + sid + '" exit "' + dir + '" -> missing scene ' + exit.scene);
      if (exit.scene && !visited.has(exit.scene)) queue.push(exit.scene);
    }
  }
}

// 2) All scenes reachable from at least one start?
const allSceneIds = Object.keys(SCENE_DATA);
const unreachable = allSceneIds.filter(id => !visited.has(id));
if (unreachable.length) console.log('Note: unreachable scenes (may be OK):', unreachable.join(', '));

// 3) First scene of each adventure has valid structure
for (const sid of startScenes) {
  const scene = SCENE_DATA[sid];
  if (!scene.name || !scene.description) err('Scene ' + sid + ' missing name or description');
  if (scene.npcs) {
    for (const nid of scene.npcs) {
      if (!NPCS[nid]) err('Scene ' + sid + ' NPC missing: ' + nid);
    }
  }
}

// === MAP GENERATION TESTS ===

// Load MAP module from index.html (extract only the MAP constant)
const htmlSrc = fs.readFileSync(__dirname + '/index.html', 'utf8');
const mapStart = htmlSrc.indexOf('const MAP={');
const mapEnd = htmlSrc.indexOf('\n// === PARTICLES ===');
if (mapStart === -1 || mapEnd === -1) {
  err('Could not locate MAP module in index.html');
} else {
  // We need NODE_TYPES and NODE_ICONS too
  const nodeTypesStart = htmlSrc.indexOf('const NODE_TYPES=');
  const mapCode = htmlSrc.substring(nodeTypesStart, mapEnd);

  // Create sandbox with dependencies
  const mapSandbox = {
    REGION_DATA, ENEMIES, ITEMS, DUNGEON_DEFS, ENEMY_SYNERGIES, COMBAT_BYPASS, DUNGEON_LOOT, STATUS_EFFECTS: {},
    CALC: { roll100: () => Math.floor(Math.random() * 100) + 1, rollDice: (d) => Math.floor(Math.random() * d) + 1 },
    GS: { run: null, saveA() {}, addXP() { return { gained: 0, leveled: false, lvls: [] } }, recDef() {} },
    UI: { addN() {}, clearN() {}, addEl() {}, setCombatMode() {}, updateHUD() {}, el: { nw: {} }, _wait() { return Promise.resolve() } },
    SE: { openShop() {}, runComplete() {}, enter() {} },
    CMB: { start() { return null }, gs() { return null } },
    ML: { openLvl() {} },
    showToast() {},
    console, Math, document: { createElement() { return { className: '', style: {}, innerHTML: '', textContent: '', appendChild() {}, classList: { add() {} }, setAttribute() {} } }, createElementNS() { return { setAttribute() {}, appendChild() {} } } }
  };
  vm.createContext(mapSandbox);
  try {
    vm.runInContext(mapCode + '\nthis.MAP=MAP;', mapSandbox);
  } catch (e) {
    err('Failed to load MAP module: ' + e.message);
  }

  if (mapSandbox.MAP) {
    const MAP = mapSandbox.MAP;

    // Test map generation for each adventure
    for (const advId of ['muddy_trail', 'iron_hollows', 'ashen_waste']) {
      let map;
      try {
        map = MAP.generate(advId);
      } catch (e) {
        err('MAP.generate("' + advId + '") threw: ' + e.message);
        continue;
      }
      if (!map) { err('MAP.generate("' + advId + '") returned null'); continue; }
      if (!map.regions || !map.regions.length) { err(advId + ' map has no regions'); continue; }

      // Check each region
      for (let ri = 0; ri < map.regions.length; ri++) {
        const region = map.regions[ri];
        if (!region.rows || !region.rows.length) { err(advId + ' region ' + ri + ' has no rows'); continue; }

        // BFS: verify all nodes reachable from row 0
        const reachable = new Set();
        region.rows[0].nodes.forEach((_, ni) => reachable.add('0_' + ni));
        for (let r = 0; r < region.rows.length - 1; r++) {
          region.rows[r].nodes.forEach((node, ni) => {
            if (reachable.has(r + '_' + ni)) {
              node.connections.forEach(ci => reachable.add((r + 1) + '_' + ci));
            }
          });
        }
        // Check last row reachable
        const lastRowIdx = region.rows.length - 1;
        region.rows[lastRowIdx].nodes.forEach((_, ni) => {
          if (!reachable.has(lastRowIdx + '_' + ni)) {
            err(advId + ' region ' + ri + ' node row' + lastRowIdx + '_n' + ni + ' unreachable');
          }
        });

        // Check sawtooth: max intensity jump <= 3 between adjacent rows
        for (let r = 1; r < region.rows.length; r++) {
          const prevMax = Math.max(...region.rows[r - 1].nodes.map(n => n.intensity));
          region.rows[r].nodes.forEach(node => {
            if (node.intensity - prevMax > 3) {
              err(advId + ' region ' + ri + ' row ' + r + ' intensity jump too high: ' + prevMax + ' -> ' + node.intensity);
            }
          });
        }
      }

      // Check boss node exists in last region last row
      const lastRegion = map.regions[map.regions.length - 1];
      const lastRow = lastRegion.rows[lastRegion.rows.length - 1];
      const hasBoss = lastRow.nodes.some(n => n.type === 'boss');
      if (!hasBoss) err(advId + ' has no boss node in final row');
    }

    // Test encounter selection doesn't reference undefined enemies
    for (const advId of ['muddy_trail', 'iron_hollows', 'ashen_waste']) {
      const ad = REGION_DATA[advId];
      for (const rDef of ad.regions) {
        for (let i = 0; i < 20; i++) {
          const ek = MAP.selectEnemy(rDef, ad, ad.roamingPool.slice(0, 1), [], false, 3);
          if (!ENEMIES[ek]) err('selectEnemy returned unknown enemy: ' + ek);
        }
      }
    }

    console.log('MAP generation tests passed for all 3 adventures.');
  }
}

// === ECONOMY & ITEMS TESTS ===

// Sell price is ~45% of value
const SELL_FACTOR = 0.45;
function sellPrice(item) { return Math.floor((item.value || 0) * SELL_FACTOR); }
for (const [iid, item] of Object.entries(ITEMS)) {
  if (item.value) {
    const sp = sellPrice(item);
    if (sp < 0) err('sellPrice for "' + iid + '" is negative: ' + sp);
    if (sp > item.value) err('sellPrice for "' + iid + '" exceeds value: ' + sp + ' > ' + item.value);
  }
}
console.log('Sell price tests passed.');

// Recipe ingredient validation
if (RECIPES) {
  for (const [rid, recipe] of Object.entries(RECIPES)) {
    for (const ing of recipe.ingredients) {
      if (!ITEMS[ing]) err('Recipe "' + rid + '" references unknown ingredient: ' + ing);
    }
    if (!ITEMS[recipe.output]) err('Recipe "' + rid + '" references unknown output: ' + recipe.output);
  }
  console.log('Recipe validation passed (' + Object.keys(RECIPES).length + ' recipes).');
}

// New consumable field validation
for (const [iid, item] of Object.entries(ITEMS)) {
  if (item.applyStatus && !item.statusDuration)
    err('Item "' + iid + '" has applyStatus but no statusDuration');
  if (item.combatBuff && !item.combatBuff.duration)
    err('Item "' + iid + '" has combatBuff but no duration');
}
console.log('New consumable field validation passed.');

// All items have valid rarity
for (const [iid, item] of Object.entries(ITEMS)) {
  if (item.rarity === undefined || item.rarity < 0 || item.rarity > 5)
    err('Item "' + iid + '" has invalid rarity: ' + item.rarity);
}
console.log('Rarity validation passed.');

// === BATCH 4: META-PROGRESSION TESTS ===

// Test bestiaryLevel logic
{
  const bestiaryLevel = (defeatCount) => {
    if (defeatCount === undefined) return 'none';
    if (defeatCount >= BESTIARY_THRESHOLDS.mastery) return 'mastery';
    if (defeatCount >= BESTIARY_THRESHOLDS.full) return 'full';
    return 'basic';
  };
  if (bestiaryLevel(undefined) !== 'none') err('bestiaryLevel(undefined) should be none');
  if (bestiaryLevel(0) !== 'basic') err('bestiaryLevel(0) should be basic');
  if (bestiaryLevel(1) !== 'full') err('bestiaryLevel(1) should be full');
  if (bestiaryLevel(2) !== 'full') err('bestiaryLevel(2) should be full');
  if (bestiaryLevel(3) !== 'mastery') err('bestiaryLevel(3) should be mastery');
  if (bestiaryLevel(10) !== 'mastery') err('bestiaryLevel(10) should be mastery');
  console.log('Bestiary level tests passed.');
}

// Test ENEMY_STATUS_DATA references valid enemies and statuses
for (const [eid, esd] of Object.entries(ENEMY_STATUS_DATA)) {
  if (!ENEMIES[eid]) err('ENEMY_STATUS_DATA references unknown enemy: ' + eid);
  for (const s of (esd.weak || [])) {
    if (!STATUS_EFFECTS[s]) err('ENEMY_STATUS_DATA "' + eid + '" weak references unknown status: ' + s);
  }
  for (const s of (esd.resist || [])) {
    if (!STATUS_EFFECTS[s]) err('ENEMY_STATUS_DATA "' + eid + '" resist references unknown status: ' + s);
  }
}
console.log('ENEMY_STATUS_DATA validation passed (' + Object.keys(ENEMY_STATUS_DATA).length + ' entries).');

// Test RUN_MODIFIERS keys
for (const [key, mod] of Object.entries(RUN_MODIFIERS)) {
  if (!mod.name || typeof mod.name !== 'string') err('RUN_MODIFIERS "' + key + '" has invalid name');
  if (!mod.desc || typeof mod.desc !== 'string') err('RUN_MODIFIERS "' + key + '" has invalid desc');
}
console.log('RUN_MODIFIERS validation passed (' + Object.keys(RUN_MODIFIERS).length + ' modifiers).');

// Test CLASS_MILESTONES
const CL_KEYS = ['fighter','paladin','ranger','rogue','wizard','berserker','gunslinger','necromancer','warlock'];
for (const [cl, milestones] of Object.entries(CLASS_MILESTONES)) {
  if (!CL_KEYS.includes(cl)) err('CLASS_MILESTONES references unknown class: ' + cl);
  for (const ms of milestones) {
    if (!ms.id || !ms.desc || !ms.trackKey || typeof ms.target !== 'number' || typeof ms.reward !== 'number')
      err('CLASS_MILESTONES "' + cl + '" has malformed milestone: ' + ms.id);
  }
}
console.log('CLASS_MILESTONES validation passed (' + Object.keys(CLASS_MILESTONES).length + ' classes).');

// Test CLASS_TREE 135-node web model
{
  const allIds = new Set();
  let dupes = 0;
  let totalCP = 0;
  for (const [cl, tree] of Object.entries(CLASS_TREE)) {
    if (!tree.nodes || tree.nodes.length !== 15) { err('CLASS_TREE ' + cl + ' should have 15 nodes, has ' + (tree.nodes ? tree.nodes.length : 0)); }
    const cp = tree.nodes.reduce((s,n) => s + n.cost, 0);
    if (cp !== 53) err('CLASS_TREE ' + cl + ' CP total ' + cp + ' (expected 53)');
    totalCP += cp;
    for (const node of tree.nodes) {
      if (allIds.has(node.id)) { err('CLASS_TREE duplicate node ID: ' + node.id); dupes++; }
      allIds.add(node.id);
      if (!node.effects || !Array.isArray(node.effects)) err('CLASS_TREE node ' + node.id + ' missing effects');
    }
    if (!tree.subclasses || Object.keys(tree.subclasses).length !== 3) err('CLASS_TREE ' + cl + ' missing 3 subclasses');
    // Check prereq integrity
    const classIds = new Set(tree.nodes.map(n => n.id));
    for (const node of tree.nodes) {
      if (node.prereq && Array.isArray(node.prereq)) {
        for (const group of node.prereq) {
          for (const pid of group) {
            if (!classIds.has(pid)) err('CLASS_TREE ' + cl + ' node ' + node.id + ' prereq ' + pid + ' not found');
          }
        }
      }
    }
  }
  if (dupes === 0) console.log('CLASS_TREE node ID uniqueness passed (' + allIds.size + ' nodes, ' + totalCP + ' total CP).');
}

// Test SUBCLASS_ABILITIES (27 entries)
{
  let count = 0;
  for (const cl of Object.keys(SUBCLASS_ABILITIES)) {
    for (const sub of Object.keys(SUBCLASS_ABILITIES[cl])) {
      count++;
      const ab = SUBCLASS_ABILITIES[cl][sub];
      if (!ab.name || typeof ab.cost !== 'number') err('SUBCLASS_ABILITIES ' + cl + '.' + sub + ' invalid');
    }
  }
  if (count === 27) console.log('SUBCLASS_ABILITIES: 27 entries verified.');
  else err('SUBCLASS_ABILITIES has ' + count + ' entries (expected 27)');
}

// Test CLASS_OOC_ABILITIES (18 entries)
{
  let count = 0;
  const statCounts = {sight:0,speech:0,movement:0};
  for (const [cl, data] of Object.entries(CLASS_OOC_ABILITIES)) {
    if (data.stat) statCounts[data.stat] = (statCounts[data.stat]||0) + 1;
    for (const ab of (data.abilities || [])) {
      count++;
      if (!ab.id || !ab.name) err('CLASS_OOC_ABILITIES ' + cl + ' ability missing id/name');
    }
  }
  if (count === 18) console.log('CLASS_OOC_ABILITIES: 18 entries verified (Sight:' + statCounts.sight + ' Speech:' + statCounts.speech + ' Movement:' + statCounts.movement + ').');
  else err('CLASS_OOC_ABILITIES has ' + count + ' entries (expected 18)');
}

// Test SPIRITFIRE_REWARDS has correct fields
if (typeof SPIRITFIRE_REWARDS.newEntry !== 'number') err('SPIRITFIRE_REWARDS.newEntry missing');
if (typeof SPIRITFIRE_REWARDS.threshold25 !== 'number') err('SPIRITFIRE_REWARDS.threshold25 missing');
if (typeof SPIRITFIRE_REWARDS.threshold50 !== 'number') err('SPIRITFIRE_REWARDS.threshold50 missing');
if (typeof SPIRITFIRE_REWARDS.threshold75 !== 'number') err('SPIRITFIRE_REWARDS.threshold75 missing');
if (typeof SPIRITFIRE_REWARDS.threshold100 !== 'number') err('SPIRITFIRE_REWARDS.threshold100 missing');
console.log('SPIRITFIRE_REWARDS validation passed.');

// Test PEDIA_SECTIONS
if (!Array.isArray(PEDIA_SECTIONS) || PEDIA_SECTIONS.length !== 7) err('PEDIA_SECTIONS should have 7 sections');
PEDIA_SECTIONS.forEach(sec => {
  if (!sec.key || !sec.name || !sec.icon) err('PEDIA_SECTIONS entry missing key/name/icon: ' + JSON.stringify(sec));
});
console.log('PEDIA_SECTIONS validation passed.');

// Test SHRINE_UPGRADES
for (const [cat, upgrades] of Object.entries(SHRINE_UPGRADES)) {
  for (const up of upgrades) {
    if (!up.id || !up.name || typeof up.cost !== 'number' || !up.desc)
      err('SHRINE_UPGRADES "' + cat + '" has malformed upgrade: ' + up.id);
  }
}
console.log('SHRINE_UPGRADES validation passed.');

// === BATCH 5: TAVERN & NPC TESTS ===

// Test TAVERN_NPCS constant integrity
if (!TAVERN_NPCS || typeof TAVERN_NPCS !== 'object') err('TAVERN_NPCS missing or not an object');
else {
  const tvnKeys = Object.keys(TAVERN_NPCS);
  if (tvnKeys.length < 7) err('TAVERN_NPCS should have at least 7 NPCs, got ' + tvnKeys.length);
  for (const [nid, npc] of Object.entries(TAVERN_NPCS)) {
    if (!nid.startsWith('tvn_')) err('TAVERN_NPCS key "' + nid + '" does not have tvn_ prefix');
    if (!npc.name || typeof npc.name !== 'string') err('TAVERN_NPCS "' + nid + '" missing name');
    if (!npc.services || !Array.isArray(npc.services)) err('TAVERN_NPCS "' + nid + '" missing services array');
    if (!npc.dialoguePool || typeof npc.dialoguePool !== 'object') err('TAVERN_NPCS "' + nid + '" missing dialoguePool');
  }
  // Hearthkeeper must always be present (no recruit condition)
  if (TAVERN_NPCS.tvn_hearthkeeper && TAVERN_NPCS.tvn_hearthkeeper.recruitCondition !== null)
    err('tvn_hearthkeeper should have null recruitCondition');
  console.log('TAVERN_NPCS validation passed (' + tvnKeys.length + ' NPCs).');
}

// Test ADVENTURE_SIDE_NPCS
if (!ADVENTURE_SIDE_NPCS || typeof ADVENTURE_SIDE_NPCS !== 'object') err('ADVENTURE_SIDE_NPCS missing');
else {
  for (const [nid, npc] of Object.entries(ADVENTURE_SIDE_NPCS)) {
    if (!npc.name) err('ADVENTURE_SIDE_NPCS "' + nid + '" missing name');
    if (!npc.adventure) err('ADVENTURE_SIDE_NPCS "' + nid + '" missing adventure');
  }
  console.log('ADVENTURE_SIDE_NPCS validation passed (' + Object.keys(ADVENTURE_SIDE_NPCS).length + ' NPCs).');
}

// Test TAVERN_STATES ordering
if (!TAVERN_STATES || typeof TAVERN_STATES !== 'object') err('TAVERN_STATES missing');
else {
  const stateKeys = Object.keys(TAVERN_STATES);
  const expectedOrder = ['ember', 'spark', 'flame', 'hearth'];
  for (const k of expectedOrder) {
    if (!TAVERN_STATES[k]) err('TAVERN_STATES missing expected state "' + k + '"');
  }
  let prevMin = -1;
  for (const k of expectedOrder) {
    if (TAVERN_STATES[k]) {
      if (TAVERN_STATES[k].minNPCs <= prevMin) err('TAVERN_STATES "' + k + '" minNPCs not ascending');
      prevMin = TAVERN_STATES[k].minNPCs;
    }
  }
  console.log('TAVERN_STATES validation passed (' + stateKeys.length + ' states).');
}

// Test REPUTATION_TIERS
if (!Array.isArray(REPUTATION_TIERS)) err('REPUTATION_TIERS is not an array');
else {
  if (REPUTATION_TIERS.length < 3) err('REPUTATION_TIERS should have at least 3 tiers');
  let prevThresh = -1;
  for (const tier of REPUTATION_TIERS) {
    if (tier.threshold < prevThresh) err('REPUTATION_TIERS not in ascending threshold order');
    prevThresh = tier.threshold;
  }
  console.log('REPUTATION_TIERS validation passed (' + REPUTATION_TIERS.length + ' tiers).');
}

// Test CLASS_UNLOCK_TIERS class counts
if (!CLASS_UNLOCK_TIERS || typeof CLASS_UNLOCK_TIERS !== 'object') err('CLASS_UNLOCK_TIERS missing');
else {
  const ALL_CL = ['fighter','paladin','ranger','rogue','wizard','berserker','gunslinger','necromancer','warlock'];
  const allTierClasses = [];
  for (const [tier, data] of Object.entries(CLASS_UNLOCK_TIERS)) {
    if (!Array.isArray(data.classes)) err('CLASS_UNLOCK_TIERS "' + tier + '" classes not an array');
    else allTierClasses.push(...data.classes);
  }
  // Every class should appear exactly once across all tiers
  for (const cl of ALL_CL) {
    const count = allTierClasses.filter(c => c === cl).length;
    if (count !== 1) err('Class "' + cl + '" appears ' + count + ' times in CLASS_UNLOCK_TIERS (expected 1)');
  }
  console.log('CLASS_UNLOCK_TIERS validation passed (' + Object.keys(CLASS_UNLOCK_TIERS).length + ' tiers, ' + allTierClasses.length + ' classes).');
}

// Test MILESTONES structure
if (!MILESTONES || typeof MILESTONES !== 'object') err('MILESTONES missing');
else {
  let tierA = 0, tierB = 0;
  for (const [mid, ms] of Object.entries(MILESTONES)) {
    if (!ms.name || !ms.desc) err('MILESTONES "' + mid + '" missing name or desc');
    if (!ms.tier || !['A','B'].includes(ms.tier)) err('MILESTONES "' + mid + '" invalid tier');
    if (typeof ms.target !== 'number' || ms.target <= 0) err('MILESTONES "' + mid + '" invalid target');
    if (!ms.trackKey) err('MILESTONES "' + mid + '" missing trackKey');
    if (!ms.reward || typeof ms.reward !== 'object') err('MILESTONES "' + mid + '" missing reward object');
    if (ms.tier === 'A') tierA++;
    else if (ms.tier === 'B') tierB++;
  }
  console.log('MILESTONES validation passed (' + tierA + ' Tier A, ' + tierB + ' Tier B).');
}

// Test bounty capture flags on tier 2+
{
  let captureCount = 0;
  for (const [bid, bounty] of Object.entries(BOUNTIES)) {
    if (bounty.capture) captureCount++;
  }
  if (captureCount === 0) err('No bounties have capture:true flag');
  console.log('Bounty capture flags: ' + captureCount + ' capture bounties found.');
}

if (errors === 0) {
  console.log('Smoke test passed: ' + visited.size + ' scenes walked, combat/loot and exits OK.');
} else {
  console.log(errors + ' error(s) in smoke test');
  process.exit(1);
}
