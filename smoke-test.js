#!/usr/bin/env node
// Smoke test: simulates a playthrough path and key game logic without a browser.
// Run: node smoke-test.js

const fs = require('fs');
const vm = require('vm');

// Load data.js (same as validate.js)
const dataSrc = fs.readFileSync(__dirname + '/data.js', 'utf8');
const dataWrapped = dataSrc + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;this.REGION_DATA=REGION_DATA;this.EXPLORATION_EVENTS=EXPLORATION_EVENTS;this.DUNGEON_DEFS=DUNGEON_DEFS;this.ENEMY_SYNERGIES=ENEMY_SYNERGIES;this.DUNGEON_LOOT=DUNGEON_LOOT;this.COMBAT_BYPASS=COMBAT_BYPASS;this.RECIPES=RECIPES;this.ITEM_RARITY=ITEM_RARITY;this.RARITY_COLORS=RARITY_COLORS;this.RARITY_NAMES=RARITY_NAMES;';
const dataSandbox = { UI: { addN() {} } };
vm.createContext(dataSandbox);
vm.runInContext(dataWrapped, dataSandbox);
const { ENEMIES, ITEMS, NPCS, SCENE_DATA, REGION_DATA, EXPLORATION_EVENTS, DUNGEON_DEFS, ENEMY_SYNERGIES, DUNGEON_LOOT, COMBAT_BYPASS, RECIPES, ITEM_RARITY, RARITY_COLORS, RARITY_NAMES } = dataSandbox;

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

if (errors === 0) {
  console.log('Smoke test passed: ' + visited.size + ' scenes walked, combat/loot and exits OK.');
} else {
  console.log(errors + ' error(s) in smoke test');
  process.exit(1);
}
