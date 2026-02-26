#!/usr/bin/env node
// Data integrity checker for Minute Adventurer
// Run: node validate.js

const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(__dirname + '/data.js', 'utf8');
const wrapped = src + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;';
const sandbox = { UI: { addN() {} } };
vm.createContext(sandbox);
vm.runInContext(wrapped, sandbox);

const { ENEMIES, ITEMS, NPCS, SCENE_DATA } = sandbox;
let errors = 0;

function err(msg) { errors++; process.stderr.write('ERROR: ' + msg + '\n'); }

for (const [sid, scene] of Object.entries(SCENE_DATA)) {
  if (scene.events && scene.events.combat) {
    const ek = scene.events.combat;
    if (!ENEMIES[ek]) err(`Scene "${sid}" references unknown enemy "${ek}"`);
  }
  if (scene.exits) {
    for (const [dir, exit] of Object.entries(scene.exits)) {
      if (exit.scene && !SCENE_DATA[exit.scene])
        err(`Scene "${sid}" exit "${dir}" references unknown scene "${exit.scene}"`);
    }
  }
  if (scene.npcs) {
    for (const nid of scene.npcs) {
      if (!NPCS[nid]) err(`Scene "${sid}" references unknown NPC "${nid}"`);
    }
  }
}

for (const [eid, enemy] of Object.entries(ENEMIES)) {
  if (enemy.loot) {
    for (const drop of enemy.loot) {
      if (drop.item && !ITEMS[drop.item])
        err(`Enemy "${eid}" loot references unknown item "${drop.item}"`);
    }
  }
}

if (errors === 0) {
  console.log('All checks passed (' +
    Object.keys(SCENE_DATA).length + ' scenes, ' +
    Object.keys(ENEMIES).length + ' enemies, ' +
    Object.keys(NPCS).length + ' NPCs, ' +
    Object.keys(ITEMS).length + ' items)');
} else {
  console.log(errors + ' error(s) found');
  process.exit(1);
}
