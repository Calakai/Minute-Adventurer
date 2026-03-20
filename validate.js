#!/usr/bin/env node
// Data integrity checker for Minute Adventurer
// Run: node validate.js

const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(__dirname + '/data.js', 'utf8');
const wrapped = src + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;this.BOUNTIES=BOUNTIES;this.QUESTS=QUESTS;this.DEATH_QUOTES=DEATH_QUOTES;this.REGION_DATA=REGION_DATA;this.EXPLORATION_EVENTS=EXPLORATION_EVENTS;this.DUNGEON_DEFS=DUNGEON_DEFS;this.ENEMY_SYNERGIES=ENEMY_SYNERGIES;this.DUNGEON_LOOT=DUNGEON_LOOT;';
const sandbox = { UI: { addN() {} }, GS: { saveA() {} } };
vm.createContext(sandbox);
vm.runInContext(wrapped, sandbox);

const { ENEMIES, ITEMS, NPCS, SCENE_DATA, BOUNTIES, QUESTS, DEATH_QUOTES, REGION_DATA, EXPLORATION_EVENTS, DUNGEON_DEFS, ENEMY_SYNERGIES, DUNGEON_LOOT } = sandbox;
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

// Region data validation
if (REGION_DATA) {
  for (const [advId, ad] of Object.entries(REGION_DATA)) {
    if (!ad.regions || !ad.regions.length) err(`REGION_DATA "${advId}" has no regions`);
    if (ad.boss && !ENEMIES[ad.boss]) err(`REGION_DATA "${advId}" boss "${ad.boss}" not in ENEMIES`);
    if (ad.transitionEnemy && !ENEMIES[ad.transitionEnemy]) err(`REGION_DATA "${advId}" transitionEnemy "${ad.transitionEnemy}" not in ENEMIES`);
    for (const ek of (ad.roamingPool || [])) {
      if (!ENEMIES[ek]) err(`REGION_DATA "${advId}" roamingPool references unknown enemy "${ek}"`);
    }
    for (const reg of (ad.regions || [])) {
      for (const ek of (reg.corePool || [])) {
        if (!ENEMIES[ek]) err(`Region "${reg.id}" corePool references unknown enemy "${ek}"`);
      }
      for (const ek of (reg.elitePool || [])) {
        if (!ENEMIES[ek]) err(`Region "${reg.id}" elitePool references unknown enemy "${ek}"`);
      }
      for (const ek of (reg.rarePool || [])) {
        if (!ENEMIES[ek]) err(`Region "${reg.id}" rarePool references unknown enemy "${ek}"`);
      }
    }
  }
}

// Dungeon definitions validation
if (DUNGEON_DEFS) {
  for (const [advId, def] of Object.entries(DUNGEON_DEFS)) {
    if (!ENEMIES[def.boss]) err(`DUNGEON_DEFS "${advId}" boss "${def.boss}" not in ENEMIES`);
    for (const ek of (def.enemies || [])) {
      if (!ENEMIES[ek]) err(`DUNGEON_DEFS "${advId}" references unknown enemy "${ek}"`);
    }
    if (def.bossLoot && DUNGEON_LOOT && !DUNGEON_LOOT[def.bossLoot])
      err(`DUNGEON_DEFS "${advId}" bossLoot "${def.bossLoot}" not in DUNGEON_LOOT`);
  }
}

// Enemy synergies validation
if (ENEMY_SYNERGIES) {
  for (const syn of ENEMY_SYNERGIES) {
    for (const ek of syn.pair) {
      if (!ENEMIES[ek]) err(`ENEMY_SYNERGIES pair references unknown enemy "${ek}"`);
    }
  }
}

// Exploration events validation
if (EXPLORATION_EVENTS) {
  const validStats = ['sight', 'speech', 'movement', 'melee', 'ranged', 'health', 'smarts'];
  for (const [evId, ev] of Object.entries(EXPLORATION_EVENTS)) {
    if (ev.stat && !validStats.includes(ev.stat))
      err(`EXPLORATION_EVENTS "${evId}" references unknown stat "${ev.stat}"`);
    if (ev.reward && ev.reward.pool) {
      for (const ik of ev.reward.pool) {
        if (ik !== 'gold_small' && !ITEMS[ik])
          err(`EXPLORATION_EVENTS "${evId}" reward pool references unknown item "${ik}"`);
      }
    }
  }
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
