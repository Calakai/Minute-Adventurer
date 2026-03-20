#!/usr/bin/env node
// Data integrity checker for Minute Adventurer
// Run: node validate.js

const fs = require('fs');
const vm = require('vm');

const src = fs.readFileSync(__dirname + '/data.js', 'utf8');
const wrapped = src + '\nthis.ENEMIES=ENEMIES;this.ITEMS=ITEMS;this.NPCS=NPCS;this.SCENE_DATA=SCENE_DATA;this.BOUNTIES=BOUNTIES;this.QUESTS=QUESTS;this.DEATH_QUOTES=DEATH_QUOTES;this.REGION_DATA=REGION_DATA;this.EXPLORATION_EVENTS=EXPLORATION_EVENTS;this.DUNGEON_DEFS=DUNGEON_DEFS;this.ENEMY_SYNERGIES=ENEMY_SYNERGIES;this.DUNGEON_LOOT=DUNGEON_LOOT;this.RECIPES=RECIPES;this.ITEM_RARITY=ITEM_RARITY;this.RARITY_NAMES=RARITY_NAMES;this.ENEMY_STATUS_DATA=ENEMY_STATUS_DATA;this.BESTIARY_THRESHOLDS=BESTIARY_THRESHOLDS;this.PEDIA_SECTIONS=PEDIA_SECTIONS;this.SYSTEMS_GUIDE_SECTIONS=SYSTEMS_GUIDE_SECTIONS;this.CLASS_MILESTONES=CLASS_MILESTONES;this.SPIRITFIRE_REWARDS=SPIRITFIRE_REWARDS;this.RUN_MODIFIERS=RUN_MODIFIERS;this.CLASS_TREE=CLASS_TREE;this.SHRINE_UPGRADES=SHRINE_UPGRADES;this.STATUS_EFFECTS=STATUS_EFFECTS;this.TAVERN_NPCS=TAVERN_NPCS;this.ADVENTURE_SIDE_NPCS=ADVENTURE_SIDE_NPCS;this.TAVERN_STATES=TAVERN_STATES;this.REPUTATION_TIERS=REPUTATION_TIERS;this.CLASS_UNLOCK_TIERS=CLASS_UNLOCK_TIERS;this.MILESTONES=MILESTONES;this.SUBCLASS_ABILITIES=SUBCLASS_ABILITIES;this.CLASS_OOC_ABILITIES=CLASS_OOC_ABILITIES;this.CHRONICLE_QUOTES=CHRONICLE_QUOTES;this.TOOLTIP_TEXT=TOOLTIP_TEXT;this.TUTORIAL_COMPANION=TUTORIAL_COMPANION;this.TUTORIAL_ENCOUNTERS=TUTORIAL_ENCOUNTERS;this.OPENING_DIALOGUE=OPENING_DIALOGUE;this.LEGEND_MODE=LEGEND_MODE;';
const sandbox = { UI: { addN() {} }, GS: { saveA() {} } };
vm.createContext(sandbox);
vm.runInContext(wrapped, sandbox);

const { ENEMIES, ITEMS, NPCS, SCENE_DATA, BOUNTIES, QUESTS, DEATH_QUOTES, REGION_DATA, EXPLORATION_EVENTS, DUNGEON_DEFS, ENEMY_SYNERGIES, DUNGEON_LOOT, RECIPES, ITEM_RARITY, RARITY_NAMES, ENEMY_STATUS_DATA, BESTIARY_THRESHOLDS, PEDIA_SECTIONS, SYSTEMS_GUIDE_SECTIONS, CLASS_MILESTONES, SPIRITFIRE_REWARDS, RUN_MODIFIERS, CLASS_TREE, SHRINE_UPGRADES, STATUS_EFFECTS, TAVERN_NPCS, ADVENTURE_SIDE_NPCS, TAVERN_STATES, REPUTATION_TIERS, CLASS_UNLOCK_TIERS, MILESTONES, SUBCLASS_ABILITIES, CLASS_OOC_ABILITIES, CHRONICLE_QUOTES, TOOLTIP_TEXT, TUTORIAL_COMPANION, TUTORIAL_ENCOUNTERS, OPENING_DIALOGUE, LEGEND_MODE } = sandbox;
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
      if (nid.startsWith('tvn_')) { if (!TAVERN_NPCS[nid]) err(`Scene "${sid}" references unknown tavern NPC "${nid}"`) }
      else if (!NPCS[nid]) err(`Scene "${sid}" references unknown NPC "${nid}"`);
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

