#!/usr/bin/env node
// Smoke test: simulates a playthrough path and key game logic without a browser.
// Run: node smoke-test.js

const fs = require('fs');
const vm = require('vm');

// Load data.js (same as validate.js)
const dataSrc = fs.readFileSync(__dirname + '/data.js', 'utf8');
const dataWrapped = dataSrc + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;';
const dataSandbox = { UI: { addN() {} } };
vm.createContext(dataSandbox);
vm.runInContext(dataWrapped, dataSandbox);
const { ENEMIES, ITEMS, NPCS, SCENE_DATA } = dataSandbox;

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

if (errors === 0) {
  console.log('Smoke test passed: ' + visited.size + ' scenes walked, combat/loot and exits OK.');
} else {
  console.log(errors + ' error(s) in smoke test');
  process.exit(1);
}
