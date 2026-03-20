#!/usr/bin/env node
// Data integrity checker for Minute Adventurer
// Run: node validate.js

const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(__dirname + '/data.js', 'utf8');
const wrapped = src + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;this.BOUNTIES=BOUNTIES;this.QUESTS=QUESTS;this.DEATH_QUOTES=DEATH_QUOTES;this.REGION_DATA=REGION_DATA;this.EXPLORATION_EVENTS=EXPLORATION_EVENTS;this.DUNGEON_DEFS=DUNGEON_DEFS;this.ENEMY_SYNERGIES=ENEMY_SYNERGIES;this.DUNGEON_LOOT=DUNGEON_LOOT;this.RECIPES=RECIPES;this.ITEM_RARITY=ITEM_RARITY;this.RARITY_NAMES=RARITY_NAMES;this.ENEMY_STATUS_DATA=ENEMY_STATUS_DATA;this.BESTIARY_THRESHOLDS=BESTIARY_THRESHOLDS;this.PEDIA_SECTIONS=PEDIA_SECTIONS;this.SYSTEMS_GUIDE_SECTIONS=SYSTEMS_GUIDE_SECTIONS;this.CLASS_MILESTONES=CLASS_MILESTONES;this.SPIRITFIRE_REWARDS=SPIRITFIRE_REWARDS;this.RUN_MODIFIERS=RUN_MODIFIERS;this.CLASS_TREE=CLASS_TREE;this.SHRINE_UPGRADES=SHRINE_UPGRADES;this.STATUS_EFFECTS=STATUS_EFFECTS;';
const sandbox = { UI: { addN() {} }, GS: { saveA() {} } };
vm.createContext(sandbox);
vm.runInContext(wrapped, sandbox);

const { ENEMIES, ITEMS, NPCS, SCENE_DATA, BOUNTIES, QUESTS, DEATH_QUOTES, REGION_DATA, EXPLORATION_EVENTS, DUNGEON_DEFS, ENEMY_SYNERGIES, DUNGEON_LOOT, RECIPES, ITEM_RARITY, RARITY_NAMES, ENEMY_STATUS_DATA, BESTIARY_THRESHOLDS, PEDIA_SECTIONS, SYSTEMS_GUIDE_SECTIONS, CLASS_MILESTONES, SPIRITFIRE_REWARDS, RUN_MODIFIERS, CLASS_TREE, SHRINE_UPGRADES, STATUS_EFFECTS } = sandbox;
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

// Item rarity validation
for (const [iid, item] of Object.entries(ITEMS)) {
  if (item.rarity === undefined || item.rarity < 0 || item.rarity > 5)
    err(`Item "${iid}" has invalid or missing rarity (got ${item.rarity})`);
}

// Recipe validation
if (RECIPES) {
  for (const [rid, recipe] of Object.entries(RECIPES)) {
    if (!recipe.ingredients || !recipe.ingredients.length)
      err(`Recipe "${rid}" has no ingredients`);
    for (const ing of (recipe.ingredients || [])) {
      if (!ITEMS[ing])
        err(`Recipe "${rid}" references unknown ingredient "${ing}"`);
    }
    if (!recipe.output || !ITEMS[recipe.output])
      err(`Recipe "${rid}" references unknown output "${recipe.output}"`);
    if (recipe.output && ITEMS[recipe.output] && ITEMS[recipe.output].rarity > 2)
      warn(`Recipe "${rid}" output "${recipe.output}" exceeds Rare rarity (${ITEMS[recipe.output].rarity})`);
  }
}

// Batch 4: ENEMY_STATUS_DATA validation
if (ENEMY_STATUS_DATA) {
  for (const [eid, esd] of Object.entries(ENEMY_STATUS_DATA)) {
    if (!ENEMIES[eid]) err(`ENEMY_STATUS_DATA references unknown enemy "${eid}"`);
    for (const s of (esd.weak || [])) {
      if (!STATUS_EFFECTS[s]) err(`ENEMY_STATUS_DATA "${eid}" weak references unknown status "${s}"`);
    }
    for (const s of (esd.resist || [])) {
      if (!STATUS_EFFECTS[s]) err(`ENEMY_STATUS_DATA "${eid}" resist references unknown status "${s}"`);
    }
  }
}

// Batch 4: CLASS_MILESTONES validation
if (CLASS_MILESTONES) {
  const CL_KEYS = ['fighter','paladin','ranger','rogue','wizard','berserker','gunslinger','necromancer','warlock'];
  for (const [cl, milestones] of Object.entries(CLASS_MILESTONES)) {
    if (!CL_KEYS.includes(cl)) warn(`CLASS_MILESTONES references unknown class "${cl}"`);
    const ids = new Set();
    for (const ms of milestones) {
      if (ids.has(ms.id)) err(`CLASS_MILESTONES "${cl}" has duplicate milestone id "${ms.id}"`);
      ids.add(ms.id);
    }
  }
}

// Batch 4: CLASS_TREE validation
if (CLASS_TREE) {
  const allNodeIds = new Set();
  for (const [cl, tree] of Object.entries(CLASS_TREE)) {
    const classNodeIds = new Set();
    for (const node of tree.trunk) {
      if (allNodeIds.has(node.id)) err(`CLASS_TREE node id "${node.id}" duplicated across classes`);
      allNodeIds.add(node.id);
      classNodeIds.add(node.id);
      if (node.prereq && !classNodeIds.has(node.prereq))
        err(`CLASS_TREE "${cl}" node "${node.id}" prereq "${node.prereq}" not found`);
    }
    for (const [bk, branch] of Object.entries(tree.branches)) {
      for (const node of branch.nodes) {
        if (allNodeIds.has(node.id)) err(`CLASS_TREE node id "${node.id}" duplicated across classes`);
        allNodeIds.add(node.id);
        if (node.prereq && !classNodeIds.has(node.prereq))
          err(`CLASS_TREE "${cl}" branch "${bk}" node "${node.id}" prereq "${node.prereq}" not found`);
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