// Batch 4/6: CLASS_TREE validation (135-node web model)
if (CLASS_TREE) {
  const allNodeIds = new Set();
  const CL_KEYS_TREE = ['fighter','paladin','ranger','rogue','wizard','berserker','gunslinger','necromancer','warlock'];
  for (const [cl, tree] of Object.entries(CLASS_TREE)) {
    if (!tree.nodes || !Array.isArray(tree.nodes))
      { err(`CLASS_TREE "${cl}" missing nodes array`); continue; }
    if (tree.nodes.length !== 15)
      err(`CLASS_TREE "${cl}" has ${tree.nodes.length} nodes (expected 15)`);
    const cpTotal = tree.nodes.reduce((s,n) => s + n.cost, 0);
    if (cpTotal !== 53)
      err(`CLASS_TREE "${cl}" CP total is ${cpTotal} (expected 53)`);
    const classNodeIds = new Set();
    let generalCount = 0, subclassCount = 0, unlockCount = 0;
    for (const node of tree.nodes) {
      if (allNodeIds.has(node.id)) err(`CLASS_TREE node id "${node.id}" duplicated across classes`);
      allNodeIds.add(node.id);
      classNodeIds.add(node.id);
      if (!node.effects || !Array.isArray(node.effects))
        err(`CLASS_TREE "${cl}" node "${node.id}" missing effects array`);
      if (typeof node.tier !== 'number' || node.tier < 1 || node.tier > 5)
        err(`CLASS_TREE "${cl}" node "${node.id}" invalid tier ${node.tier}`);
      if (node.type === 'general') generalCount++;
      else if (node.type === 'unlock') unlockCount++;
      else subclassCount++;
      // Validate prereqs reference valid IDs within class
      if (node.prereq && Array.isArray(node.prereq)) {
        for (const group of node.prereq) {
          for (const pid of group) {
            if (!classNodeIds.has(pid) && !tree.nodes.some(n => n.id === pid))
              err(`CLASS_TREE "${cl}" node "${node.id}" prereq "${pid}" not found in class`);
          }
        }
      }
      // Unlock nodes must have subclass and minNodes
      if (node.type === 'unlock') {
        if (!node.subclass) err(`CLASS_TREE "${cl}" unlock node "${node.id}" missing subclass`);
        if (typeof node.minNodes !== 'number') err(`CLASS_TREE "${cl}" unlock node "${node.id}" missing minNodes`);
      }
    }
    if (generalCount !== 6) err(`CLASS_TREE "${cl}" has ${generalCount} general nodes (expected 6)`);
    if (subclassCount !== 6) err(`CLASS_TREE "${cl}" has ${subclassCount} subclass-aligned nodes (expected 6)`);
    if (unlockCount !== 3) err(`CLASS_TREE "${cl}" has ${unlockCount} unlock nodes (expected 3)`);
    // Validate subclasses object
    if (!tree.subclasses || Object.keys(tree.subclasses).length !== 3)
      err(`CLASS_TREE "${cl}" must have exactly 3 subclasses`);
  }
  if (allNodeIds.size !== 135)
    err(`CLASS_TREE total nodes: ${allNodeIds.size} (expected 135)`);
}

// Batch 6: SUBCLASS_ABILITIES validation
if (typeof SUBCLASS_ABILITIES !== 'undefined' && SUBCLASS_ABILITIES) {
  let saCount = 0;
  for (const [cl, subs] of Object.entries(SUBCLASS_ABILITIES)) {
    for (const [sub, ab] of Object.entries(subs)) {
      saCount++;
      if (!ab.name) err(`SUBCLASS_ABILITIES "${cl}.${sub}" missing name`);
      if (typeof ab.cost !== 'number') err(`SUBCLASS_ABILITIES "${cl}.${sub}" missing cost`);
      if (ab.unlockLevel !== 12) err(`SUBCLASS_ABILITIES "${cl}.${sub}" unlockLevel should be 12`);
    }
  }
  if (saCount !== 27) err(`SUBCLASS_ABILITIES has ${saCount} entries (expected 27)`);
}

