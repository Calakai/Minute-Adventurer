#!/usr/bin/env node
// Data integrity checker for Minute Adventurer
// Run: node validate.js

const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(__dirname + '/data.js', 'utf8');
const wrapped = src + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;this.BOUNTIES=BOUNTIES;this.QUESTS=QUESTS;this.DEATH_QUOTES=DEATH_QUOTES;';
const sandbox = { UI: { addN() {} }, GS: { saveA() {} } };
vm.createContext(sandbox);
vm.runInContext(wrapped, sandbox);

const { ENEMIES, ITEMS, NPCS, SCENE_DATA, BOUNTIES, QUESTS, DEATH_QUOTES } = sandbox;
let errors = 0;
let warnings = 0;

function err(msg) { errors++; process.stderr.write('ERROR: ' + msg + '\n'); }
function warn(msg) { warnings++; process.stderr.write('WARN:  ' + msg + '\n'); }

// Scene validation
for (const [sid, scene] of Object.entries(SCENE_DATA)) {
  if (scene.events && scene.events.combat) {
    const combat = scene.events.combat;
    const keys = Array.isArray(combat) ? combat : [combat];
    for (const ek of keys) {
      if (!ENEMIES[ek]) err(`Scene "${sid}" references unknown enemy "${ek}"`);
    }
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

// Enemy validation
const validTypes = ['consumable', 'melee', 'ranged', 'armor', 'shield', 'quiver', 'spellbook', 'light', 'misc', 'key'];
for (const [eid, enemy] of Object.entries(ENEMIES)) {
  if (enemy.loot) {
    for (const drop of enemy.loot) {
      if (drop.item && !ITEMS[drop.item])
        err(`Enemy "${eid}" loot references unknown item "${drop.item}"`);
    }
  }
  if (typeof enemy.tier !== 'number' || enemy.tier < 1 || enemy.tier > 5)
    err(`Enemy "${eid}" has invalid or missing tier`);
  if (!enemy.lore) warn(`Enemy "${eid}" has no lore`);
}

// Item validation
for (const [iid, item] of Object.entries(ITEMS)) {
  if (!validTypes.includes(item.t))
    err(`Item "${iid}" has unknown type "${item.t}"`);
}

// NPC validation
for (const [nid, npc] of Object.entries(NPCS)) {
  if (npc.dialogue) {
    if (!npc.dialogue.initial)
      err(`NPC "${nid}" has dialogue but no 'initial' node`);
    for (const [nodeId, node] of Object.entries(npc.dialogue)) {
      if (node.options) {
        for (const opt of node.options) {
          if (opt.next && !npc.dialogue[opt.next])
            err(`NPC "${nid}" dialogue node "${nodeId}" option references unknown node "${opt.next}"`);
        }
      }
    }
  }
  if (npc.shop && npc.shop.stock) {
    for (const s of npc.shop.stock) {
      if (!ITEMS[s.key])
        err(`NPC "${nid}" shop references unknown item "${s.key}"`);
    }
  }
}

// Bounty validation
for (const [bid, bounty] of Object.entries(BOUNTIES)) {
  if (!ENEMIES[bounty.enemy])
    err(`Bounty "${bid}" references unknown enemy "${bounty.enemy}"`);
}

// Quest validation
for (const [qid, quest] of Object.entries(QUESTS)) {
  if (quest.reward.item && !ITEMS[quest.reward.item])
    err(`Quest "${qid}" reward references unknown item "${quest.reward.item}"`);
}

// Summary
const counts = [
  Object.keys(SCENE_DATA).length + ' scenes',
  Object.keys(ENEMIES).length + ' enemies',
  Object.keys(NPCS).length + ' NPCs',
  Object.keys(ITEMS).length + ' items',
  Object.keys(BOUNTIES).length + ' bounties',
  Object.keys(QUESTS).length + ' quests',
  (DEATH_QUOTES ? DEATH_QUOTES.length : 0) + ' death quotes'
];

if (errors === 0) {
  console.log('All checks passed (' + counts.join(', ') + ')');
  if (warnings > 0) console.log(warnings + ' warning(s)');
} else {
  console.log(errors + ' error(s) found');
  if (warnings > 0) console.log(warnings + ' warning(s)');
  process.exit(1);
}