// Batch 6: CLASS_OOC_ABILITIES validation
if (typeof CLASS_OOC_ABILITIES !== 'undefined' && CLASS_OOC_ABILITIES) {
  const validStats = ['sight','speech','movement'];
  let oocCount = 0;
  for (const [cl, data] of Object.entries(CLASS_OOC_ABILITIES)) {
    if (!validStats.includes(data.stat))
      err(`CLASS_OOC_ABILITIES "${cl}" has invalid stat "${data.stat}"`);
    if (!data.abilities || data.abilities.length !== 2)
      err(`CLASS_OOC_ABILITIES "${cl}" should have exactly 2 abilities`);
    for (const ab of (data.abilities || [])) {
      oocCount++;
      if (!ab.id || !ab.name) err(`CLASS_OOC_ABILITIES "${cl}" ability missing id or name`);
    }
  }
  if (oocCount !== 18) err(`CLASS_OOC_ABILITIES has ${oocCount} entries (expected 18)`);
}

// Batch 5: TAVERN_NPCS validation
if (TAVERN_NPCS) {
  for (const [nid, npc] of Object.entries(TAVERN_NPCS)) {
    if (!npc.name) err(`TAVERN_NPCS "${nid}" has no name`);
    if (npc.shop && npc.shop.stock) {
      for (const s of npc.shop.stock) {
        if (!ITEMS[s.key]) err(`TAVERN_NPCS "${nid}" shop references unknown item "${s.key}"`);
      }
    }
    if (npc.services && !Array.isArray(npc.services))
      err(`TAVERN_NPCS "${nid}" services is not an array`);
  }
}

// Batch 5: CLASS_UNLOCK_TIERS validation
if (CLASS_UNLOCK_TIERS) {
  const ALL_CL = ['fighter','paladin','ranger','rogue','wizard','berserker','gunslinger','necromancer','warlock'];
  for (const [tier, data] of Object.entries(CLASS_UNLOCK_TIERS)) {
    if (!Array.isArray(data.classes)) err(`CLASS_UNLOCK_TIERS "${tier}" classes is not an array`);
    for (const cl of (data.classes || [])) {
      if (!ALL_CL.includes(cl)) err(`CLASS_UNLOCK_TIERS "${tier}" references unknown class "${cl}"`);
    }
    if (typeof data.reqUnlocked !== 'number') err(`CLASS_UNLOCK_TIERS "${tier}" missing reqUnlocked`);
  }
}

// Batch 5: MILESTONES validation
if (MILESTONES) {
  const validTrackKeys = ['totalKills','adventuresCompleted','totalBounties','totalBountyGold','deathCount','classesPlayed','uniqueEnemiesDefeated','itemsCrafted','totalGoldEarned','totalSpiritfire','regionsExplored','dungeonsCleared','capturedBounties','pediaCompletion'];
  for (const [mid, ms] of Object.entries(MILESTONES)) {
    if (!ms.name) err(`MILESTONES "${mid}" has no name`);
    if (!ms.tier || !['A','B'].includes(ms.tier)) err(`MILESTONES "${mid}" has invalid tier "${ms.tier}"`);
    if (typeof ms.target !== 'number') err(`MILESTONES "${mid}" has invalid target`);
    if (!ms.trackKey) err(`MILESTONES "${mid}" has no trackKey`);
  }
}

// Batch 5: TAVERN_STATES validation
if (TAVERN_STATES) {
  for (const [key, state] of Object.entries(TAVERN_STATES)) {
    if (typeof state.minNPCs !== 'number') err(`TAVERN_STATES "${key}" missing minNPCs`);
    if (!state.desc) err(`TAVERN_STATES "${key}" missing desc`);
  }
}

// Batch 5: REPUTATION_TIERS validation
if (REPUTATION_TIERS) {
  if (!Array.isArray(REPUTATION_TIERS)) err('REPUTATION_TIERS is not an array');
  for (const tier of (Array.isArray(REPUTATION_TIERS) ? REPUTATION_TIERS : [])) {
    if (!tier.key) err('REPUTATION_TIERS entry missing key');
    if (typeof tier.threshold !== 'number') err(`REPUTATION_TIERS "${tier.key}" missing threshold`);
  }
}

// Batch 7A: TOOLTIP_TEXT validation
if (typeof TOOLTIP_TEXT !== 'undefined' && TOOLTIP_TEXT) {
  const ttKeys = Object.keys(TOOLTIP_TEXT);
  if (ttKeys.length !== 17) err(`TOOLTIP_TEXT has ${ttKeys.length} entries (expected 17)`);
  for (const [k, v] of Object.entries(TOOLTIP_TEXT)) {
    if (typeof v !== 'string') err(`TOOLTIP_TEXT "${k}" is not a string`);
  }
} else {
  err('TOOLTIP_TEXT is missing');
}

// Batch 7A: CHRONICLE_QUOTES validation
if (typeof CHRONICLE_QUOTES !== 'undefined' && CHRONICLE_QUOTES) {
  if (!Array.isArray(CHRONICLE_QUOTES)) err('CHRONICLE_QUOTES is not an array');
  else if (CHRONICLE_QUOTES.length < 5) err(`CHRONICLE_QUOTES has ${CHRONICLE_QUOTES.length} entries (expected at least 5)`);
} else {
  err('CHRONICLE_QUOTES is missing');
}

// Batch 7B: The Betrayer enemy validation
if (!ENEMIES.the_betrayer) err('ENEMIES missing the_betrayer');
else {
  if (!ENEMIES.the_betrayer._isBetrayer) err('the_betrayer missing _isBetrayer flag');
  if (typeof ENEMIES.the_betrayer._phase2Threshold !== 'number') err('the_betrayer missing _phase2Threshold');
}

// Batch 7B: TUTORIAL_COMPANION validation
if (!TUTORIAL_COMPANION) err('TUTORIAL_COMPANION is missing');
else {
  if (!TUTORIAL_COMPANION.name) err('TUTORIAL_COMPANION missing name');
  if (!TUTORIAL_COMPANION.summonStats || !TUTORIAL_COMPANION.summonStats.hp) err('TUTORIAL_COMPANION missing summonStats');
}

// Batch 7B: OPENING_DIALOGUE validation
if (!OPENING_DIALOGUE) err('OPENING_DIALOGUE is missing');
else {
  const reqKeys = ['friend_intro','friend_combat_1','friend_combat_2','friend_post_combat','friend_turn','betrayal','hearthkeeper_merge'];
  for (const k of reqKeys) {
    if (!OPENING_DIALOGUE[k]) err(`OPENING_DIALOGUE missing key "${k}"`);
  }
}

// Batch 7B: Ashen Waste boss must be the_betrayer
if (REGION_DATA && REGION_DATA.ashen_waste) {
  if (REGION_DATA.ashen_waste.boss !== 'the_betrayer') err('REGION_DATA.ashen_waste.boss should be "the_betrayer", got "' + REGION_DATA.ashen_waste.boss + '"');
}

// Batch 8: LEGEND_MODE validation
if (!LEGEND_MODE) err('LEGEND_MODE is missing');
else {
  if (!LEGEND_MODE.scaling || typeof LEGEND_MODE.scaling.hp !== 'number' || typeof LEGEND_MODE.scaling.atk !== 'number')
    err('LEGEND_MODE missing scaling fields');
  if (!LEGEND_MODE.modifiers || !Array.isArray(LEGEND_MODE.modifiers) || LEGEND_MODE.modifiers.length !== 3)
    err('LEGEND_MODE should have exactly 3 modifiers');
  for (const mod of (LEGEND_MODE.modifiers || [])) {
    if (!mod.id || !mod.name || !mod.desc) err(`LEGEND_MODE modifier missing id/name/desc`);
  }
}

// Batch 8: Legend gear items validation
const legendGearKeys = ['legend_crown','legend_blade','legend_tome','legend_cloak'];
for (const lk of legendGearKeys) {
  if (!ITEMS[lk]) err(`Legend gear item "${lk}" missing from ITEMS`);
  else {
    if (ITEMS[lk].rarity !== 5) err(`Legend gear item "${lk}" should be rarity 5 (Unique), got ${ITEMS[lk].rarity}`);
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
  (DEATH_QUOTES ? DEATH_QUOTES.length : 0) + ' death quotes',
  (TAVERN_NPCS ? Object.keys(TAVERN_NPCS).length : 0) + ' tavern NPCs',
  (MILESTONES ? Object.keys(MILESTONES).length : 0) + ' milestones'
];

if (errors === 0) {
  console.log('All checks passed (' + counts.join(', ') + ')');
  if (warnings > 0) console.log(warnings + ' warning(s)');
} else {
  console.log(errors + ' error(s) found');
  if (warnings > 0) console.log(warnings + ' warning(s)');
  process.exit(1);
}
