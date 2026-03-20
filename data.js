/* =====================================================================
   Game Data — The Muddy Trail, The Iron Hollows & The Ashen Waste
   Enemies, items, NPCs, scenes, bounties, quests, death quotes
   ===================================================================== */

// === v1.0 STATUS EFFECTS (14 total) ===
const STATUS_EFFECTS={
// Damage-over-Time (3) — reworked mechanics
burn:{name:'Burn',type:'dot',desc:'Erodes DEF by 1 per tick.',icon:'🔥',
  tick(target,eff){if(target._defEroded===undefined)target._defEroded=0;target._defEroded++;target.def=Math.max(0,(target._baseDef||target.def)-target._defEroded);return{msg:`Burn erodes defense! (DEF now ${target.def})`,dmg:0}}},
bleed:{name:'Bleed',type:'dot',desc:'Tick damage increases +1 each time target is hit.',icon:'🩸',
  tick(target,eff){const d=eff.dmg||1;return{msg:`Bleed deals ${d} damage!`,dmg:d}}},
poison:{name:'Poison',type:'dot',desc:'Self-escalates +1 damage per turn.',icon:'☠️',
  tick(target,eff){const d=eff.dmg||1;eff.dmg=(eff.dmg||1)+1;return{msg:`Poison deals ${d} damage! (escalating)`,dmg:d}}},
// Accuracy/Perception (2)
stagger:{name:'Stagger',type:'accuracy',desc:'-10% hit chance for 2 turns.',icon:'💫',hitMod:-10},
blind:{name:'Blind',type:'accuracy',desc:'-30% hit chance for 1 turn.',icon:'🌑',hitMod:-30},
// Movement/Action Denial (4)
stun:{name:'Stun',type:'denial',desc:'Skip turn entirely.',icon:'⚡'},
slow:{name:'Slow',type:'denial',desc:"Can't change zones freely.",icon:'🐌'},
rooted:{name:'Rooted',type:'denial',desc:"Can't change zones at all for 2 turns.",icon:'🌿'},
silenced:{name:'Silenced',type:'denial',desc:"Can't use abilities or cast spells for 2 turns.",icon:'🤐'},
// Damage Modification (2)
weaken:{name:'Weaken',type:'dmg_mod',desc:'Target deals -1 damage.',icon:'⬇️',dmgMod:-1},
brittle:{name:'Brittle',type:'dmg_mod',desc:'Target takes +25% damage from all sources.',icon:'💎',dmgMult:1.25},
// Tactical Setup (2)
exposed:{name:'Exposed',type:'setup',desc:'Next hit = guaranteed crit (consumed on hit).',icon:'🎯',consumeOnHit:true},
marked:{name:'Marked',type:'setup',desc:'All attacks vs target get +15% hit.',icon:'❌',hitBonus:15},
// Healing Denial (1)
curse:{name:'Curse',type:'heal_deny',desc:"Can't heal or regenerate.",icon:'💀'}
};

// === v1.0 SYNERGIES (4 total) ===
const SYNERGIES={
searing_wound:{name:'Searing Wound',requires:['burn','bleed'],trigger:'automatic',
  desc:'Bleed hit-scaling +2/hit instead of +1 while both active.'},
festering:{name:'Festering',requires:['poison','curse'],trigger:'automatic',
  desc:'Poison escalation doubles (+2/turn instead of +1).'},
hemorrhage:{name:'Hemorrhage',requires:['bleed','slow'],trigger:'automatic',
  desc:'Bleed tick damage doubled.'},
shatter:{name:'Shatter',requires:['brittle','exposed'],trigger:'triggered',
  desc:'Guaranteed crit does triple damage (not double). Exposed consumed; Brittle remains.'}
};

// === v1.0 INTENT ICONS ===
const INTENT_ICONS={attack:'⚔️',defend:'🛡️',move:'🏃',cast:'✨',special:'💀'};

// === v1.0 ENEMY TIER COLORS ===
const ENEMY_TIERS={
1:{name:'Common',color:'#888'},
2:{name:'Uncommon',color:'#fff'},
3:{name:'Dangerous',color:'#fc3'},
4:{name:'Elite',color:'#f80'},
5:{name:'Boss',color:'#f33'}
};

// === v1.0 WEIGHT LABELS ===
const WEIGHT_LABELS=['Weightless','Very Light','Light','Medium','Heavy','Very Heavy','Crushing'];

// === v1.0 ITEM RARITY ===
const ITEM_RARITY={common:0,uncommon:1,rare:2,very_rare:3,legendary:4,unique:5};
const RARITY_COLORS=['#aaa','#5a9c6a','#4a8bc4','#9b59b6','#c9a84c','#c44054'];
const RARITY_NAMES=['Common','Uncommon','Rare','Very Rare','Legendary','Unique'];

const ENEMIES={
// === TIER 1 — COMMON (8 total) ===
gray_ooze:{name:'Gray Ooze',id:'gray_ooze',tier:1,lore:'A shimmering mass of corrosive slime that oozes along forest trails, drawn to warmth and movement. Slow but relentless.',hp:15,mHP:15,atk:5,def:0,dD:4,dB:1,xp:50,gold:8,preferredZone:'close',
  loot:[{item:'hpot',weight:50},{item:null,weight:50}]},
bog_wraith:{name:'Bog Wraith',id:'bog_wraith',tier:1,lore:'A half-material spectre born of drowned souls and marsh gas. It drifts through the mist, reaching with cold, grasping tendrils.',hp:14,mHP:14,atk:5,def:0,dD:4,dB:1,xp:60,gold:9,preferredZone:'mid',
  loot:[{item:'marsh_root',weight:35},{item:'mpot',weight:30},{item:null,weight:35}]},
moss_rat:{name:'Moss Rat',id:'moss_rat',tier:1,lore:'An oversized rodent covered in damp green moss. More nuisance than threat, but its teeth are sharp.',hp:10,mHP:10,atk:3,def:0,dD:4,dB:0,xp:30,gold:6,preferredZone:'close',
  loot:[{item:'marsh_root',weight:40},{item:null,weight:60}]},
marsh_toad:{name:'Marsh Toad',id:'marsh_toad',tier:1,lore:'A bloated amphibian the size of a dog. It spits caustic slime and retreats into the muck.',hp:12,mHP:12,atk:4,def:0,dD:4,dB:0,xp:35,gold:6,preferredZone:'mid',
  loot:[{item:'marsh_root',weight:50},{item:null,weight:50}]},
spore_mite:{name:'Spore Mite',id:'spore_mite',tier:1,lore:'A thumb-sized insect that travels in swarms. Individually harmless; in numbers, they fill the air with choking spores.',hp:10,mHP:10,atk:3,def:0,dD:4,dB:0,xp:30,gold:5,preferredZone:'mid',
  loot:[{item:null,weight:70},{item:'hpot',weight:30}]},
ember_beetle:{name:'Ember Beetle',id:'ember_beetle',tier:1,lore:'A fist-sized beetle with a carapace that glows like a dying coal. It skitters toward warmth and bites reflexively.',hp:11,mHP:11,atk:4,def:0,dD:4,dB:0,xp:35,gold:6,preferredZone:'close',
  loot:[{item:null,weight:60},{item:'hpot',weight:40}]},
ash_worm:{name:'Ash Worm',id:'ash_worm',tier:1,lore:'A pale, segmented worm that burrows through volcanic ash. It surfaces to feed on anything organic.',hp:13,mHP:13,atk:4,def:0,dD:4,dB:1,xp:40,gold:7,preferredZone:'close',
  loot:[{item:'ration',weight:40},{item:null,weight:60}]},
tunnel_bat:{name:'Tunnel Bat',id:'tunnel_bat',tier:1,lore:'A cave-dwelling bat with a wingspan wider than a man is tall. Its screech disorients, and its fangs draw blood.',hp:10,mHP:10,atk:4,def:0,dD:4,dB:0,xp:30,gold:6,preferredZone:'close',
  loot:[{item:null,weight:65},{item:'hpot',weight:35}]},

// === TIER 2 — UNCOMMON (12 total) ===
giant_spider:{name:'Giant Spider',id:'giant_spider',tier:2,lore:'A forest-dwelling predator that lurks in the canopy, spitting venom and descending on silk threads to ambush travelers below.',hp:18,mHP:18,atk:6,def:1,dD:6,dB:1,xp:75,gold:8,preferredZone:'mid',
  onHit:{effect:'poison',chance:40,duration:3,dmg:2},
  loot:[{item:'antidote',weight:40},{item:'hpot',weight:25},{item:null,weight:35}]},
dire_wolf:{name:'Dire Wolf',id:'dire_wolf',tier:2,lore:'A massive grey wolf, scarred and cunning. It circles its prey with unnerving patience before closing with terrifying speed.',hp:22,mHP:22,atk:7,def:1,dD:8,dB:1,xp:90,gold:12,preferredZone:'close',
  onHit:{effect:'bleed',chance:30,duration:3,dmg:1},
  loot:[{item:'wolf_pelt',weight:35},{item:'hpot',weight:20},{item:'mpot',weight:15},{item:null,weight:30}]},
venomfang_snake:{name:'Venomfang Snake',id:'venomfang_snake',tier:2,lore:'A black-scaled serpent with translucent fangs. Its venom works fast, shutting down muscles within minutes.',hp:16,mHP:16,atk:6,def:0,dD:6,dB:1,xp:70,gold:7,preferredZone:'close',
  onHit:{effect:'poison',chance:45,duration:3,dmg:2},
  loot:[{item:'antidote',weight:50},{item:null,weight:50}]},
shadow_hound:{name:'Shadow Hound',id:'shadow_hound',tier:2,lore:'A spectral canine that flickers between solid and immaterial. Its claws leave wounds that refuse to close.',hp:20,mHP:20,atk:6,def:1,dD:6,dB:1,xp:80,gold:9,preferredZone:'close',
  onHit:{effect:'bleed',chance:35,duration:3,dmg:1},
  loot:[{item:'bandage',weight:40},{item:'hpot',weight:25},{item:null,weight:35}]},
fungal_horror:{name:'Fungal Horror',id:'fungal_horror',tier:2,lore:'A shambling mass of rotting vegetation animated by parasitic fungi. It releases clouds of toxic spores.',hp:20,mHP:20,atk:5,def:1,dD:6,dB:0,xp:75,gold:7,preferredZone:'mid',
  onHit:{effect:'poison',chance:35,duration:2,dmg:2},
  loot:[{item:'antidote',weight:35},{item:'mushroom_brew',weight:30},{item:null,weight:35}]},
ironscale_lizard:{name:'Ironscale Lizard',id:'ironscale_lizard',tier:2,lore:'A thick-bodied lizard with metallic scales. Slow but armored, it charges with lowered head and snapping jaws.',hp:22,mHP:22,atk:6,def:2,dD:6,dB:1,xp:80,gold:9,preferredZone:'close',
  loot:[{item:'iron_shard',weight:20},{item:'hpot',weight:30},{item:null,weight:50}]},
ghoul:{name:'Ghoul',id:'ghoul',tier:2,lore:'A corpse that refused to stay buried. Its touch paralyzes, and its hunger is endless.',hp:18,mHP:18,atk:6,def:0,dD:6,dB:1,xp:75,gold:8,tags:['undead'],preferredZone:'close',
  onHit:{effect:'stun',chance:20,duration:1,dmg:0},
  loot:[{item:'smelling_salts',weight:35},{item:'hpot',weight:25},{item:null,weight:40}]},
bone_sentinel:{name:'Bone Sentinel',id:'bone_sentinel',tier:2,lore:'An animate skeleton in rusted armor. It stands guard long after its master turned to dust.',hp:20,mHP:20,atk:6,def:2,dD:6,dB:0,xp:80,gold:8,tags:['undead'],preferredZone:'close',
  loot:[{item:'iron_sword',weight:10},{item:'hpot',weight:30},{item:null,weight:60}]},
rock_troll:{name:'Rock Troll',id:'rock_troll',tier:2,lore:'A squat, stone-skinned brute that lurks under bridges and in shallow caves. Stupid but dangerously strong.',hp:24,mHP:24,atk:7,def:1,dD:8,dB:0,xp:90,gold:12,preferredZone:'close',
  loot:[{item:'troll_blood',weight:15},{item:'hpot',weight:30},{item:null,weight:55}]},
wyvern_hatchling:{name:'Wyvern Hatchling',id:'wyvern_hatchling',tier:2,lore:'A juvenile wyvern, too young to fly but old enough to kill. Its venomous tail whips with surprising reach.',hp:18,mHP:18,atk:6,def:1,dD:6,dB:1,xp:85,gold:10,preferredZone:'mid',
  onHit:{effect:'poison',chance:25,duration:2,dmg:1},
  loot:[{item:'hpot',weight:40},{item:null,weight:60}]},

// === TIER 3 — DANGEROUS (9 total) ===
cave_crawler:{name:'Cave Crawler',id:'cave_crawler',tier:3,lore:'A bloated, segmented horror that drags itself through the tunnels on dozens of pale legs. Its chitinous hide turns blades.',hp:25,mHP:25,atk:6,def:2,dD:6,dB:1,xp:80,gold:8,preferredZone:'close',
  onHit:{effect:'slow',chance:25,duration:2,dmg:0},
  loot:[{item:'dwarven_ale',weight:40},{item:'hpot',weight:25},{item:null,weight:35}]},
flame_elemental:{name:'Flame Elemental',id:'flame_elemental',tier:3,lore:'A pillar of living fire that drifts through volcanic fissures. Its touch ignites flesh and warps metal.',hp:22,mHP:22,atk:7,def:1,dD:8,dB:0,xp:100,gold:12,preferredZone:'mid',
  onHit:{effect:'burn',chance:40,duration:3,dmg:2},
  loot:[{item:'burn_salve',weight:35},{item:'ghpot',weight:20},{item:null,weight:45}]},
darkwood_treant:{name:'Darkwood Treant',id:'darkwood_treant',tier:3,lore:'An ancient tree twisted by dark magic into a shambling predator. Its roots entangle; its branches crush.',hp:28,mHP:28,atk:6,def:3,dD:6,dB:1,xp:95,gold:10,preferredZone:'close',
  onHit:{effect:'slow',chance:30,duration:2,dmg:0},
  loot:[{item:'marsh_root',weight:30},{item:'ghpot',weight:25},{item:null,weight:45}]},
banshee:{name:'Banshee',id:'banshee',tier:3,lore:'The wailing spirit of a woman betrayed. Her scream curdles the blood and clouds the mind.',hp:22,mHP:22,atk:7,def:1,dD:6,dB:1,xp:100,gold:12,tags:['undead'],preferredZone:'far',
  onHit:{effect:'curse',chance:35,duration:3,dmg:0},
  loot:[{item:'purification_scroll',weight:35},{item:'banshee_essence',weight:15},{item:null,weight:50}]},
chimera_spawn:{name:'Chimera Spawn',id:'chimera_spawn',tier:3,lore:'A malformed beast with the heads of a lion, goat, and serpent. Each head attacks independently.',hp:26,mHP:26,atk:7,def:2,dD:8,dB:0,xp:110,gold:14,preferredZone:'close',
  loot:[{item:'ghpot',weight:30},{item:'strength_tonic',weight:15},{item:null,weight:55}]},
corrupted_knight:{name:'Corrupted Knight',id:'corrupted_knight',tier:3,lore:'Once a champion of the realm, now a shell of rusted armor animated by spite. Its sword remembers its training.',hp:28,mHP:28,atk:8,def:2,dD:8,dB:1,xp:115,gold:15,tags:['undead'],preferredZone:'close',
  onHit:{effect:'bleed',chance:30,duration:3,dmg:1},
  loot:[{item:'steel_sword',weight:10},{item:'scale_mail',weight:8},{item:'ghpot',weight:25},{item:null,weight:57}]},
crystal_golem:{name:'Crystal Golem',id:'crystal_golem',tier:3,lore:'A construct of living quartz, refracting light into blinding patterns. Each blow sends razor shards in all directions.',hp:30,mHP:30,atk:6,def:3,dD:6,dB:1,xp:100,gold:12,preferredZone:'mid',
  onHit:{effect:'blind',chance:25,duration:2,dmg:0},
  loot:[{item:'iron_shard',weight:30},{item:'ghpot',weight:20},{item:null,weight:50}]},
plague_bearer:{name:'Plague Bearer',id:'plague_bearer',tier:3,lore:'A shambling corpse wreathed in flies and decay. Its mere proximity sickens; its touch brings fever and rot.',hp:24,mHP:24,atk:7,def:1,dD:6,dB:1,xp:105,gold:11,tags:['undead'],preferredZone:'close',
  onHit:{effect:'poison',chance:45,duration:3,dmg:2},
  loot:[{item:'antidote',weight:40},{item:'ghpot',weight:20},{item:null,weight:40}]},
wyvern:{name:'Wyvern',id:'wyvern',tier:3,lore:'A fully grown wyvern, scales hardened by years of territorial battles. It dives from above, striking with talons and venomous tail.',hp:26,mHP:26,atk:8,def:2,dD:8,dB:0,xp:120,gold:14,preferredZone:'mid',
  onHit:{effect:'poison',chance:30,duration:2,dmg:2},
  loot:[{item:'dragon_scale',weight:10},{item:'ghpot',weight:25},{item:null,weight:65}]},

// === TIER 4 — ELITE (7 total) ===
mine_shade:{name:'Mine Shade',id:'mine_shade',tier:4,lore:'A flickering silhouette that darts between pillars of stone. It strikes from impossible angles, its touch numbing mind and muscle.',hp:12,mHP:12,atk:8,def:0,dD:4,dB:1,xp:100,gold:10,preferredZone:'far',
  onHit:{effect:'stun',chance:20,duration:1,dmg:0},
  loot:[{item:'mpot',weight:35},{item:'antidote',weight:25},{item:null,weight:40}]},
death_knight:{name:'Death Knight',id:'death_knight',tier:4,lore:'A lord of the undead in blackened plate. Two curses attend its blade: decay and endless bleeding.',hp:28,mHP:28,atk:9,def:3,dD:8,dB:2,xp:150,gold:20,tags:['undead'],preferredZone:'close',
  onHit:{effect:'curse',chance:30,duration:3,dmg:0},
  loot:[{item:'enchanted_blade',weight:8},{item:'knights_plate',weight:5},{item:'ghpot',weight:30},{item:null,weight:57}]},
void_stalker:{name:'Void Stalker',id:'void_stalker',tier:4,lore:'A creature from between worlds. It flickers in and out of reality, striking from angles that shouldn\'t exist.',hp:22,mHP:22,atk:9,def:1,dD:8,dB:1,xp:140,gold:18,preferredZone:'far',
  onHit:{effect:'blind',chance:35,duration:2,dmg:0},
  loot:[{item:'eye_drops',weight:30},{item:'shadow_cloak',weight:8},{item:'ghpot',weight:25},{item:null,weight:37}]},
ash_wyrm:{name:'Ash Wyrm',id:'ash_wyrm',tier:4,lore:'A serpentine dragon that nests in volcanic vents. Its breath is superheated ash that chars flesh and blinds eyes.',hp:26,mHP:26,atk:9,def:2,dD:8,dB:1,xp:145,gold:18,preferredZone:'mid',
  onHit:{effect:'burn',chance:40,duration:3,dmg:2},
  loot:[{item:'dragon_scale',weight:20},{item:'burn_salve',weight:25},{item:'ghpot',weight:20},{item:null,weight:35}]},
lich_apprentice:{name:'Lich Apprentice',id:'lich_apprentice',tier:4,lore:'A mage who traded death for undeath. Its mastery of dark magic is incomplete but potent enough to end the unwary.',hp:20,mHP:20,atk:8,def:1,dD:6,dB:2,xp:140,gold:18,tags:['undead'],preferredZone:'far',
  onHit:{effect:'curse',chance:40,duration:3,dmg:0},
  loot:[{item:'purification_scroll',weight:30},{item:'lich_dust',weight:15},{item:'gmpot',weight:20},{item:null,weight:35}]},
storm_elemental:{name:'Storm Elemental',id:'storm_elemental',tier:4,lore:'A howling vortex of wind and lightning. It moves erratically, striking with bolts that leave muscles locked and twitching.',hp:24,mHP:24,atk:9,def:1,dD:8,dB:1,xp:145,gold:18,preferredZone:'mid',
  onHit:{effect:'stun',chance:25,duration:1,dmg:0},
  loot:[{item:'smelling_salts',weight:30},{item:'gmpot',weight:25},{item:null,weight:45}]},
troll_warlord:{name:'Troll Warlord',id:'troll_warlord',tier:4,lore:'A massive troll chieftain covered in war paint and old scars. Its crushing blows leave victims weakened and broken.',hp:28,mHP:28,atk:10,def:2,dD:10,dB:0,xp:155,gold:22,preferredZone:'close',
  onHit:{effect:'weaken',chance:30,duration:3,dmg:0},
  loot:[{item:'troll_blood',weight:25},{item:'war_hammer',weight:5},{item:'ghpot',weight:25},{item:null,weight:45}]},

// === TIER 5 — BOSS (5 total) ===
iron_golem:{name:'Iron Golem',id:'iron_golem',tier:5,lore:'A construct of living iron, forged in the old dwarven wars and left to guard the deep forge. It moves with grinding deliberation, each blow like a collapsing wall.',hp:35,mHP:35,atk:9,def:3,dD:10,dB:1,xp:150,gold:20,preferredZone:'close',
  loot:[{item:'iron_shard',weight:50},{item:'hpot',weight:25},{item:null,weight:25}]},
elder_dragon:{name:'Elder Dragon',id:'elder_dragon',tier:5,lore:'The oldest living dragon in the Ashen Waste. Its scales are volcanic glass, its breath a river of liquid fire. Kingdoms have fallen to feed its hunger.',hp:45,mHP:45,atk:11,def:3,dD:10,dB:2,xp:300,gold:50,preferredZone:'mid',
  onHit:{effect:'burn',chance:50,duration:3,dmg:3},
  loot:[{item:'dragon_scale',weight:60},{item:'flaming_sword',weight:10},{item:null,weight:30}]},
lich_king:{name:'Lich King',id:'lich_king',tier:5,lore:'The master of undeath, enthroned in a crypt of crystallized souls. His magic unravels the will to live.',hp:40,mHP:40,atk:10,def:2,dD:8,dB:3,xp:280,gold:45,tags:['undead'],preferredZone:'far',
  onHit:{effect:'curse',chance:45,duration:4,dmg:0},
  loot:[{item:'lich_dust',weight:50},{item:'grimoire',weight:10},{item:null,weight:40}]},
ancient_construct:{name:'Ancient Construct',id:'ancient_construct',tier:5,lore:'A war machine from a forgotten age. Powered by a gem that pulses with dying starlight. Every joint screams with neglected centuries.',hp:50,mHP:50,atk:10,def:4,dD:10,dB:1,xp:300,gold:50,preferredZone:'close',
  loot:[{item:'iron_shard',weight:40},{item:'knights_plate',weight:10},{item:null,weight:50}]},
demon_lord:{name:'Demon Lord',id:'demon_lord',tier:5,lore:'A being of pure malice given form. It wields fear as a weapon and pain as a tool. Where it walks, hope dies.',hp:42,mHP:42,atk:11,def:2,dD:10,dB:2,xp:320,gold:55,preferredZone:'mid',
  onHit:{effect:'weaken',chance:35,duration:3,dmg:0},
  loot:[{item:'demon_horn',weight:50},{item:'enchanted_blade',weight:10},{item:null,weight:40}]}
};

const ITEMS={
// === CONSUMABLES ===
hpot:{name:'Health Potion',t:'consumable',wt:0,rarity:0,heal:10,desc:'Restores 10 HP.',value:8},
mpot:{name:'Mana Potion',t:'consumable',wt:0,rarity:0,mana:10,desc:'Restores 10 MP.',value:8},
ghpot:{name:'Greater Health Potion',t:'consumable',wt:0,rarity:1,heal:20,desc:'Restores 20 HP.',value:18},
gmpot:{name:'Greater Mana Potion',t:'consumable',wt:0,rarity:1,mana:20,desc:'Restores 20 MP.',value:18},
elixir:{name:'Elixir',t:'consumable',wt:0,rarity:1,heal:10,mana:10,desc:'Restores 10 HP and 10 MP.',value:22},
antidote:{name:'Antidote',t:'consumable',wt:0,rarity:0,cure:'poison',desc:'Cures poison.',value:6},
bandage:{name:'Bandage',t:'consumable',wt:0,rarity:0,cure:'bleed',desc:'Stops bleeding.',value:6},
smelling_salts:{name:'Smelling Salts',t:'consumable',wt:0,rarity:0,cure:'stun',desc:'Clears stun.',value:6},
burn_salve:{name:'Burn Salve',t:'consumable',wt:0,rarity:0,cure:'burn',desc:'Soothes burns.',value:6},
purification_scroll:{name:'Purification Scroll',t:'consumable',wt:0,rarity:1,cure:'curse',desc:'Lifts curses.',value:10},
eye_drops:{name:'Eye Drops',t:'consumable',wt:0,rarity:0,cure:'blind',desc:'Restores sight.',value:6},
strength_tonic:{name:'Strength Tonic',t:'consumable',wt:0,rarity:1,heal:5,desc:'A bitter draught. Restores 5 HP.',value:8},
focus_draught:{name:'Focus Draught',t:'consumable',wt:0,rarity:1,mana:8,desc:'Sharpens the mind. Restores 8 MP.',value:8},
ration:{name:'Ration',t:'consumable',wt:0,rarity:0,heal:3,desc:'Dry bread and jerky. Restores 3 HP.',value:3},
mushroom_brew:{name:'Mushroom Brew',t:'consumable',wt:0,rarity:1,heal:8,desc:'A pungent fungal tea. Restores 8 HP.',value:6},
marsh_root:{name:'Marsh Root',t:'consumable',wt:0,rarity:0,heal:5,desc:'A bitter root. Restores 5 HP.',value:5},
dwarven_ale:{name:'Dwarven Ale',t:'consumable',wt:0,rarity:1,heal:3,cure:'bleed',desc:'Burns going down. Cures bleed, heals 3 HP.',value:10},

// === WEAPONS — MELEE ===
iron_sword:{name:'Iron Sword',t:'melee',wt:2,rarity:0,dD:6,dB:1,desc:'Melee, 1d6+1. Reliable.',value:20},
steel_sword:{name:'Steel Sword',t:'melee',wt:2,rarity:1,dD:8,dB:1,desc:'Melee, 1d8+1. Well-forged.',value:35},
enchanted_blade:{name:'Enchanted Blade',t:'melee',wt:2,rarity:2,dD:8,dB:3,desc:'Melee, 1d8+3. Glows faintly blue.',value:60},
war_hammer:{name:'War Hammer',t:'melee',wt:3,rarity:2,dD:10,dB:1,desc:'Melee, 1d10+1. Two-handed.',twoHand:true,value:40},
mace:{name:'Mace',t:'melee',wt:2,rarity:1,dD:6,dB:2,desc:'Melee, 1d6+2. Crushes armor.',value:25},
rapier:{name:'Rapier',t:'melee',wt:1,rarity:1,dD:6,dB:1,desc:'Melee, 1d6+1. Light and fast.',value:22},
broadsword:{name:'Broadsword',t:'melee',wt:2,rarity:1,dD:8,dB:0,desc:'Melee, 1d8. Versatile blade.',value:28},
flaming_sword:{name:'Flaming Sword',t:'melee',wt:2,rarity:3,dD:8,dB:2,desc:'Melee, 1d8+2. Wreathed in flame.',value:70},
halberd:{name:'Halberd',t:'melee',wt:3,rarity:2,dD:10,dB:0,desc:'Melee, 1d10. Two-handed reach.',twoHand:true,value:35},
bone_cleaver:{name:'Bone Cleaver',t:'melee',wt:3,rarity:2,dD:10,dB:2,desc:'Melee, 1d10+2. Two-handed. Grim.',twoHand:true,value:50},

// === WEAPONS — RANGED ===
longbow:{name:'Longbow',t:'ranged',wt:2,rarity:1,dD:8,dB:0,desc:'Ranged, 1d8. 12 arrows.',ammo:12,twoHand:true,value:30},
crossbow:{name:'Crossbow',t:'ranged',wt:2,rarity:2,dD:10,dB:0,desc:'Ranged, 1d10. 6 bolts.',ammo:6,twoHand:true,value:40},
throwing_knives:{name:'Throwing Knives',t:'ranged',wt:1,rarity:1,dD:4,dB:3,desc:'Ranged, 1d4+3. 12 knives.',ammo:12,value:25},
pistol:{name:'Pistol',t:'ranged',wt:1,rarity:1,dD:6,dB:1,desc:'Ranged, 1d6+1. 6 shots.',ammo:6,value:30},

// === ARMOR ===
padded_armor:{name:'Padded Armor',t:'armor',wt:0,rarity:0,dB:1,desc:'+1 defense (Weightless).',value:15},
leather_armor:{name:'Leather Armor',t:'armor',wt:2,rarity:0,dB:1,desc:'+1 defense (Light).',value:18},
scale_mail:{name:'Scale Mail',t:'armor',wt:2,rarity:1,dB:2,desc:'+2 defense (Light).',value:30},
iron_plate:{name:'Iron Plate',t:'armor',wt:4,rarity:2,dB:3,desc:'+3 defense (Heavy).',value:50},
knights_plate:{name:"Knight's Plate",t:'armor',wt:5,rarity:3,dB:4,desc:'+4 defense (Very Heavy).',value:80},
mage_vestments:{name:'Mage Vestments',t:'armor',wt:0,rarity:1,dB:0,desc:'+0 defense. Enhances magic.',value:20},
shadow_cloak:{name:'Shadow Cloak',t:'armor',wt:0,rarity:2,dB:1,desc:'+1 defense (Weightless). Whisper-quiet.',value:35},

// === OFFHAND ===
iron_shield:{name:'Iron Shield',t:'shield',wt:2,rarity:1,blk:3,desc:'+3 block (Light).',value:25},
tower_shield:{name:'Tower Shield',t:'shield',wt:3,rarity:2,blk:4,desc:'+4 block (Medium).',value:45},
wooden_shield:{name:'Wooden Shield',t:'shield',wt:2,rarity:0,blk:2,desc:'+2 block (Light).',value:15},
grimoire:{name:'Grimoire',t:'spellbook',wt:1,rarity:2,desc:'Dark tome. Required for spell abilities.',value:40},
crystal_orb:{name:'Crystal Orb',t:'spellbook',wt:1,rarity:2,desc:'Arcane focus. Required for spell abilities.',value:45},
tome_of_dead:{name:'Tome of the Dead',t:'spellbook',wt:1,rarity:2,desc:'Necromantic focus. Required for death magic.',value:35},
hex_totem:{name:'Hex Totem',t:'spellbook',wt:1,rarity:2,desc:'Warlock focus. Channels curse energy.',value:35},

// === CONSUMABLES — TACTICAL ===
smoke_bomb:{name:'Smoke Bomb',t:'consumable',wt:0,rarity:1,desc:'Guaranteed flee from any zone. Any class.',value:18,guaranteedFlee:true},
map_fragment:{name:'Map Fragment',t:'consumable',wt:0,rarity:1,desc:'Reveals all node types in the current region.',value:25,mapReveal:true},
capture_net:{name:'Capture Net',t:'consumable',wt:0,rarity:1,desc:'Use on an enemy at 20% HP or less to capture for bounty.',value:15,captureItem:true},

// === CONSUMABLES — STATUS-APPLYING ===
poison_vial:{name:'Poison Vial',t:'consumable',wt:0,rarity:0,desc:'Apply Poison to an enemy (2 turns).',value:8,applyStatus:'poison',statusDuration:2,statusDmg:1},
fire_flask:{name:'Fire Flask',t:'consumable',wt:0,rarity:0,desc:'Apply Burn to an enemy (2 turns).',value:8,applyStatus:'burn',statusDuration:2,statusDmg:2},
caltrops:{name:'Caltrops',t:'consumable',wt:0,rarity:0,desc:'Apply Slow to an enemy (2 turns).',value:6,applyStatus:'slow',statusDuration:2,statusDmg:0},
binding_rope:{name:'Binding Rope',t:'consumable',wt:0,rarity:0,desc:'Apply Rooted to an enemy (2 turns).',value:8,applyStatus:'rooted',statusDuration:2,statusDmg:0},
flashbang:{name:'Flashbang',t:'consumable',wt:0,rarity:1,desc:'Apply Blind to an enemy (2 turns).',value:14,applyStatus:'blind',statusDuration:2,statusDmg:0},
enfeebling_dust:{name:'Enfeebling Dust',t:'consumable',wt:0,rarity:1,desc:'Apply Weaken to an enemy (3 turns).',value:14,applyStatus:'weaken',statusDuration:3,statusDmg:0},
concussion_bomb:{name:'Concussion Bomb',t:'consumable',wt:0,rarity:1,desc:'Apply Stun to an enemy (1 turn).',value:16,applyStatus:'stun',statusDuration:1,statusDmg:0},
hex_scroll:{name:'Hex Scroll',t:'consumable',wt:0,rarity:2,desc:'Apply Curse to an enemy (3 turns).',value:22,applyStatus:'curse',statusDuration:3,statusDmg:0},
root_snare:{name:'Root Snare',t:'consumable',wt:0,rarity:2,desc:'Apply Rooted to an enemy (3 turns).',value:20,applyStatus:'rooted',statusDuration:3,statusDmg:0},
silencing_powder:{name:'Silencing Powder',t:'consumable',wt:0,rarity:2,desc:'Apply Silenced to an enemy (2 turns).',value:20,applyStatus:'silenced',statusDuration:2,statusDmg:0},

// === CONSUMABLES — COMBAT BUFFS ===
whetstone:{name:'Whetstone',t:'consumable',wt:0,rarity:0,desc:'Sharpen weapon: +3 damage for 2 turns.',value:6,combatBuff:{name:'Sharpened',dmgBonus:3,duration:2}},
battle_elixir:{name:'Battle Elixir',t:'consumable',wt:0,rarity:1,desc:'+2 damage for 3 turns.',value:14,combatBuff:{name:'Battle Fury',dmgBonus:2,duration:3}},
ironbark_tonic:{name:'Ironbark Tonic',t:'consumable',wt:0,rarity:1,desc:'+2 defense for 3 turns.',value:14,combatBuff:{name:'Ironbark',defBonus:2,duration:3}},
swiftfoot_draught:{name:'Swiftfoot Draught',t:'consumable',wt:0,rarity:1,desc:'+10% dodge for 3 turns.',value:14,combatBuff:{name:'Swiftfoot',dodgeBonus:10,duration:3}},
elixir_fortitude:{name:'Elixir of Fortitude',t:'consumable',wt:0,rarity:2,desc:'+3 defense, 20% status resist for 3 turns.',value:25,combatBuff:{name:'Fortitude',defBonus:3,statusResist:20,duration:3}},
potion_resistance:{name:'Potion of Resistance',t:'consumable',wt:0,rarity:2,desc:'Reduce incoming damage by 2 for 3 turns.',value:25,combatBuff:{name:'Resistance',incomingDmgReduction:2,duration:3}},

// === CONSUMABLES — UTILITY ===
scroll_dispel:{name:'Scroll of Dispel',t:'consumable',wt:0,rarity:2,desc:'Cure all status effects.',value:20,cureAll:true},

// === CONSUMABLES — EXPLORATION ===
lockpick_set:{name:'Lockpick Set',t:'consumable',wt:0,rarity:1,desc:'Aids in perception checks. +10% Sight.',value:12,exploreBonus:{stat:'sight',bonus:10}},
diplomats_wine:{name:"Diplomat's Wine",t:'consumable',wt:0,rarity:1,desc:'Aids in social encounters. +10% Speech.',value:12,exploreBonus:{stat:'speech',bonus:10}},
climbing_rope:{name:'Climbing Rope',t:'consumable',wt:0,rarity:1,desc:'Aids in physical challenges. +10% Movement.',value:12,exploreBonus:{stat:'movement',bonus:10}},

// === MISC/LOOT ===
wolf_pelt:{name:'Wolf Pelt',t:'misc',wt:1,rarity:0,desc:'A thick grey pelt. Proof of the kill.',value:15},
iron_shard:{name:'Iron Shard',t:'misc',wt:1,rarity:0,desc:'A jagged fragment of living iron. Warm to the touch.',value:20},
dragon_scale:{name:'Dragon Scale',t:'misc',wt:1,rarity:2,desc:'A scale of volcanic glass. Almost indestructible.',value:50},
lich_dust:{name:'Lich Dust',t:'misc',wt:0,rarity:2,desc:'Powdered bone from an undead mage. Radiates cold.',value:40},
demon_horn:{name:'Demon Horn',t:'misc',wt:1,rarity:3,desc:'A curved horn of obsidian black. Pulses with malice.',value:55},
troll_blood:{name:'Troll Blood',t:'misc',wt:0,rarity:1,desc:'Viscous green blood. Alchemists pay well for this.',value:30},
banshee_essence:{name:'Banshee Essence',t:'misc',wt:0,rarity:1,desc:'Bottled wailing. Useful in rituals.',value:35},
guide:{name:"Player's Guide",t:'key',wt:0,rarity:5,desc:'A weathered guide to combat, creatures, and the world.',undrop:true}
};

// === RECIPES (Crafting System) ===
const RECIPES={
// Upgraded consumables
greater_antidote:{name:'Greater Antidote',ingredients:['antidote','marsh_root'],output:'scroll_dispel',category:'consumable'},
fortified_potion:{name:'Fortified Potion',ingredients:['ghpot','troll_blood'],output:'elixir_fortitude',category:'consumable'},
enhanced_elixir:{name:'Enhanced Elixir',ingredients:['elixir','marsh_root'],output:'battle_elixir',category:'consumable'},
ironbark_brew:{name:'Ironbark Brew',ingredients:['mushroom_brew','iron_shard'],output:'ironbark_tonic',category:'consumable'},
swift_brew:{name:'Swift Brew',ingredients:['focus_draught','wolf_pelt'],output:'swiftfoot_draught',category:'consumable'},
resistance_draught:{name:'Resistance Draught',ingredients:['ghpot','iron_shard'],output:'potion_resistance',category:'consumable'},
// Status consumables
poison_concentrate:{name:'Poison Concentrate',ingredients:['antidote','marsh_root','troll_blood'],output:'hex_scroll',category:'status'},
flash_powder:{name:'Flash Powder',ingredients:['burn_salve','iron_shard'],output:'flashbang',category:'status'},
binding_craft:{name:'Binding Craft',ingredients:['bandage','wolf_pelt'],output:'root_snare',category:'status'},
silence_mix:{name:'Silence Mix',ingredients:['banshee_essence','marsh_root'],output:'silencing_powder',category:'status'},
// Equipment
tempered_blade:{name:'Tempered Blade',ingredients:['iron_sword','iron_shard','iron_shard'],output:'steel_sword',category:'equipment'},
reinforced_mail:{name:'Reinforced Mail',ingredients:['scale_mail','iron_shard','dragon_scale'],output:'iron_plate',category:'equipment'}
};

const NPCS={
// === ORIGINAL NPCs ===
aldric:{name:'Aldric',title:'The Gatekeeper',desc:'A weathered guardsman stands beside the trail gate, watching with tired but alert eyes.'},
mira:{name:'Mira',title:'The Healer',desc:'A woman in green robes tends herbs near the shrine. She looks up and smiles warmly.'},
garrett:{name:'Garrett',title:'The Peddler',desc:'A thin man in a patched cloak, his pack brimming with oddments. He eyes your backpack appraisingly.'},
torgun:{name:'Torgun',title:'The Lost Miner',desc:'A stocky dwarf sits against the wall, clutching a battered pickaxe. He looks up with hollow eyes.'},
brynn:{name:'Brynn',title:'The Innkeeper',desc:'A broad-shouldered woman polishes a mug behind the bar, her scarred hands betraying a life before innkeeping.'},

// === NEW NPCs (data-driven dialogue) ===
elara:{name:'Elara',title:'The Armorsmith',desc:'A tall woman with soot-streaked arms hammers at an anvil. Racks of weapons and armor gleam behind her.',
  shop:{stock:[{key:'iron_sword',price:25},{key:'steel_sword',price:40},{key:'mace',price:30},{key:'rapier',price:28},{key:'scale_mail',price:35},{key:'iron_plate',price:55},{key:'iron_shield',price:30}]},
  dialogue:{
    initial:{text:'"Fresh face at the forge. I\'m Elara. If you need steel or plate, you\'ve come to the right anvil. Browse my wares — I stand behind every piece."',options:[{text:'"Show me your wares."',next:'shop_node'},{text:'"Tell me about yourself."',next:'about'},{text:'"Not now."',next:null}]},
    returning:{text:'"Back again? I\'ve got new stock if you\'re looking."',options:[{text:'"Show me your wares."',next:'shop_node'},{text:'"Just passing through."',next:null}]},
    shop_node:{text:'"Take your time. Quality costs, but it\'ll save your life."',effect:'shop',options:[{text:'"Done browsing."',next:null}]},
    about:{text:'"Used to be a soldier. Took a lance through the shoulder at Blackmoor. Can\'t swing a sword like I used to, but I can forge one better than anyone alive."',options:[{text:'"I\'ll remember that."',next:null}]}}},
rook:{name:'Rook',title:'The Blacksmith',desc:'A burly man with a leather apron tends a roaring forge. Sparks fly as he shapes glowing metal.',
  shop:{stock:[{key:'broadsword',price:32},{key:'war_hammer',price:45},{key:'halberd',price:40},{key:'longbow',price:35},{key:'crossbow',price:45},{key:'throwing_knives',price:30}]},
  dialogue:{
    initial:{text:'"Name\'s Rook. I make things that kill things. Simple as that. Need something?"',options:[{text:'"Show me what you\'ve got."',next:'shop_node'},{text:'"Maybe later."',next:null}]},
    returning:{text:'"You again. Good — means you\'re still alive. My work holds up, eh?"',options:[{text:'"Let me see your stock."',next:'shop_node'},{text:'"Just saying hello."',next:null}]},
    shop_node:{text:'"Every weapon here has drawn blood. They\'re proven."',effect:'shop',options:[{text:'"That\'ll do."',next:null}]}}},
thorne:{name:'Thorne',title:'The Monster Hunter',desc:'A lean man in scarred leather sits sharpening a long knife. His eyes are old beyond his years.',
  dialogue:{
    initial:{text:'"You have the look of someone who fights things that shouldn\'t exist. I\'m Thorne. I\'ve been hunting monsters since before you were born. Want some advice?"',options:[{text:'"Tell me about the enemies here."',next:'tips'},{text:'"What\'s the worst thing you\'ve fought?"',next:'worst'},{text:'"No thanks."',next:null}]},
    returning:{text:'"Still breathing? Good. What do you need?"',options:[{text:'"Combat advice."',next:'tips'},{text:'"Nothing. Just checking in."',next:null}]},
    tips:{text:'"Watch for debuffs — poison, bleed, burn, curse, blind, stun. Carry cures. Block halves damage. And never fight something two tiers above you unless you have to."',options:[{text:'"Noted."',next:null}]},
    worst:{text:'"An Elder Dragon in the Ashen Waste. Took three of us. I\'m the only one who walked out, and I left an arm behind. Don\'t be a hero — be smart."',options:[{text:'"I\'ll be careful."',next:null}]}}},
old_sana:{name:'Old Sana',title:'The Fortune Teller',desc:'A hunched figure in shawls sits behind a table covered in bones and dried flowers. Milky eyes fix on you.',
  dialogue:{
    initial:{text:'"Ah, the universe sends me another soul to read. Sit. Let Old Sana see what the bones say about you."',options:[{text:'"Read my fortune."',next:'fortune'},{text:'"I don\'t believe in fortunes."',next:'skeptic'},{text:'"Not today."',next:null}]},
    returning:{text:'"The bones shift. Your fate is not yet written. Shall I read again?"',options:[{text:'"Read them."',next:'fortune'},{text:'"Another time."',next:null}]},
    fortune:{text:'"I see fire and stone in your future. A choice between mercy and power. The wasteland calls, but not all who answer return. Carry cures — you will need them."',options:[{text:'"...Thank you."',next:null}]},
    skeptic:{text:'"Belief is irrelevant, dear. The bones speak whether you listen or not. But I see stubbornness in you — that will serve you well where you\'re going."',options:[{text:'"Fair enough."',next:null}]}}},
captain_vane:{name:'Captain Vane',title:'Guard Captain',desc:'A stern woman in battered plate armor stands at the guard post, a map of the region pinned to the wall behind her.',
  dialogue:{
    initial:{text:'"You look capable. I\'m Captain Vane, head of the garrison. We\'re spread thin. If you\'re looking for work, the bounty board at the tavern has postings. But if you want the truly dangerous marks, come see me."',options:[{text:'"What dangerous marks?"',next:'marks'},{text:'"Tell me about the garrison."',next:'garrison'},{text:'"I\'ll keep that in mind."',next:null}]},
    returning:{text:'"Back for more? The board\'s always got something."',options:[{text:'"What\'s the situation?"',next:'marks'},{text:'"Just passing through."',next:null}]},
    marks:{text:'"Tier 4 and 5 creatures — Death Knights, Void Stalkers, worse. They come from beyond the mountains. The Ashen Waste breeds horrors. Only the strong survive out there."',options:[{text:'"I\'ll handle it."',next:null}]},
    garrison:{text:'"Twenty soldiers and this stone wall. That\'s all that stands between the settlements and what lurks in the dark. We do our best."',options:[{text:'"You do good work."',next:null}]}}},
whisper:{name:'Whisper',title:'The Informant',desc:'A hooded figure leans against the wall in the shadows. You almost didn\'t see them.',
  shop:{stock:[{key:'shadow_cloak',price:40},{key:'throwing_knives',price:32},{key:'antidote',price:8},{key:'smelling_salts',price:8},{key:'eye_drops',price:8},{key:'flashbang',price:18},{key:'silencing_powder',price:24}]},
  dialogue:{
    initial:{text:'"...You found me. That\'s already more than most can say. I\'m Whisper. I deal in things people don\'t want seen. Rare goods, useful information. Interested?"',options:[{text:'"Show me what you have."',next:'shop_node'},{text:'"What information?"',next:'info'},{text:'"I\'ll pass."',next:null}]},
    returning:{text:'"You know where to find me. What do you need?"',options:[{text:'"Your wares."',next:'shop_node'},{text:'"Any news?"',next:'info'},{text:'"Nothing."',next:null}]},
    shop_node:{text:'"Discreet purchases. No questions asked."',effect:'shop',options:[{text:'"Done."',next:null}]},
    info:{text:'"The Ashen Waste — there\'s a witch out there, Grizelda. She sells things you can\'t find anywhere else. And deeper in, a hermit who knows the old history. Both worth finding, if you survive the trip."',options:[{text:'"Good to know."',next:null}]}}},
brother_cedric:{name:'Brother Cedric',title:'Traveling Cleric',desc:'A man in simple brown robes sits by the road, a worn holy symbol around his neck. His pack is full of scrolls and vials.',
  shop:{stock:[{key:'purification_scroll',price:12},{key:'antidote',price:8},{key:'bandage',price:8},{key:'burn_salve',price:8},{key:'ghpot',price:20},{key:'elixir',price:25},{key:'scroll_dispel',price:24}]},
  dialogue:{
    initial:{text:'"Blessings, traveler. I am Brother Cedric, a wandering cleric of the old faith. I carry healing supplies and cures for those the road has wounded. May I be of service?"',options:[{text:'"Heal me, please."',next:'heal_node'},{text:'"Show me your supplies."',next:'shop_node'},{text:'"Tell me of your faith."',next:'faith'},{text:'"Not now, thank you."',next:null}]},
    returning:{text:'"The road brings you back. How may I serve?"',options:[{text:'"Heal me."',next:'heal_node'},{text:'"Your supplies."',next:'shop_node'},{text:'"Just resting."',next:null}]},
    heal_node:{text:'"By the light that endures, be made whole."',effect:'heal',options:[{text:'"Thank you, Brother."',next:null}]},
    shop_node:{text:'"Take what you need. I ask only fair coin to continue my work."',effect:'shop',options:[{text:'"That\'s all."',next:null}]},
    faith:{text:'"The old gods are quiet, but their light remains in the world — in healing, in mercy, in the courage to face darkness. I carry that light where I can."',options:[{text:'"A noble calling."',next:null}]}}},
grizelda:{name:'Grizelda',title:'The Swamp Witch',desc:'A hunched woman stirs a bubbling cauldron over a sickly green fire. The air smells of sulfur and strange herbs.',
  shop:{stock:[{key:'mushroom_brew',price:8},{key:'antidote',price:6},{key:'burn_salve',price:8},{key:'strength_tonic',price:10},{key:'focus_draught',price:10},{key:'elixir',price:22},{key:'poison_vial',price:10},{key:'fire_flask',price:10}]},
  dialogue:{
    initial:{text:'"Heh heh... a visitor. Don\'t get many out here. I\'m Grizelda. The locals call me witch — I prefer \'herbalist with unconventional methods.\' Want to buy something useful?"',options:[{text:'"What do you sell?"',next:'shop_node'},{text:'"Why do you live out here?"',next:'why'},{text:'"I\'ll be going."',next:null}]},
    returning:{text:'"Back for more of my brews? Smart. The waste eats the unprepared."',options:[{text:'"Show me your potions."',next:'shop_node'},{text:'"Any wisdom?"',next:'wisdom'},{text:'"Just visiting."',next:null}]},
    shop_node:{text:'"Everything here is hand-brewed. Side effects are... minimal."',effect:'shop',options:[{text:'"Done."',next:null}]},
    why:{text:'"The swamp provides. Rare fungi, toxic herbs, things that grow nowhere else. Besides, the monsters leave me alone — professional courtesy between things that scare people."',options:[{text:'"...Fair enough."',next:null}]},
    wisdom:{text:'"Burns are the worst out here. Carry salves. And if you meet the Elder Dragon... run. Or don\'t. I\'ll brew something nice for your memorial."',options:[{text:'"Encouraging."',next:null}]}}},
durak:{name:'Durak',title:'The Orc Veteran',desc:'A massive orc with grey-streaked tusks sits on a bench, sharpening a notched greataxe.',
  shop:{stock:[{key:'bone_cleaver',price:55},{key:'war_hammer',price:45},{key:'halberd',price:40},{key:'padded_armor',price:18},{key:'strength_tonic',price:10}]},
  dialogue:{
    initial:{text:'"You look at Durak like he is monster. Durak is veteran. Fought in three wars. Won two. The third... we don\'t talk about the third. You want weapons? Durak has weapons."',options:[{text:'"Show me your weapons."',next:'shop_node'},{text:'"Tell me about the wars."',next:'wars'},{text:'"I\'ll pass."',next:null}]},
    returning:{text:'"Durak remembers you. Still alive. Good. Need steel?"',options:[{text:'"Your weapons."',next:'shop_node'},{text:'"Any stories?"',next:'wars'},{text:'"Not today."',next:null}]},
    shop_node:{text:'"Durak\'s weapons are heavy. Heavy is good. Heavy means dead enemy."',effect:'shop',options:[{text:'"Thanks, Durak."',next:null}]},
    wars:{text:'"First war was against the undead. Second was trolls. Both we won with axe and fury. The third... against the dragons. Nobody wins against dragons. You just survive."',options:[{text:'"I\'ll remember that."',next:null}]}}},
finn:{name:'Finn',title:'Tavern Boy',desc:'A scrawny boy of perhaps twelve sweeps the tavern floor. He looks up with wide, curious eyes.',
  dialogue:{
    initial:{text:'"Are you an adventurer? A real one? I\'ve never met a real adventurer before! Miss Brynn says they come through sometimes but most of them don\'t come back. Are you going to come back?"',options:[{text:'"I plan to."',next:'plan'},{text:'"What can you tell me about this place?"',next:'about'},{text:'"Shouldn\'t you be sweeping?"',next:'sweep'}]},
    returning:{text:'"You came back! I knew it! Do you have any stories?"',options:[{text:'"Maybe later, Finn."',next:null},{text:'"What\'s new around here?"',next:'news'}]},
    plan:{text:'"That\'s what they all say. But you look tougher than the last one. He was a wizard — sneezed every time he cast a spell. Not very intimidating."',options:[{text:'"I\'ll do better than that."',next:null}]},
    about:{text:'"The tavern\'s been here forever. Miss Brynn runs it. Elara makes weapons in the market. Captain Vane keeps us safe. And there\'s a creepy person in the cellar — Whisper. Don\'t tell anyone I told you."',options:[{text:'"Your secret\'s safe."',next:null}]},
    sweep:{text:'"Oh! Right! Sorry!"',options:[{text:'"No worries."',next:null}]},
    news:{text:'"I heard Captain Vane talking about something big beyond the mountains. An \'Elder Dragon.\' She looked scared, and Captain Vane is NEVER scared."',options:[{text:'"Interesting."',next:null}]}}},
hermit:{name:'The Hermit',title:'Keeper of Old Lore',desc:'An ancient figure in tattered robes sits cross-legged in a cave, surrounded by crumbling books and carved stones.',
  dialogue:{
    initial:{text:'"A living soul, here in the waste. How unexpected. I am called the Hermit, though I had a name once. I keep the old stories. Would you hear them?"',options:[{text:'"Tell me the history."',next:'history'},{text:'"What happened to this land?"',next:'land'},{text:'"I should go."',next:null}]},
    returning:{text:'"You return. The stories are always here. What would you know?"',options:[{text:'"Tell me more."',next:'history'},{text:'"About the dragons."',next:'dragons'},{text:'"Nothing. Just visiting."',next:null}]},
    history:{text:'"This was green once, before the dragon wars. The Elder Dragon burned it to ash in a single night. The kingdoms fought back — they built the Constructs, the golems of iron and stone. But even those couldn\'t stop the fire. Now only ash remains."',options:[{text:'"Is the dragon still here?"',next:'dragons'}]},
    dragons:{text:'"The Elder Dragon sleeps in the Throne of Ashes, at the heart of the waste. It wakes when it hungers. And it always hungers. If you go there... bring fire resistance. And say your prayers."',options:[{text:'"Thank you, Hermit."',next:null}]},
    land:{text:'"Volcanic eruptions, dragon fire, and centuries of neglect. The Ashen Waste is what remains when civilization burns. But life persists — the witch, the creatures, even me. Stubborn things, we living."',options:[{text:'"There\'s hope, then."',next:null}]}}},
commander_ashveil:{name:'Commander Ashveil',title:'Garrison Commander',desc:'A grizzled soldier with a burn-scarred face stands at the gate, surveying the scorched landscape beyond.',
  dialogue:{
    initial:{text:'"You made it through the mountains. That alone earns my respect. I\'m Commander Ashveil, last commander of the Ashen Gate garrison. Beyond here lies the waste — volcanic, hostile, and crawling with things that burn."',options:[{text:'"What lies ahead?"',next:'ahead'},{text:'"Any supplies?"',next:'supplies'},{text:'"I\'m ready."',next:null}]},
    returning:{text:'"Still alive? Good. The waste hasn\'t claimed you yet."',options:[{text:'"What\'s the situation?"',next:'ahead'},{text:'"I need healing."',next:'heal_node'},{text:'"I\'m heading back out."',next:null}]},
    ahead:{text:'"The Scorched Road leads to Cinderhaven — what\'s left of it. Beyond that, the Blighted Marsh, the Old Keep, and deeper still, the Ashen Spire. At the end... the Throne of Ashes. The Elder Dragon. Don\'t go there unless you\'re prepared to die."',options:[{text:'"I\'ll be careful."',next:null}]},
    supplies:{text:'"I can offer rest and healing. Beyond that, you\'re on your own. The witch in the swamp — Grizelda — she might have what you need."',options:[{text:'"Thank you."',next:null}]},
    heal_node:{text:'"Rest here. You\'ll need your strength."',effect:'heal',options:[{text:'"Thank you, Commander."',next:null}]}}}
};

const SCENE_DATA={
// === THE MUDDY TRAIL (11 scenes) ===
trailhead:{name:'The Trailhead',subtitle:'Where the road ends and the wild begins',
  description:'The muddy trail stretches northward into a dense, fog-choked forest. The air is thick with wet earth and decay. A half-rotted sign reads: \u201cBeware \u2014 creatures ahead.\u201d',
  npcs:['aldric'],
  exits:{forward:{scene:'midway',label:'Midway on the Trail',discovered:true},tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
midway:{name:'Midway on the Trail',subtitle:'Where the trees close in',
  description:'The trail narrows between gnarled trees whose branches interlock overhead. Mud sucks at your boots with every step. To the east, murky water glints through the undergrowth.',
  npcs:[],
  exits:{forward:{scene:'ooze',label:'Stay on Trail',discovered:true},bog:{scene:'whispering_bog',label:'Search the Bog',discovered:true},back:{scene:'trailhead',label:'The Trailhead',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){if(!r.ss.pouch)UI.addN('Something glints in the mud \u2014 a leather pouch, half-buried and forgotten.','f')},combat:null},
  actions:[{id:'search',label:'Search Pouch',desc:'The leather pouch in the mud',condition(r){return!r.ss.pouch}}]},
ooze:{name:'Ambush!',subtitle:null,
  description:'The trail opens into a clearing. The mud bubbles unnaturally.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'gray_ooze'}},
post_ooze:{name:'After the Battle',subtitle:'The silence of victory',
  description:'The remains of the Gray Ooze spread across the trail in a steaming, acrid puddle. The forest is quiet.',
  npcs:[],
  exits:{forward:{scene:'spider_ambush',label:'Deeper Into the Woods',discovered:true},back:{scene:'midway',label:'Midway on the Trail',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){
    if(!r.ss.oozeSearch1)UI.addN('Something solid rests within the dissolving remains.','f');
    else if(!r.ss.oozeSearch2)UI.addN('The remains still glisten. Perhaps there is more to find.','f')},combat:null},
  actions:[
    {id:'search',label:'Search Remains',desc:'Something solid in the ooze',condition(r){return!r.ss.oozeSearch1}},
    {id:'search',label:'Search Again',desc:'Look more carefully',condition(r){return r.ss.oozeSearch1&&!r.ss.oozeSearch2}},
    {id:'camp_rest',label:'Rest Here',desc:'Catch your breath and recover',condition(r){return!r.ss.restPostOoze}}]},
spider_ambush:{name:'Webbed Clearing',subtitle:null,
  description:'Thick webs drape the trees like funeral shrouds. Something skitters in the canopy above.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'giant_spider'}},
post_spider:{name:'The Silken Graveyard',subtitle:'Where silk becomes shroud',
  description:'The spider\u2019s corpse twitches once, then stills. Shredded webs hang limp from the branches. Old bones, wrapped in silk, litter the clearing floor.',
  npcs:[],
  exits:{forward:{scene:'wolf_den',label:'The Dark Hollow',discovered:true},back:{scene:'post_ooze',label:'After the Battle',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){
    if(!r.ss.spiderSearch1)UI.addN('Something glints within the webbed remains.','f')},combat:null},
  actions:[{id:'search_spider',label:'Search Webs',desc:'Something caught in the silk',condition(r){return!r.ss.spiderSearch1}},
    {id:'camp_rest',label:'Rest Here',desc:'Catch your breath among the webs',condition(r){return!r.ss.restPostSpider}}]},
wolf_den:{name:'The Dark Hollow',subtitle:null,
  description:'The trail dips into a rocky hollow. Claw marks score the stone. A low growl rumbles from the shadows.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'dire_wolf'}},
whispering_bog:{name:'Whispering Bog',subtitle:null,
  description:'Murky water seeps between twisted roots. Mist hangs low. Something stirs beneath the surface \u2014 a pale shape rises from the depths.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'bog_wraith'}},
post_bog:{name:'The Bog, Calm',subtitle:'Where the mist retreats',
  description:'The wraith dissolves into tendrils of fog. The water stills. The marsh holds its secrets, but for now it is quiet.',
  npcs:[],
  exits:{back:{scene:'midway',label:'Back to the Trail',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){
    if(!r.ss.bogSearch1)UI.addN('Strange herbs float near where the wraith fell. Perhaps usable.', 'f')},combat:null},
  actions:[{id:'search_bog',label:'Gather Herbs',desc:'Floating herbs from the marsh',condition(r){return!r.ss.bogSearch1}}]},
post_wolf:{name:'The Hollow, After',subtitle:'Where silence settles like dust',
  description:'The wolf lies still. Blood darkens the stone. The forest holds its breath, as if acknowledging what you\u2019ve done.',
  npcs:[],
  exits:{forward:{scene:'trail_end',label:"Trail's End",discovered:true},back:{scene:'post_spider',label:'The Silken Graveyard',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){
    if(!r.ss.wolfSearch1)UI.addN('The wolf\u2019s den is littered with old supplies from less fortunate travelers.','f')},combat:null},
  actions:[{id:'search_wolf',label:'Search Den',desc:'Scattered supplies among the bones',condition(r){return!r.ss.wolfSearch1}}]},
trail_end:{name:"Trail's End",subtitle:'Where the forest breathes again',
  description:'The forest thins and the trail widens to a mossy clearing lit by dappled sunlight. A small stone shrine stands at the center, covered in climbing ivy.',
  npcs:['mira','garrett'],exits:{tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null},
  actions:[{id:'rest',label:'Rest Here',desc:'Your journey is complete',condition(r){return!!r.ss.mira}}]},

// === THE IRON HOLLOWS (9 scenes) ===
ih_entrance:{name:'The Iron Hollows',subtitle:'Where the mountain swallows the light',
  description:'A jagged rift opens in the mountainside. The air is cold and smells of rust and old stone. Torchlight flickers from somewhere deep within.',
  npcs:['torgun'],
  exits:{forward:{scene:'ih_tunnels',label:'The Winding Tunnels',discovered:true},tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
ih_tunnels:{name:'The Winding Tunnels',subtitle:'Where echoes replace shadows',
  description:'Narrow passages twist between pillars of raw iron ore. Pick marks scar every surface. The ceiling drips rust-colored water.',
  npcs:[],
  exits:{forward:{scene:'ih_fungal_grotto',label:'Deeper In',discovered:true},back:{scene:'ih_entrance',label:'The Iron Hollows',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){if(!r.ss.ihTunnelSearch)UI.addN('A broken crate lies wedged between the rocks. Something clinks inside.','f')},combat:null},
  actions:[{id:'search_ih_tunnels',label:'Search Crate',desc:'A broken crate between the rocks',condition(r){return!r.ss.ihTunnelSearch}}]},
ih_fungal_grotto:{name:'The Fungal Grotto',subtitle:null,
  description:'The tunnel opens into a damp cavern carpeted in luminous fungi. The air is thick with spores. A shambling mass of rot lurches toward you.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'fungal_horror'}},
ih_post_fungal:{name:'The Grotto, Cleared',subtitle:'Where the spores settle',
  description:'The fungal horror collapses into a heap of rotting vegetation. The luminous fungi pulse faintly, casting the cavern in an eerie glow.',
  npcs:[],
  exits:{forward:{scene:'ih_crawler_lair',label:'The Nest',discovered:true},back:{scene:'ih_tunnels',label:'The Winding Tunnels',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
ih_crawler_lair:{name:'The Nest',subtitle:null,
  description:'The tunnel opens into a cavern thick with a sour, organic stench. Pale shapes shift in the darkness.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'cave_crawler'}},
ih_post_crawler:{name:'The Shattered Nest',subtitle:'Where chitin crunches underfoot',
  description:'The crawler lies still, its many legs curled inward. Broken eggs and dried slime coat the walls.',
  npcs:[],
  exits:{forward:{scene:'ih_bone_hall',label:'The Bone Hall',discovered:true},back:{scene:'ih_post_fungal',label:'The Fungal Grotto',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){if(!r.ss.ihCrawlerSearch)UI.addN('Something metallic gleams in the creature\u2019s nest.','f')},combat:null},
  actions:[{id:'search_ih_crawler',label:'Search Nest',desc:'Something metallic in the debris',condition(r){return!r.ss.ihCrawlerSearch}},
    {id:'camp_rest',label:'Rest Here',desc:'Catch your breath in the shattered nest',condition(r){return!r.ss.restIhCrawler}}]},
ih_bone_hall:{name:'The Bone Hall',subtitle:null,
  description:'A corridor of ancient stone lined with alcoves of yellowed bones. A skeleton in rusted armor stands guard at the far end, its empty sockets flickering with pale light.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'bone_sentinel'}},
ih_post_bone:{name:'The Hall, Silent',subtitle:'Where old soldiers rest',
  description:'The bone sentinel crumbles into a pile of rusted iron and dust. The alcoves stand empty and still.',
  npcs:[],
  exits:{forward:{scene:'ih_shade_hall',label:'The Shade Hall',discovered:true},back:{scene:'ih_post_crawler',label:'The Shattered Nest',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
ih_shade_hall:{name:'The Shade Hall',subtitle:null,
  description:'A vast hall of carved stone pillars. The torchlight dims. Shadows move where no one stands.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'mine_shade'}},
ih_post_shade:{name:'The Hall, Emptied',subtitle:'Where silence returns to stone',
  description:'The shade dissolves into motes of dark light. The hall is vast and cold and terribly still.',
  npcs:[],
  exits:{forward:{scene:'ih_forge',label:'The Deep Forge',discovered:true},back:{scene:'ih_post_crawler',label:'The Shattered Nest',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){UI.addN('The air grows warmer as you approach the forge. A faint orange glow pulses ahead.','f')},combat:null}},
ih_forge:{name:'The Deep Forge',subtitle:null,
  description:'A colossal forge fills the cavern, its fires still burning after centuries. Standing before the anvil is a hulking figure of living iron.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'iron_golem'}},
ih_post_golem:{name:'The Forge Falls Silent',subtitle:'Where iron rests at last',
  description:'The golem crumbles into a heap of cooling iron. The forge\u2019s flames gutter and dim. For the first time in ages, the mountain is quiet.',
  npcs:[],
  exits:{forward:{scene:'ih_exit',label:'Toward Daylight',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){if(!r.ss.ihGolemSearch)UI.addN('Among the golem\u2019s remains, a battered flask rolls free.','f')},combat:null},
  actions:[{id:'search_ih_golem',label:'Search Remains',desc:'A flask among the rubble',condition(r){return!r.ss.ihGolemSearch}}]},
ih_exit:{name:'Daylight',subtitle:'Where the mountain lets you go',
  description:'A crack of light widens into a blinding exit. Wind rushes in, carrying the scent of pine and open sky. You made it through the Iron Hollows.',
  npcs:[],exits:{tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null},
  actions:[{id:'leave_hollows',label:'Leave the Hollows',desc:'Your journey is complete',condition(){return true}}]},

// === TAVERN SETTLEMENT (4 scenes) ===
tavern_hub:{name:'The Hearthstone Tavern',subtitle:'Where the weary find warmth',
  description:'A guttering fire in a ruined hall. Dust and silence. A flickering shape by the dying flame.',
  dynamic:true,npcs:[],
  exits:{trail:{scene:'trailhead',label:'The Muddy Trail',discovered:true},hollows:{scene:'ih_entrance',label:'The Iron Hollows',discovered:true,gated:'tvn_smith'},waste:{scene:'ash_gate',label:'The Ashen Gate',discovered:false,gated:'tvn_drifter'}},
  events:{onFirstVisit:null,onEnter:null,combat:null},
  actions:[{id:'bounty_board',label:'Check the Bounty Board',desc:'See available bounties and quests',condition(){return true}}]},
market_square:{name:'The Market Square',subtitle:'Where steel and coin change hands',_deprecated:true,
  description:'An open area between stone buildings, bustling with the clangor of the forge and the murmur of trade. Weapon racks and armor stands fill every available space.',
  npcs:['elara','rook','durak','brother_cedric'],
  exits:{tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
guard_post:{name:'The Guard Post',subtitle:'Where vigilance never sleeps',_deprecated:true,
  description:'A fortified stone building overlooking the road. Maps and bounty notices cover the walls. Soldiers patrol the perimeter in shifts.',
  npcs:['captain_vane','thorne'],
  exits:{tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
tavern_cellar:{name:'The Cellar',subtitle:'Where shadows have ears',_deprecated:true,
  description:'A damp, dimly-lit space beneath the tavern. Barrels of ale line the walls, but the far corner holds something else \u2014 a hooded figure, barely visible in the gloom.',
  npcs:['whisper','old_sana'],
  exits:{tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},

// === THE ASHEN WASTE (10 scenes) ===
ash_gate:{name:'The Ashen Gate',subtitle:'Where the mountains end and fire begins',
  description:'A stone fortress marks the edge of the known world. Beyond its gates, the sky turns orange and the ground is cracked black glass. The air smells of sulfur.',
  npcs:['commander_ashveil'],
  exits:{forward:{scene:'ash_road',label:'The Scorched Road',discovered:true},tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
ash_road:{name:'The Scorched Road',subtitle:'Where nothing grows',
  description:'A road of fused glass and volcanic rock stretches through a barren landscape. Heat shimmers distort the horizon. A thick-bodied lizard with metallic scales blocks the path, jaws snapping.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'ironscale_lizard'}},
ash_post_road:{name:'The Road Continues',subtitle:'Where ash drifts like snow',
  description:'The lizard\'s armored bulk lies still on the glass road. Ahead, the ruins of a village emerge from the haze.',
  npcs:[],
  exits:{forward:{scene:'ash_village',label:'Cinderhaven Ruins',discovered:true},side:{scene:'witch_hut',label:'A Path to the Swamp',discovered:true},back:{scene:'ash_gate',label:'The Ashen Gate',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null},
  actions:[{id:'camp_rest',label:'Rest Here',desc:'Take shelter in the lee of the rocks',condition(r){return!r.ss.restAshRoad}}]},
ash_village:{name:'Cinderhaven Ruins',subtitle:'Where a town once stood',
  description:'Blackened walls and collapsed roofs mark what was once a thriving village. A few hardy souls cling to existence among the ruins. A cauldron bubbles in a makeshift shelter.',
  npcs:['grizelda'],
  exits:{forward:{scene:'ash_swamp',label:'The Blighted Marsh',discovered:true},side:{scene:'hermit_cave',label:'A Cave in the Cliffs',discovered:true},back:{scene:'ash_post_road',label:'The Scorched Road',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
ash_swamp:{name:'The Blighted Marsh',subtitle:null,
  description:'Thick, foul-smelling mud churns with bubbles of volcanic gas. Twisted fungi tower overhead, releasing clouds of choking spores. Something massive moves beneath the surface.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'fungal_horror'}},
ash_post_swamp:{name:'Beyond the Marsh',subtitle:'Where the air clears',
  description:'The swamp thins into cracked, dry earth. The Old Keep\'s silhouette rises against the orange sky like a jagged tooth.',
  npcs:[],
  exits:{forward:{scene:'ash_ruins',label:'The Old Keep',discovered:true},back:{scene:'ash_village',label:'Cinderhaven Ruins',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
ash_ruins:{name:'The Old Keep',subtitle:null,
  description:'Crumbling stone walls surround a courtyard choked with ash. A suit of armor stands in the center, impossibly still. Then it turns its head.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'corrupted_knight'}},
ash_post_ruins:{name:'The Keep, Fallen',subtitle:'Where duty ends',
  description:'The corrupted knight crumbles into rust and spite. Beyond the keep, a spiral of dark stone rises into the orange sky \u2014 the Ashen Spire.',
  npcs:[],
  exits:{forward:{scene:'ash_tower',label:'The Ashen Spire',discovered:true},back:{scene:'ash_post_swamp',label:'Beyond the Marsh',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){if(!r.ss.ashRuinsSearch)UI.addN('The knight\'s armor holds something \u2014 a flask, still intact.','f')},combat:null},
  actions:[{id:'search_ash_ruins',label:'Search Remains',desc:'Something in the armor',condition(r){return!r.ss.ashRuinsSearch}}]},
ash_tower:{name:'The Ashen Spire',subtitle:null,
  description:'A tower of black obsidian spirals upward. Inside, the heat is unbearable. Something massive breathes in the chamber above \u2014 a rhythmic, furnace-like pulse.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'ash_wyrm'}},
ash_post_tower:{name:'The Spire, Silenced',subtitle:'Where fire dies',
  description:'The wyrm falls from the spire in a cascade of sparks and ash. Through the smoke, a doorway leads to a vast chamber \u2014 the Throne of Ashes.',
  npcs:[],
  exits:{forward:{scene:'ash_throne',label:'The Throne of Ashes',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
ash_throne:{name:'The Throne of Ashes',subtitle:null,
  description:'A cavern of volcanic glass, lit by rivers of molten rock. At its center, coiled upon a throne of fused bone, lies the Elder Dragon. Its eye opens. It has been waiting.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'elder_dragon'}},
ash_exit:{name:'Dawn Breaks',subtitle:'Where fire surrenders to light',
  description:'The Elder Dragon falls. The ground shakes. Through the smoke and ash, a crack of light appears \u2014 daylight, real daylight. The Ashen Waste will heal, slowly. You emerge, changed.',
  npcs:[],exits:{tavern:{scene:'tavern_hub',label:'The Hearthstone Tavern',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null},
  actions:[{id:'leave_waste',label:'Leave the Ashen Waste',desc:'Your journey is complete',condition(){return true}}]},

// === SIDE LOCATIONS ===
witch_hut:{name:"Grizelda's Hut",subtitle:'Where the swamp provides',
  description:'A crooked hut on stilts rises from the marsh, festooned with hanging herbs and animal skulls. Smoke curls from a chimney made of stacked skulls.',
  npcs:['grizelda'],
  exits:{back:{scene:'ash_post_road',label:'The Scorched Road',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
hermit_cave:{name:"The Hermit's Cave",subtitle:'Where memory endures',
  description:'A shallow cave in the volcanic cliffs, its walls covered in ancient writings and carved symbols. The air is cool and still \u2014 a sanctuary from the heat.',
  npcs:['hermit'],
  exits:{back:{scene:'ash_village',label:'Cinderhaven Ruins',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){if(!r.ss.hermitVisit){r.ss.hermitVisit=true;
    r.bp.push({...ITEMS.elixir});UI.addN('The Hermit offers you a gift \u2014 an Elixir, old but potent.','s');
    GS.saveA()}},combat:null}},

// === BOUNTY ARENA ===
bounty_arena:{name:'Bounty Hunt',subtitle:null,
  description:'You set out to fulfill your bounty.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:null}}
};

const BOUNTIES={
// === ORIGINAL BOUNTIES (7) ===
ooze_hunt:{name:'Ooze Hunt',enemy:'gray_ooze',tier:1,goldReward:10,xpReward:30,desc:'Clear the slimes from the trail.'},
bog_sweep:{name:'Bog Sweep',enemy:'bog_wraith',tier:1,goldReward:12,xpReward:35,desc:'Lay a restless spirit to rest.'},
spider_silk:{name:'Spider Silk',enemy:'giant_spider',tier:2,goldReward:18,xpReward:50,desc:'Harvest silk from the forest spiders.',capture:true},
wolf_cull:{name:'Wolf Cull',enemy:'dire_wolf',tier:2,goldReward:22,xpReward:60,desc:'The wolves grow bold. Thin the pack.',capture:true},
crawler_purge:{name:'Crawler Purge',enemy:'cave_crawler',tier:3,goldReward:28,xpReward:70,desc:'Clear the tunnels of crawling horrors.',capture:true},
shade_hunt:{name:'Shade Hunt',enemy:'mine_shade',tier:4,goldReward:35,xpReward:90,desc:'Banish the flickering shadow from the deep halls.',capture:true},
iron_challenge:{name:'Iron Challenge',enemy:'iron_golem',tier:5,goldReward:50,xpReward:120,desc:'Test your mettle against a construct of living iron.',capture:true},

// === NEW BOUNTIES (18) ===
rat_extermination:{name:'Rat Extermination',enemy:'moss_rat',tier:1,goldReward:8,xpReward:20,desc:'The moss rats are overrunning the trail. Thin them out.'},
toad_hunt:{name:'Toad Hunt',enemy:'marsh_toad',tier:1,goldReward:9,xpReward:22,desc:'The marsh toads are blocking the bog path.'},
beetle_crush:{name:'Beetle Crush',enemy:'ember_beetle',tier:1,goldReward:9,xpReward:25,desc:'Ember beetles are burning the trailside brush.'},
bat_clearance:{name:'Bat Clearance',enemy:'tunnel_bat',tier:1,goldReward:8,xpReward:20,desc:'Clear the bats from the upper tunnels.'},
snake_hunt:{name:'Snake Hunt',enemy:'venomfang_snake',tier:2,goldReward:18,xpReward:50,desc:'A venomfang has been spotted near the trail.',capture:true},
hound_hunt:{name:'Hound Hunt',enemy:'shadow_hound',tier:2,goldReward:20,xpReward:55,desc:'Shadow hounds prowl the forest at night.',capture:true},
fungal_purge:{name:'Fungal Purge',enemy:'fungal_horror',tier:2,goldReward:18,xpReward:50,desc:'Fungal horrors spread sickness. Destroy them.',capture:true},
lizard_hunt:{name:'Lizard Hunt',enemy:'ironscale_lizard',tier:2,goldReward:20,xpReward:55,desc:'An ironscale lizard guards the lower caves.',capture:true},
ghoul_hunt:{name:'Ghoul Hunt',enemy:'ghoul',tier:2,goldReward:20,xpReward:55,desc:'Ghouls have risen in the old cemetery.',capture:true},
troll_bounty:{name:'Troll Bounty',enemy:'rock_troll',tier:2,goldReward:24,xpReward:60,desc:'A rock troll has claimed the bridge.',capture:true},
flame_hunt:{name:'Flame Hunt',enemy:'flame_elemental',tier:3,goldReward:30,xpReward:75,desc:'A flame elemental roams the volcanic vents.',capture:true},
banshee_hunt:{name:'Banshee Hunt',enemy:'banshee',tier:3,goldReward:30,xpReward:75,desc:'A banshee wails in the ruins. Silence her.',capture:true},
knight_hunt:{name:'Fallen Knight',enemy:'corrupted_knight',tier:3,goldReward:32,xpReward:80,desc:'A corrupted knight haunts the old keep.',capture:true},
wyvern_hunt:{name:'Wyvern Hunt',enemy:'wyvern',tier:3,goldReward:35,xpReward:85,desc:'A wyvern nests in the upper cliffs.',capture:true},
death_knight_bounty:{name:'Death Knight Bounty',enemy:'death_knight',tier:4,goldReward:42,xpReward:100,desc:'A death knight has been sighted. Destroy it.',capture:true},
void_hunt:{name:'Void Hunt',enemy:'void_stalker',tier:4,goldReward:40,xpReward:95,desc:'A void stalker flickers between realities.',capture:true},
wyrm_hunt:{name:'Wyrm Hunt',enemy:'ash_wyrm',tier:4,goldReward:42,xpReward:100,desc:'An ash wyrm terrorizes the scorched road.',capture:true},
dragon_hunt:{name:'Dragon Hunt',enemy:'elder_dragon',tier:5,goldReward:80,xpReward:200,desc:'The Elder Dragon itself. Are you ready?',capture:true}
};

const QUESTS={
// === ORIGINAL QUESTS (7) ===
first_blood:{name:'First Blood',desc:'Complete any bounty.',trigger:'bounty_complete',count:1,reward:{gold:20,xp:50},oneTime:true},
wolf_slayer:{name:'Wolf Slayer',desc:'Defeat 3 Dire Wolves via bounties.',trigger:'defeat_dire_wolf',count:3,reward:{gold:50,xp:100},oneTime:true},
exterminator:{name:'Exterminator',desc:'Complete 5 bounties of any kind.',trigger:'bounty_complete',count:5,reward:{gold:40,xp:80},oneTime:true},
veteran_hunter:{name:'Veteran Hunter',desc:'Complete 10 bounties total.',trigger:'bounty_complete',count:10,reward:{gold:80,xp:150},oneTime:true},
spider_bane:{name:'Spider Bane',desc:'Defeat 3 Giant Spiders via bounties.',trigger:'defeat_giant_spider',count:3,reward:{gold:45,xp:90},oneTime:true},
shade_walker:{name:'Shade Walker',desc:'Defeat 2 Mine Shades via bounties.',trigger:'defeat_mine_shade',count:2,reward:{gold:60,xp:120},oneTime:true},
ironbreaker:{name:'Ironbreaker',desc:'Defeat the Iron Golem in a bounty.',trigger:'defeat_iron_golem',count:1,reward:{gold:100,xp:200},oneTime:true},

// === NEW QUESTS (10) ===
pest_control:{name:'Pest Control',desc:'Complete 3 tier-1 bounties.',trigger:'bounty_complete',count:3,reward:{gold:30,xp:60},oneTime:true},
monster_slayer:{name:'Monster Slayer',desc:'Complete 15 bounties total.',trigger:'bounty_complete',count:15,reward:{gold:120,xp:250},oneTime:true},
elite_hunter:{name:'Elite Hunter',desc:'Complete 3 tier-4+ bounties.',trigger:'bounty_complete',count:20,reward:{gold:150,xp:300},oneTime:true},
troll_slayer:{name:'Troll Slayer',desc:'Defeat 2 Rock Trolls via bounties.',trigger:'defeat_rock_troll',count:2,reward:{gold:50,xp:100},oneTime:true},
banshee_silencer:{name:'Banshee Silencer',desc:'Defeat 2 Banshees via bounties.',trigger:'defeat_banshee',count:2,reward:{gold:60,xp:120},oneTime:true},
knight_slayer:{name:'Knight Slayer',desc:'Defeat 2 Corrupted Knights via bounties.',trigger:'defeat_corrupted_knight',count:2,reward:{gold:65,xp:130},oneTime:true},
wyrm_slayer:{name:'Wyrm Slayer',desc:'Defeat 2 Ash Wyrms via bounties.',trigger:'defeat_ash_wyrm',count:2,reward:{gold:80,xp:160},oneTime:true},
dragon_slayer:{name:'Dragon Slayer',desc:'Defeat the Elder Dragon in a bounty.',trigger:'defeat_elder_dragon',count:1,reward:{gold:200,xp:400},oneTime:true},
wasteland_explorer:{name:'Wasteland Explorer',desc:'Complete 25 bounties total.',trigger:'bounty_complete',count:25,reward:{gold:200,xp:500},oneTime:true},
legend:{name:'Legend',desc:'Complete 50 bounties total.',trigger:'bounty_complete',count:50,reward:{gold:500,xp:1000},oneTime:true}
};

const DEATH_QUOTES=[
// === ORIGINAL (12) ===
'"Not every path leads home."',
'"The trail remembers those who fall."',
'"Even the bravest meet their end in the mud."',
'"The forest takes what it is owed."',
'"Rest now. The trail goes on without you."',
'"The spider wraps another meal in silk."',
'"The wolves will feast tonight."',
'"Venom and fangs \u2014 the forest\u2019s welcome."',
'"The bog takes back what it gave."',
'"The mountain claims another."',
'"Darkness is patient. You were not."',
'"Iron endures. You did not."',
// === NEW (12) ===
'"The ash remembers no names."',
'"Fire consumes all things, given time."',
'"Even dragons were mortal once. You never stopped being one."',
'"The wasteland takes its toll in flesh and bone."',
'"Curse and flame \u2014 the Ashen Waste\u2019s welcome."',
'"The dead do not rest here. Neither will you."',
'"The Hermit will add your story to the walls."',
'"Grizelda warned you. You didn\u2019t listen."',
'"Commander Ashveil will light a candle. It won\u2019t last."',
'"The Elder Dragon sleeps again. Fed."',
'"You fought well. It wasn\u2019t enough."',
'"The darkness between worlds swallowed you whole."'
];

// === ADVENTURE MAP DATA (System 4) ===

// Region definitions with 3-layer encounter pools per adventure
const REGION_DATA={
muddy_trail:{
  regions:[
    {id:'mt_forest',name:'The Forest Edge',rows:4,nodesPerRow:[2,3],
      corePool:['gray_ooze','moss_rat','giant_spider','dire_wolf'],
      elitePool:['fungal_horror','rock_troll'],
      rarePool:['darkwood_treant','cave_crawler'],
      threatCategories:['status','beast','glass_cannon'],
      shopNPCs:['garrett'],loreTheme:'forest'},
    {id:'mt_deep',name:'The Deep Woods',rows:5,nodesPerRow:[2,3],
      corePool:['bog_wraith','venomfang_snake','shadow_hound','dire_wolf'],
      elitePool:['banshee','chimera_spawn'],
      rarePool:['banshee','chimera_spawn'],
      threatCategories:['undead','status','beast'],
      shopNPCs:['garrett'],loreTheme:'swamp'}
  ],
  roamingPool:['fungal_horror','wyvern_hatchling','rock_troll'],
  boss:'dire_wolf',transitionEnemy:'giant_spider'
},
iron_hollows:{
  regions:[
    {id:'ih_mines',name:'The Mine Entrance',rows:4,nodesPerRow:[2,3],
      corePool:['tunnel_bat','moss_rat','cave_crawler','ironscale_lizard'],
      elitePool:['bone_sentinel','ghoul'],
      rarePool:['mine_shade'],
      threatCategories:['beast','tank','zone_ctrl'],
      shopNPCs:['garrett'],loreTheme:'mine'},
    {id:'ih_tunnels',name:'The Deep Tunnels',rows:5,nodesPerRow:[2,3],
      corePool:['bone_sentinel','ghoul','crystal_golem','fungal_horror'],
      elitePool:['death_knight','lich_apprentice'],
      rarePool:['death_knight','lich_apprentice'],
      threatCategories:['undead','tank','status'],
      shopNPCs:['garrett'],loreTheme:'undead'},
    {id:'ih_forge',name:'The Forge',rows:5,nodesPerRow:[2,3],
      corePool:['flame_elemental','corrupted_knight','plague_bearer','crystal_golem'],
      elitePool:['ash_wyrm','death_knight'],
      rarePool:['ash_wyrm'],
      threatCategories:['status','tank','glass_cannon'],
      shopNPCs:['garrett'],loreTheme:'forge'}
  ],
  roamingPool:['chimera_spawn','darkwood_treant'],
  boss:'iron_golem',transitionEnemy:'bone_sentinel'
},
ashen_waste:{
  regions:[
    {id:'aw_road',name:'The Scorched Road',rows:4,nodesPerRow:[2,3],
      corePool:['ember_beetle','ash_worm','spore_mite','flame_elemental','wyvern_hatchling'],
      elitePool:['ash_wyrm','chimera_spawn'],
      rarePool:['ash_wyrm','void_stalker'],
      threatCategories:['status','swarm','glass_cannon'],
      shopNPCs:['garrett'],loreTheme:'wasteland'},
    {id:'aw_marsh',name:'The Blighted Marsh',rows:5,nodesPerRow:[2,3],
      corePool:['marsh_toad','plague_bearer','banshee','wyvern_hatchling'],
      elitePool:['death_knight','lich_apprentice'],
      rarePool:['death_knight','lich_apprentice'],
      threatCategories:['undead','status','beast'],
      shopNPCs:['garrett'],loreTheme:'blight'},
    {id:'aw_spire',name:'The Spire',rows:5,nodesPerRow:[2,3],
      corePool:['corrupted_knight','crystal_golem','chimera_spawn','wyvern'],
      elitePool:['troll_warlord','storm_elemental'],
      rarePool:['troll_warlord','storm_elemental'],
      threatCategories:['tank','status','glass_cannon'],
      shopNPCs:['garrett'],loreTheme:'spire'}
  ],
  roamingPool:['storm_elemental','void_stalker','troll_warlord'],
  boss:'elder_dragon',transitionEnemy:'corrupted_knight'
}
};

// Exploration event templates (6 categories)
const EXPLORATION_EVENTS={
// === PERCEPTION (Sight-gated) ===
hidden_cache:{cat:'perception',stat:'sight',dc:5,
  desc:'You notice something glinting behind a loose stone in the wall.',
  passText:'Your sharp eyes spot a hidden cache! Inside you find supplies.',
  failText:'You poke around but find nothing of interest. The shadows play tricks.',
  reward:{type:'loot',pool:['hpot','mpot','ghpot']},failPenalty:null},
trap_detection:{cat:'perception',stat:'sight',dc:7,
  desc:'The ground ahead looks disturbed. Something feels wrong.',
  passText:'You spot the tripwire just in time! You carefully disarm the trap and salvage its mechanism.',
  failText:'SNAP! A hidden trap springs, lashing at your legs.',
  reward:{type:'gold',amount:15},failPenalty:{type:'damage',amount:5}},
secret_path:{cat:'perception',stat:'sight',dc:8,
  desc:'The rock face here looks different from the rest. Almost too regular.',
  passText:'You find a concealed passage! It leads to a hidden alcove with treasure.',
  failText:'You push at the rocks but find nothing. Perhaps your eyes deceived you.',
  reward:{type:'loot',pool:['ghpot','gmpot','elixir','iron_shard']},failPenalty:null},
environmental_clue:{cat:'perception',stat:'sight',dc:4,
  desc:'Faded markings are scratched into the stone here.',
  passText:'You decipher the markings — warnings about what lies ahead. Knowledge is power.',
  failText:'The markings are too worn to read. You move on.',
  reward:{type:'xp',amount:20},failPenalty:null},

// === SOCIAL (Speech-gated) ===
wounded_traveler:{cat:'social',stat:'speech',dc:5,
  desc:'A wounded traveler slumps against a tree, clutching a bloodied satchel. They look up at you with desperate eyes.',
  passText:'"Thank you, friend. Take this — I won\'t make it much further. You\'ll need it more than me."',
  failText:'The traveler flinches away. "Stay back! I don\'t trust anyone on these roads."',
  reward:{type:'loot',pool:['ghpot','elixir','strength_tonic']},failPenalty:null},
merchant_caravan:{cat:'social',stat:'speech',dc:6,
  desc:'A nervous merchant guards a small cart. Their goods look valuable, but they seem eager to leave.',
  passText:'"You seem trustworthy. Here — take this at a fair price. And a word of advice: avoid the eastern path."',
  failText:'"No deals! No bargains! Leave me be!" The merchant hurries away.',
  reward:{type:'gold',amount:20},failPenalty:null},
enemy_scout:{cat:'social',stat:'speech',dc:7,
  desc:'A small creature watches you from a ledge. It seems intelligent — more curious than hostile.',
  passText:'With careful gestures you communicate peaceful intent. The creature points to a safer route ahead.',
  failText:'Your approach startles the creature. It shrieks and bolts, alerting everything nearby.',
  reward:{type:'xp',amount:25},failPenalty:{type:'damage',amount:3}},
hermit_with_knowledge:{cat:'social',stat:'speech',dc:5,
  desc:'An old hermit sits by a dying fire. They look like they haven\'t spoken to anyone in years.',
  passText:'"Sit, sit. I know things about these lands. The creatures here... I\'ve studied them all my life."',
  failText:'"Go away. I want no company." The hermit turns their back.',
  reward:{type:'xp',amount:20},failPenalty:null},

// === PHYSICAL (Movement-gated) ===
collapsed_bridge:{cat:'physical',stat:'movement',dc:6,
  desc:'A rotting bridge spans a deep chasm. Half the planks are missing. It groans in the wind.',
  passText:'With nimble footwork, you dance across the remaining planks! On the other side, you find an abandoned pack.',
  failText:'You slip halfway across and barely catch yourself. A bruising scramble gets you to the other side.',
  reward:{type:'loot',pool:['hpot','mpot','gold_small']},failPenalty:{type:'damage',amount:4}},
climbing_opportunity:{cat:'physical',stat:'movement',dc:7,
  desc:'A sheer cliff face rises above you. Handholds are sparse but present. Something glitters at the top.',
  passText:'You scale the cliff with practiced ease! At the top, a small treasure cache awaits.',
  failText:'The rock crumbles under your grip. You slide back down, scraping your arms.',
  reward:{type:'loot',pool:['ghpot','iron_shard','dragon_scale']},failPenalty:{type:'damage',amount:5}},
quicksand_hazard:{cat:'physical',stat:'movement',dc:5,
  desc:'The ground turns soft and treacherous. One wrong step and you could sink.',
  passText:'You read the terrain perfectly, hopping from firm ground to firm ground.',
  failText:'Your boot sinks deep. You wrench free but lose something in the muck.',
  reward:{type:'xp',amount:15},failPenalty:{type:'damage',amount:3}},
chase_sequence:{cat:'physical',stat:'movement',dc:8,
  desc:'A small creature darts past, something shiny clamped in its jaws. It stole from you!',
  passText:'You sprint after it and corner it against a dead end. It drops its prize and flees.',
  failText:'The creature is too fast. It vanishes into a burrow with your belongings.',
  reward:{type:'loot',pool:['ghpot','gmpot','elixir']},failPenalty:{type:'damage',amount:2}},

// === RISK/REWARD (no stat gate — pure choice) ===
mysterious_shrine:{cat:'risk_reward',
  desc:'A strange shrine hums with energy. Runes pulse on its surface. Something watches from within.',
  choices:[
    {text:'Touch the shrine',outcomes:[
      {chance:50,text:'Power surges through you! The shrine heals your wounds.',reward:{type:'heal',amount:'full'}},
      {chance:50,text:'Dark energy burns through you!',penalty:{type:'damage',amount:8}}]},
    {text:'Leave it alone',outcomes:[
      {chance:100,text:'You wisely move on. Some mysteries are best left alone.',reward:null}]}
  ]},
cursed_chest:{cat:'risk_reward',
  desc:'An ornate chest sits in an alcove, its lock already broken. A faint purple mist seeps from the lid.',
  choices:[
    {text:'Open the chest',outcomes:[
      {chance:65,text:'Inside lies a valuable item! The curse fades harmlessly.',reward:{type:'loot',pool:['enchanted_blade','scale_mail','ghpot','gmpot']}},
      {chance:35,text:'A curse erupts from the chest!',penalty:{type:'debuff',effect:'curse',duration:3}}]},
    {text:'Leave it closed',outcomes:[
      {chance:100,text:'Better safe than sorry. You move on.',reward:null}]}
  ]},
sacrifice_altar:{cat:'risk_reward',
  desc:'A stone altar stands in a clearing, stained dark with old offerings. An inscription reads: "Give freely, receive in kind."',
  choices:[
    {text:'Offer 15 gold',outcomes:[
      {chance:60,text:'The altar glows! A warmth fills your body.',reward:{type:'heal',amount:'full'}},
      {chance:40,text:'The gold vanishes. Nothing happens.',penalty:{type:'gold',amount:15}}]},
    {text:'Walk away',outcomes:[
      {chance:100,text:'You keep your gold and your wits.',reward:null}]}
  ]},

// === LORE & DISCOVERY (no fail state) ===
ancient_mural:{cat:'lore',
  desc:'An ancient mural covers the wall, its colors still vivid despite the centuries. It depicts a great battle.',
  text:'The mural tells of a war between the old kingdoms and something that came from beneath the earth. The warriors in the painting carry weapons you recognize — the same designs still used today.',
  reward:{type:'xp',amount:15}},
fallen_journal:{cat:'lore',
  desc:'A leather-bound journal lies beside a pile of old bones. The pages are brittle but legible.',
  text:'The journal belongs to an adventurer who came this way long ago. Their observations about local creatures are remarkably detailed. You commit their findings to memory.',
  reward:{type:'xp',amount:20}},
biome_lore:{cat:'lore',
  desc:'The landscape here tells a story. Scorch marks, collapsed structures, signs of something ancient.',
  text:'You study the surroundings carefully. This place has a history — layers of conflict etched into stone and soil. Understanding where you are helps you understand what you might face.',
  reward:{type:'xp',amount:10}},

// === CLASS-SPECIFIC ===
wounded_animal:{cat:'class_specific',classes:['ranger'],
  desc:'A wounded deer lies on the path, breathing shallowly. A crude arrow protrudes from its flank.',
  genericText:'You can do nothing for the creature. Its suffering ends as you watch.',
  classText:'Your ranger training kicks in. You gently remove the arrow and bind the wound. The deer limps away — and something about its path catches your eye.',
  classReward:{type:'loot',pool:['ghpot','antidote','hpot']},
  genericReward:{type:'xp',amount:5}},
magical_anomaly:{cat:'class_specific',classes:['wizard','warlock','necromancer'],
  desc:'The air shimmers and crackles with residual magic. An arcane disturbance lingers here.',
  genericText:'The magic is beyond your understanding. It fades before you can react.',
  classText:'You recognize the signature — unstable enchantment. With careful channeling, you absorb the residual energy.',
  classReward:{type:'restore_mp',amount:15},
  genericReward:{type:'xp',amount:5}},
collapsed_mine:{cat:'class_specific',classes:['fighter','berserker'],
  desc:'A collapsed mine entrance is blocked by heavy rubble. Something glints beyond the stones.',
  genericText:'The rubble is too heavy to move. You cannot reach whatever lies inside.',
  classText:'You dig deep and heave the boulders aside with sheer strength! Behind them, a forgotten stash.',
  classReward:{type:'loot',pool:['iron_shard','steel_sword','ghpot']},
  genericReward:{type:'xp',amount:5}},
restless_spirits:{cat:'class_specific',classes:['paladin'],
  desc:'Translucent figures drift between the trees, wailing softly. The dead are restless here.',
  genericText:'The spirits ignore you. Their sorrow is palpable but beyond your reach.',
  classText:'You raise your hand and speak words of consecration. The spirits still, then bow in gratitude before fading.',
  classReward:{type:'heal',amount:'full'},
  genericReward:{type:'xp',amount:5}},

// === BATCH 5: NPC RECRUITMENT EVENTS ===
smith_recruit:{cat:'social',stat:'speech',dc:4,adventure:'muddy_trail',
  desc:'You hear hammering in the distance. Through the trees, a makeshift forge glows. A woman in soot-streaked clothes looks up from an anvil.',
  passText:'"You\'ve got a good voice. Trustworthy. I\'ve been forging out here alone since the hollows fell. If there\'s warmth at that tavern you mention... I\'ll come."',
  failText:'"I don\'t know you. And I don\'t trust strangers. Move along." She returns to her work.',
  reward:{type:'recruit',npc:'tvn_smith'},failPenalty:null},
drifter_recruit:{cat:'social',stat:'speech',dc:7,adventure:'iron_hollows',
  desc:'A shadow detaches from the wall ahead. A hooded figure watches you. They don\'t seem hostile — just... waiting.',
  passText:'"Hmm. You can talk. That\'s more than most down here can manage. Fine — I\'ll follow. But I work my own way."',
  failText:'"...No." The figure melts back into the darkness.',
  reward:{type:'recruit',npc:'tvn_drifter'},failPenalty:null},

// === BATCH 5: ADVENTURE-SIDE NPC ENCOUNTERS ===
warden_encounter:{cat:'social',adventure:'muddy_trail',
  desc:'A hooded ranger emerges from the undergrowth. They lower their bow when they see you.',
  text:'"The trail is treacherous. I patrol these woods. If you need healing, I can help."',
  reward:{type:'heal',amount:0.5}},
delver_encounter:{cat:'social',adventure:'iron_hollows',
  desc:'A stocky figure waves from a side tunnel. Their headlamp flickers.',
  text:'"Down here alone? I\'ve cached some supplies. Take what you need."',
  reward:{type:'shop_event',stock:[{key:'hpot',price:10},{key:'mpot',price:10},{key:'antidote',price:8}]}},
crone_encounter:{cat:'social',adventure:'ashen_waste',
  desc:'An ancient woman sits cross-legged on a flat stone, immune to the heat.',
  text:'"The wasteland takes its toll. Let me ease your burden."',
  reward:{type:'heal',amount:0.5}}
};

// Dungeon definitions (1 per adventure)
const DUNGEON_DEFS={
muddy_trail:{name:'The Whispering Hollow',nodes:3,
  enemies:['bog_wraith','shadow_hound','fungal_horror'],boss:'banshee',
  lore:'A mist-filled hollow where the dead whisper secrets. Those who enter rarely return, but those who do speak of treasures guarded by a wailing spirit.',
  bossLoot:'hollow_blade'},
iron_hollows:{name:'The Sunken Vault',nodes:4,
  enemies:['bone_sentinel','crystal_golem','ghoul','corrupted_knight'],boss:'death_knight',
  lore:'A sealed vault deep beneath the mines, flooded with dark water and undead sentinels. The dwarves locked something terrible inside — and it has been waiting.',
  bossLoot:'vault_shield'},
ashen_waste:{name:'The Crucible',nodes:5,
  enemies:['flame_elemental','corrupted_knight','chimera_spawn','wyvern'],boss:'demon_lord',
  lore:'A molten chamber at the heart of the waste, where fire and shadow merge. The Demon Lord dwells here, feeding on the agony of the scorched earth.',
  bossLoot:'crucible_crown'}
};

// Enemy synergy pairs for 1v2 encounters
const ENEMY_SYNERGIES=[
{pair:['giant_spider','venomfang_snake'],reason:'Double poison pressure'},
{pair:['bone_sentinel','ghoul'],reason:'Tank + Stun'},
{pair:['fungal_horror','spore_mite'],reason:'AoE spore synergy'},
{pair:['dire_wolf','shadow_hound'],reason:'Double bleed'},
{pair:['flame_elemental','ash_wyrm'],reason:'Double burn'},
{pair:['corrupted_knight','plague_bearer'],reason:'Bleed + Poison'},
{pair:['crystal_golem','void_stalker'],reason:'Blind from two sources'},
{pair:['banshee','lich_apprentice'],reason:'Double curse'},
{pair:['rock_troll','ironscale_lizard'],reason:'Tank wall'},
{pair:['wyvern','wyvern_hatchling'],reason:'Parent + offspring aggression'}
];

// Stat-check bypass templates for combat nodes (~30% chance)
const COMBAT_BYPASS={
sight:{stat:'sight',dc:6,
  text:'You spot an alternate path around the danger.',
  passText:'Your keen eyes find a way to avoid the confrontation entirely.',
  failText:'The path was a dead end. Combat is unavoidable.'},
speech:{stat:'speech',dc:6,
  text:'You might be able to talk your way out of this.',
  passText:'With careful words, you defuse the situation. The creature backs down.',
  failText:'Your words fall on deaf ears. The creature attacks.'},
movement:{stat:'movement',dc:6,
  text:'You might be fast enough to dash past before it reacts.',
  passText:'You sprint past before it can react!',
  failText:'Not fast enough! The creature blocks your escape.'}
};

// Dungeon-exclusive boss loot items
const DUNGEON_LOOT={
hollow_blade:{name:'Hollow Blade',t:'melee',wt:1,dD:8,dB:2,desc:'Melee, 1d8+2. Whispers in combat. Rare dungeon drop.',value:75},
vault_shield:{name:'Vault Shield',t:'shield',wt:2,blk:4,desc:'+4 block (Light). Dwarven rune-ward. Rare dungeon drop.',value:80},
crucible_crown:{name:'Crucible Crown',t:'armor',wt:0,dB:2,desc:'+2 defense (Weightless). Burns with inner fire. Rare dungeon drop.',value:100}
};

// Map Fragment consumable (added to ITEMS above at runtime)
// ITEMS.map_fragment handled in index.html init

// === BATCH 4: META-PROGRESSION & ROGUELIKE LOOP ===

// --- Phase 4A: Bestiary upgrade data ---

const ENEMY_STATUS_DATA={
gray_ooze:{weak:['burn'],resist:['bleed']},
giant_spider:{weak:['burn'],resist:['poison']},
dire_wolf:{weak:['rooted'],resist:[]},
venomfang_snake:{weak:['burn'],resist:['poison']},
shadow_hound:{weak:['burn'],resist:['bleed']},
fungal_horror:{weak:['burn'],resist:['poison']},
ironscale_lizard:{weak:['burn'],resist:['stun']},
ghoul:{weak:['burn'],resist:['poison','curse']},
bone_sentinel:{weak:['burn'],resist:['poison','bleed']},
rock_troll:{weak:['burn'],resist:['poison']},
wyvern_hatchling:{weak:['rooted'],resist:['poison']},
cave_crawler:{weak:['burn'],resist:['slow']},
flame_elemental:{weak:['slow'],resist:['burn']},
darkwood_treant:{weak:['burn'],resist:['rooted','slow']},
banshee:{weak:['silenced'],resist:['poison','bleed','burn']},
chimera_spawn:{weak:['stun'],resist:[]},
corrupted_knight:{weak:['burn'],resist:['poison','bleed']},
crystal_golem:{weak:['stun'],resist:['blind','poison']},
plague_bearer:{weak:['burn'],resist:['poison','curse']},
wyvern:{weak:['rooted'],resist:['poison']},
mine_shade:{weak:['marked'],resist:['stun']},
death_knight:{weak:['burn'],resist:['poison','curse','bleed']},
void_stalker:{weak:['marked','rooted'],resist:['blind']},
ash_wyrm:{weak:['slow'],resist:['burn']},
lich_apprentice:{weak:['silenced'],resist:['curse','poison']},
storm_elemental:{weak:['rooted'],resist:['stun']},
troll_warlord:{weak:['burn'],resist:['weaken']},
iron_golem:{weak:['burn','slow'],resist:['poison','bleed','curse']},
elder_dragon:{weak:['slow','rooted'],resist:['burn','weaken']},
lich_king:{weak:['silenced','burn'],resist:['poison','curse']},
ancient_construct:{weak:['burn','slow'],resist:['poison','bleed','curse','stun']},
demon_lord:{weak:['burn','marked'],resist:['weaken','curse']},
moss_rat:{weak:['burn'],resist:[]},
marsh_toad:{weak:['burn'],resist:['poison']},
spore_mite:{weak:['burn'],resist:[]},
ember_beetle:{weak:['slow'],resist:['burn']},
ash_worm:{weak:['burn'],resist:[]},
tunnel_bat:{weak:['rooted'],resist:[]}
};

const BESTIARY_THRESHOLDS={basic:0,full:1,mastery:3};

// --- Phase 4B: Adventurepedia section definitions ---

const PEDIA_SECTIONS=[
{key:'bestiary',name:'Bestiary',icon:'\uD83D\uDCD6'},
{key:'atlas',name:'World Atlas',icon:'\uD83D\uDDFA\uFE0F'},
{key:'codex',name:'Class Codex',icon:'\u2694\uFE0F'},
{key:'spellbook',name:'Spellbook',icon:'\u2728'},
{key:'systems',name:'Systems Guide',icon:'\u2699\uFE0F'},
{key:'recipes',name:'Recipe Book',icon:'\uD83E\uDDEA'},
{key:'achievements',name:'Achievements',icon:'\uD83C\uDFC6'}
];

const SYSTEMS_GUIDE_SECTIONS={
zone_combat:{title:'Zone Combat',unlockOn:'first_combat',content:'<p>Combat uses three zones: <strong>Close</strong>, <strong>Mid</strong>, and <strong>Far</strong>. Melee weapons require Close range. Ranged weapons work from any zone but suffer -15% at Close and -10% at Far. Moving costs your action unless you have free movement traits.</p>'},
status_effects:{title:'Status Effects',unlockOn:'first_status',content:'<p><strong>Burn</strong> erodes DEF. <strong>Bleed</strong> scales with hits. <strong>Poison</strong> escalates each turn. <strong>Stagger</strong> -10% hit. <strong>Blind</strong> -30% hit. <strong>Stun</strong> skips turn. <strong>Slow</strong> limits movement. <strong>Rooted</strong> prevents movement. <strong>Silenced</strong> blocks abilities. <strong>Weaken</strong> -1 dmg. <strong>Brittle</strong> +25% incoming. <strong>Exposed</strong> guarantees crit. <strong>Marked</strong> +15% hit vs target. <strong>Curse</strong> prevents healing.</p>'},
block_tiers:{title:'Block Tiers',unlockOn:'first_block',content:'<p><strong>Tier 1</strong> (no shield): Halve incoming damage. <strong>Tier 2</strong> (shield): Flat reduction equal to shield block value. <strong>Tier 3</strong> (Fighter/Paladin + shield): Flat reduction AND full action freedom that turn.</p>'},
intent_system:{title:'Intent System',unlockOn:'first_combat',content:'<p>Enemies telegraph their next action each turn. Intent types: Attack, Defend, Move, Cast, Special. Defeat enemies to learn their full intent details in the Bestiary.</p>'},
weight_movement:{title:'Weight & Movement',unlockOn:'always',content:'<p>Equipment has weight (0-6). Total weight reduces effective Movement stat. High movement grants dodge chance and flee success. Weight labels: Weightless, Very Light, Light, Medium, Heavy, Very Heavy, Crushing.</p>'},
synergies:{title:'Synergies',unlockOn:'first_synergy',content:'<p><strong>Searing Wound</strong> (Burn+Bleed): Bleed scales +2/hit. <strong>Festering</strong> (Poison+Curse): Poison escalates x2. <strong>Hemorrhage</strong> (Bleed+Slow): Bleed tick doubled. <strong>Shatter</strong> (Brittle+Exposed): Crit does triple damage.</p>'},
consumables:{title:'Consumable Rules',unlockOn:'first_consumable',content:'<p>Using a consumable in combat is a <strong>free action</strong> (1 per turn). Healing potions restore HP, mana potions restore MP, antidotes cure poison. Some consumables apply status effects to enemies or grant combat buffs.</p>'},
bounties:{title:'Bounties & Quests',unlockOn:'first_bounty',content:'<p>The Bounty Board at the tavern offers repeatable combat bounties for gold and XP. Quests are one-time objectives with milestone rewards. Bounty combat is non-lethal — defeat returns you to the tavern.</p>'},
crafting:{title:'Crafting',unlockOn:'first_recipe',content:'<p>Collect crafting materials to discover recipes. Crafting combines 2-3 ingredients into a new item. Discovered recipes persist across runs in the Recipe Book.</p>'}
};

// --- Phase 4D: Currency & milestone data ---

const CLASS_MILESTONES={
fighter:[
{id:'f_block25',desc:'Block 25 attacks',trackKey:'blocks',target:25,reward:1},
{id:'f_block100',desc:'Block 100 attacks',trackKey:'blocks',target:100,reward:3},
{id:'f_verb10',desc:'Use Rally 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'f_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
paladin:[
{id:'p_smite10',desc:'Use Smite 10 times',trackKey:'smiteUses',target:10,reward:1},
{id:'p_heal500',desc:'Heal 500 total HP',trackKey:'hpHealed',target:500,reward:2},
{id:'p_verb10',desc:'Use Consecrate 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'p_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
ranger:[
{id:'r_aimed10',desc:'Use Aimed Shot 10 times',trackKey:'aimedUses',target:10,reward:1},
{id:'r_hits200',desc:'Land 200 ranged hits',trackKey:'rangedHits',target:200,reward:2},
{id:'r_verb10',desc:'Use Surveyor 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'r_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
rogue:[
{id:'ro_backstab10',desc:'Use Backstab 10 times',trackKey:'backstabUses',target:10,reward:1},
{id:'ro_vanish10',desc:'Use Vanish 10 times',trackKey:'vanishUses',target:10,reward:1},
{id:'ro_verb10',desc:'Use Vanish (verb) 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'ro_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
wizard:[
{id:'w_bolt25',desc:'Cast Arcane Bolt 25 times',trackKey:'boltUses',target:25,reward:1},
{id:'w_fireball10',desc:'Cast Fireball 10 times',trackKey:'fireballUses',target:10,reward:2},
{id:'w_verb10',desc:'Use Dispel 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'w_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
berserker:[
{id:'b_frenzy10',desc:'Enter Frenzy 10 times',trackKey:'frenzyUses',target:10,reward:1},
{id:'b_rampage10',desc:'Use Rampage 10 times',trackKey:'rampageUses',target:10,reward:2},
{id:'b_verb10',desc:'Use Frenzy (verb) 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'b_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
gunslinger:[
{id:'g_steady10',desc:'Use Steady Shot 10 times',trackKey:'steadyUses',target:10,reward:1},
{id:'g_deadeye10',desc:'Use Dead Eye 10 times',trackKey:'deadeyeUses',target:10,reward:2},
{id:'g_verb10',desc:'Use Quickdraw 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'g_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
necromancer:[
{id:'n_raise10',desc:'Raise Dead 10 times',trackKey:'raiseUses',target:10,reward:1},
{id:'n_harvest10',desc:'Harvest minions 10 times',trackKey:'harvestUses',target:10,reward:2},
{id:'n_verb10',desc:'Use Harvest (verb) 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'n_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
],
warlock:[
{id:'wk_hex10',desc:'Cast Hex Bolt 10 times',trackKey:'hexUses',target:10,reward:1},
{id:'wk_doom5',desc:'Cast Doom 5 times',trackKey:'doomUses',target:5,reward:3},
{id:'wk_verb10',desc:'Use Effigy 10 times',trackKey:'verbUses',target:10,reward:1},
{id:'wk_kills50',desc:'Defeat 50 enemies',trackKey:'kills',target:50,reward:2}
]
};

const SPIRITFIRE_REWARDS={newEntry:1,threshold25:5,threshold50:10,threshold75:20,threshold100:50};

// --- Phase 4E: Run modifier definitions ---

const RUN_MODIFIERS={
no_quarter:{name:'No Quarter',desc:'Cannot flee from combat. Every fight is to the death.'},
fog_of_war:{name:'Fog of War',desc:'Bestiary intel disabled. No HP bars, no intent details.'},
famine:{name:'Famine',desc:'No health drops from enemies. Heal only from shops, NPCs, and crafting.'},
cursed_blood:{name:'Cursed Blood',desc:'Start every combat with a random negative status effect.'},
one_life:{name:'One Life',desc:'No Undying Rage, no revival. True permadeath within run.'},
hunted:{name:'Hunted',desc:'Every 5 combat turns, a reinforcement enemy appears.'}
};

// --- Phase 4F: Permanent unlock structures ---

const CLASS_TREE={
fighter:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'f_G1',name:'Steel Conditioning',type:'general',tier:1,cost:2,desc:'+1 damage on first attack each combat.',prereq:[],effects:[{type:'firstAttackBonus',value:1}]},
    {id:'f_G2',name:'Drilled Reflexes',type:'general',tier:1,cost:2,desc:'+5% melee hit chance.',prereq:[],effects:[{type:'meleeHit',value:5}]},
    // --- Second Tier ---
    {id:'f_G3',name:'Endurance Training',type:'general',tier:2,cost:3,desc:'+4 max HP.',prereq:[['f_G1','f_G2']],effects:[{type:'maxHP',value:4}]},
    {id:'f_G4',name:'Tactical Awareness',type:'general',tier:2,cost:3,desc:'Rally also grants +5% hit for 2 turns.',prereq:[['f_G1','f_G2']],effects:[{type:'abilityEnhance',ability:'rally',mods:{hitBonus:5,hitDuration:2}}]},
    {id:'f_S_Sen1',name:'Shield Mastery',type:'sentinel',tier:2,cost:3,desc:'Shield block +1. Block reduces status duration by 1 turn.',prereq:[['f_G2']],effects:[{type:'blockBonus',value:1},{type:'blockStatusReduce',value:1}]},
    {id:'f_S_Bla1',name:'Aggressive Stance',type:'blade',tier:2,cost:3,desc:'+1 damage all attacks, -1 DEF (toggle).',prereq:[['f_G1']],effects:[{type:'toggle',id:'aggressive_stance',dmgBonus:1,defPenalty:1}]},
    // --- Third Tier ---
    {id:'f_G5',name:'Battle Hardened',type:'general',tier:3,cost:3,desc:'-1 incoming damage from all sources.',prereq:[['f_G3']],effects:[{type:'damageReduction',value:1}]},
    {id:'f_G6',name:'War Experience',type:'general',tier:3,cost:3,desc:'Power Strike MP 4 to 3.',prereq:[['f_G4']],effects:[{type:'abilityCostReduce',ability:'power_strike',value:1}]},
    {id:'f_S_Com1',name:'Field Commander',type:'commandant',tier:3,cost:4,desc:'Battle Cry +2 turns (4 to 6). Stagger +10%.',prereq:[['f_G4']],effects:[{type:'abilityEnhance',ability:'battle_cry',mods:{durationBonus:2}},{type:'statusChanceBonus',status:'stagger',value:10}]},
    {id:'f_S_Sen2',name:'Immovable',type:'sentinel',tier:3,cost:4,desc:'While blocking: immune to Slow/Rooted. Rally cleanses 2 effects.',prereq:[['f_S_Sen1'],['f_G3']],effects:[{type:'blockStatusImmune',statuses:['slow','rooted']},{type:'abilityEnhance',ability:'rally',mods:{cleanse:2}}]},
    // --- Fourth Tier ---
    {id:'f_S_Com2',name:'Inspiring Presence',type:'commandant',tier:4,cost:4,desc:'Battle Cry also grants +1 DEF. Stagger +1 turn.',prereq:[['f_S_Com1']],minGeneral:2,effects:[{type:'abilityEnhance',ability:'battle_cry',mods:{defBonus:1}},{type:'statusDurationBonus',status:'stagger',value:1}]},
    {id:'f_S_Bla2',name:'Killing Intent',type:'blade',tier:4,cost:4,desc:'Crit +10%. +3 damage vs enemies below 30% HP.',prereq:[['f_S_Bla1'],['f_G5','f_G6']],effects:[{type:'critBonus',value:10},{type:'damageVsLowHP',value:3,threshold:30}]},
    // --- Unlock (Tier 5) ---
    {id:'f_U_Sen',name:'Sentinel Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Sentinel subclass.',prereq:[['f_S_Sen1'],['f_S_Sen2']],subclass:'sentinel',minNodes:8,effects:[{type:'subclassUnlock',subclass:'sentinel'}]},
    {id:'f_U_Com',name:'Commandant Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Commandant subclass.',prereq:[['f_S_Com1'],['f_S_Com2']],subclass:'commandant',minNodes:8,effects:[{type:'subclassUnlock',subclass:'commandant'}]},
    {id:'f_U_Bla',name:'Blade Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Blade subclass.',prereq:[['f_S_Bla1'],['f_S_Bla2']],subclass:'blade',minNodes:8,effects:[{type:'subclassUnlock',subclass:'blade'}]}
  ],
  subclasses:{
    sentinel:{name:'Sentinel',desc:'Front-line tank specialist.'},
    commandant:{name:'Commandant',desc:'Tactical commander.'},
    blade:{name:'Blade',desc:'Pure damage specialist.'}
  }
},
ranger:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'r_G1',name:'Steady Hand',type:'general',tier:1,cost:2,desc:'+5% ranged hit chance.',prereq:[],effects:[{type:'rangedHit',value:5}]},
    {id:'r_G2',name:'Wilderness Instinct',type:'general',tier:1,cost:2,desc:'+1 Sight for exploration events.',prereq:[],effects:[{type:'sight',value:1}]},
    // --- Second Tier ---
    {id:'r_G3',name:'Arrow Conservation',type:'general',tier:2,cost:3,desc:'Aimed Shot MP 3 to 2.',prereq:[['r_G1','r_G2']],effects:[{type:'abilityCostReduce',ability:'aimed_shot',value:1}]},
    {id:'r_G4',name:'Keen Eye',type:'general',tier:2,cost:3,desc:'Surveyor also reveals status resistances and weaknesses.',prereq:[['r_G1','r_G2']],effects:[{type:'abilityEnhance',ability:'surveyor',mods:{revealResists:true}}]},
    {id:'r_S_Mar1',name:'Lethal Precision',type:'marksman',tier:2,cost:3,desc:'+2 damage vs Marked targets.',prereq:[['r_G1']],effects:[{type:'damageVsMarked',value:2}]},
    {id:'r_S_Tra1',name:'Snare Expert',type:'trapper',tier:2,cost:3,desc:'Multi-Shot Slow +15% per arrow. Slow +1 turn.',prereq:[['r_G2']],effects:[{type:'abilityEnhance',ability:'multi_shot',mods:{slowBonusPerArrow:15}},{type:'statusDurationBonus',status:'slow',value:1}]},
    // --- Third Tier ---
    {id:'r_G5',name:'Survivalist',type:'general',tier:3,cost:3,desc:'+3 max HP, +1 Effective Movement.',prereq:[['r_G3','r_G4']],effects:[{type:'maxHP',value:3},{type:'effMov',value:1}]},
    {id:'r_G6',name:'Patient Hunter',type:'general',tier:3,cost:3,desc:'Track MP 2 to 1. Marked +1 turn.',prereq:[['r_G3']],effects:[{type:'abilityCostReduce',ability:'track',value:1},{type:'statusDurationBonus',status:'marked',value:1}]},
    {id:'r_S_Mar2',name:'Dead Calm',type:'marksman',tier:3,cost:4,desc:'Crit +15% when not moved zones. Aimed Shot adds Bleed.',prereq:[['r_S_Mar1'],['r_G3','r_G6']],effects:[{type:'passive',id:'dead_calm',critBonusStationary:15},{type:'abilityEnhance',ability:'aimed_shot',mods:{addBleed:true}}]},
    {id:'r_S_Out1',name:'Dual Grip',type:'outrider',tier:3,cost:4,desc:'Dagger 1d6+2. No zone-change penalty switching ranged/melee.',prereq:[['r_G5']],effects:[{type:'passive',id:'dual_grip',daggerDie:6,daggerBonus:2,noZonePenalty:true}]},
    // --- Fourth Tier ---
    {id:'r_S_Tra2',name:'Killzone',type:'trapper',tier:4,cost:4,desc:'Place zone trap (damage + Bleed on entry). 1/combat, 3 MP.',prereq:[['r_S_Tra1']],minGeneral:2,effects:[{type:'grantAbility',id:'killzone',cost:3,perCombat:1,trapDamage:true,trapBleed:true}]},
    {id:'r_S_Out2',name:'Momentum',type:'outrider',tier:4,cost:4,desc:'After melee hit: next ranged +2. After ranged hit: next melee +2.',prereq:[['r_S_Out1'],['r_G3','r_G6']],effects:[{type:'passive',id:'momentum',meleeToRangedBonus:2,rangedToMeleeBonus:2}]},
    // --- Unlock (Tier 5) ---
    {id:'r_U_Mar',name:'Marksman Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Marksman subclass.',prereq:[['r_S_Mar1'],['r_S_Mar2']],subclass:'marksman',minNodes:8,effects:[{type:'subclassUnlock',subclass:'marksman'}]},
    {id:'r_U_Tra',name:'Trapper Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Trapper subclass.',prereq:[['r_S_Tra1'],['r_S_Tra2']],subclass:'trapper',minNodes:8,effects:[{type:'subclassUnlock',subclass:'trapper'}]},
    {id:'r_U_Out',name:'Outrider Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Outrider subclass.',prereq:[['r_S_Out1'],['r_S_Out2']],subclass:'outrider',minNodes:8,effects:[{type:'subclassUnlock',subclass:'outrider'}]}
  ],
  subclasses:{
    marksman:{name:'Marksman',desc:'Long-range precision specialist.'},
    trapper:{name:'Trapper',desc:'Zone-control tactician.'},
    outrider:{name:'Outrider',desc:'Hybrid melee-ranged skirmisher.'}
  }
},
gunslinger:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'g_G1',name:'Quick Reflexes',type:'general',tier:1,cost:2,desc:'+5% ranged hit with Pistol.',prereq:[],effects:[{type:'rangedHit',value:5}]},
    {id:'g_G2',name:'Gunpowder Intuition',type:'general',tier:1,cost:2,desc:'Quickdraw also reveals target next intent.',prereq:[],effects:[{type:'abilityEnhance',ability:'quickdraw',mods:{revealIntent:true}}]},
    // --- Second Tier ---
    {id:'g_G3',name:'Ammunition Craft',type:'general',tier:2,cost:3,desc:'Pistol +1 damage. Misses: 20% chance to apply intended status.',prereq:[['g_G1','g_G2']],effects:[{type:'rangedDmg',value:1},{type:'passive',id:'ammo_craft',missStatusChance:20}]},
    {id:'g_G4',name:'Steady Nerves',type:'general',tier:2,cost:3,desc:'Quickdraw +2 damage. Immune to Stagger 1 turn after Quickdraw.',prereq:[['g_G1','g_G2']],effects:[{type:'abilityEnhance',ability:'quickdraw',mods:{dmgBonus:2}},{type:'passive',id:'steady_nerves',staggerImmune1t:true}]},
    {id:'g_S_Sni1',name:'Patience Pays',type:'sniper',tier:2,cost:3,desc:'Skip attacking 1 turn: next shot +3 damage, +10% crit.',prereq:[['g_G1']],effects:[{type:'passive',id:'patience_pays',skipBonus:3,skipCrit:10}]},
    {id:'g_S_Cow1',name:'Fan the Hammer',type:'cowboy',tier:2,cost:3,desc:'New ability: 2 shots at -10% accuracy, 3 MP.',prereq:[['g_G1','g_G2']],effects:[{type:'grantAbility',id:'fan_the_hammer',cost:3,shots:2,accuracyPenalty:10}]},
    // --- Third Tier ---
    {id:'g_G5',name:'Slippery',type:'general',tier:3,cost:3,desc:'+1 EffMov. Flee +10% from any zone.',prereq:[['g_G3','g_G4']],effects:[{type:'effMov',value:1},{type:'fleeBonus',value:10}]},
    {id:'g_G6',name:'Read the Room',type:'general',tier:3,cost:3,desc:'+1 Sight. Marked enemies: DEF revealed.',prereq:[['g_G4']],effects:[{type:'sight',value:1},{type:'passive',id:'read_room',markedRevealDEF:true}]},
    {id:'g_S_Sni2',name:'One Between the Eyes',type:'sniper',tier:3,cost:4,desc:'+3 damage vs Marked. Quickdraw doubles vs Exposed.',prereq:[['g_S_Sni1'],['g_G3','g_G4']],effects:[{type:'damageVsMarked',value:3},{type:'abilityEnhance',ability:'quickdraw',mods:{doubleVsExposed:true}}]},
    {id:'g_S_Luc1',name:'Trick Shot',type:'lucky_shooter',tier:3,cost:4,desc:'New ability: choose Weaken/Slow/Blind. 4 MP.',prereq:[['g_G2']],effects:[{type:'grantAbility',id:'trick_shot',cost:4,chooseEffect:['weaken','slow','blind']}]},
    // --- Fourth Tier ---
    {id:'g_S_Cow2',name:'Never Stop Shooting',type:'cowboy',tier:4,cost:4,desc:'Fan the Hammer: 3 shots. Free shot on kill. Blind +15%.',prereq:[['g_S_Cow1']],minGeneral:2,effects:[{type:'abilityEnhance',ability:'fan_the_hammer',mods:{shots:3,freeOnKill:true}},{type:'statusChanceBonus',status:'blind',value:15}]},
    {id:'g_S_Luc2',name:'Fortune Favors the Bold',type:'lucky_shooter',tier:4,cost:4,desc:'Trick Shot interrupts. +1 Sight/Speech. Quickdraw 25% Exposed.',prereq:[['g_S_Luc1'],['g_G5','g_G6']],effects:[{type:'abilityEnhance',ability:'trick_shot',mods:{interrupts:true}},{type:'sight',value:1},{type:'speech',value:1},{type:'abilityEnhance',ability:'quickdraw',mods:{exposedChance:25}}]},
    // --- Unlock (Tier 5) ---
    {id:'g_U_Sni',name:'Sniper Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Sniper subclass.',prereq:[['g_S_Sni1'],['g_S_Sni2']],subclass:'sniper',minNodes:8,effects:[{type:'subclassUnlock',subclass:'sniper'}]},
    {id:'g_U_Cow',name:'Cowboy Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Cowboy subclass.',prereq:[['g_S_Cow1'],['g_S_Cow2']],subclass:'cowboy',minNodes:8,effects:[{type:'subclassUnlock',subclass:'cowboy'}]},
    {id:'g_U_Luc',name:'Lucky Shooter Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Lucky Shooter subclass.',prereq:[['g_S_Luc1'],['g_S_Luc2']],subclass:'lucky_shooter',minNodes:8,effects:[{type:'subclassUnlock',subclass:'lucky_shooter'}]}
  ],
  subclasses:{
    sniper:{name:'Sniper',desc:'Patient precision marksman.'},
    cowboy:{name:'Cowboy',desc:'Rapid-fire gunfighter.'},
    lucky_shooter:{name:'Lucky Shooter',desc:'Trick-shot specialist.'}
  }
},
rogue:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'ro_G1',name:'Keen Edge',type:'general',tier:1,cost:2,desc:'Dagger crit +10%.',prereq:[],effects:[{type:'critBonus',value:10}]},
    {id:'ro_G2',name:'Light Feet',type:'general',tier:1,cost:2,desc:'+1 EffMov. Free zone move once per combat.',prereq:[],effects:[{type:'effMov',value:1},{type:'freeZoneMove',value:1}]},
    // --- Second Tier ---
    {id:'ro_G3',name:'Opportunist',type:'general',tier:2,cost:3,desc:'Backstab multiplier 3x to 3.5x.',prereq:[['ro_G1','ro_G2']],effects:[{type:'abilityEnhance',ability:'backstab',mods:{multiplier:3.5}}]},
    {id:'ro_G4',name:'Shadow Sense',type:'general',tier:2,cost:3,desc:'+1 Sight. Auto trap detection at visited nodes.',prereq:[['ro_G1','ro_G2']],effects:[{type:'sight',value:1},{type:'passive',id:'shadow_sense',autoTrapDetect:true}]},
    {id:'ro_S_Pha1',name:'Ghost Step',type:'phantom',tier:2,cost:3,desc:'Vanish +2 damage on emerge. Items don\'t break stealth.',prereq:[['ro_G2']],effects:[{type:'abilityEnhance',ability:'vanish',mods:{emergeDmgBonus:2,itemsStealth:true}}]},
    {id:'ro_S_Ser1',name:'Venom Knowledge',type:'serpent',tier:2,cost:3,desc:'Weaken 90%. Dagger vs Weakened: 25% Poison.',prereq:[['ro_G1']],effects:[{type:'statusChanceBonus',status:'weaken',value:20},{type:'passive',id:'venom_knowledge',poisonVsWeakened:25}]},
    // --- Third Tier ---
    {id:'ro_G5',name:'Exploit Weakness',type:'general',tier:3,cost:3,desc:'+2 damage vs any enemy with 1+ status effect.',prereq:[['ro_G3']],effects:[{type:'damageVsDebuffed',value:2}]},
    {id:'ro_G6',name:'Resourceful',type:'general',tier:3,cost:3,desc:'Consumable effects +1 turn. +1 Speech.',prereq:[['ro_G4']],effects:[{type:'passive',id:'resourceful',consumableDurationBonus:1},{type:'speech',value:1}]},
    {id:'ro_S_Pha2',name:'Death from Shadows',type:'phantom',tier:3,cost:4,desc:'Vanish resets on kill from stealth. Assassinate 5x to 6x.',prereq:[['ro_S_Pha1']],minGeneral:2,effects:[{type:'passive',id:'death_from_shadows',vanishResetOnKill:true},{type:'abilityEnhance',ability:'assassinate',mods:{multiplier:6}}]},
    {id:'ro_S_Sca1',name:'Sticky Fingers',type:'scavenger',tier:3,cost:4,desc:'Better loot rarity. +1 gold all sources. 15% bonus consumable after combat.',prereq:[['ro_G4']],effects:[{type:'passive',id:'sticky_fingers',lootRarityBonus:true,goldBonus:1,consumableChance:15}]},
    // --- Fourth Tier ---
    {id:'ro_S_Ser2',name:'Thousand Cuts',type:'serpent',tier:4,cost:4,desc:'+1 damage per unique debuff on target. Nerve Damage also Bleed 50%.',prereq:[['ro_S_Ser1']],minGeneral:2,effects:[{type:'passive',id:'thousand_cuts',dmgPerDebuff:1},{type:'abilityEnhance',ability:'nerve_damage',mods:{bleedChance:50}}]},
    {id:'ro_S_Sca2',name:'Dungeon Rat',type:'scavenger',tier:4,cost:4,desc:'Shop prices -10%. Reveal hidden shop item. +1 Sight/Movement exploration.',prereq:[['ro_S_Sca1'],['ro_G6','ro_G2']],effects:[{type:'passive',id:'dungeon_rat',shopDiscount:10,hiddenItemReveal:true,exploreSight:1,exploreMov:1}]},
    // --- Unlock (Tier 5) ---
    {id:'ro_U_Pha',name:'Phantom Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Phantom subclass.',prereq:[['ro_S_Pha1'],['ro_S_Pha2']],subclass:'phantom',minNodes:8,effects:[{type:'subclassUnlock',subclass:'phantom'}]},
    {id:'ro_U_Ser',name:'Serpent Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Serpent subclass.',prereq:[['ro_S_Ser1'],['ro_S_Ser2']],subclass:'serpent',minNodes:8,effects:[{type:'subclassUnlock',subclass:'serpent'}]},
    {id:'ro_U_Sca',name:'Scavenger Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Scavenger subclass.',prereq:[['ro_S_Sca1'],['ro_S_Sca2']],subclass:'scavenger',minNodes:8,effects:[{type:'subclassUnlock',subclass:'scavenger'}]}
  ],
  subclasses:{
    phantom:{name:'Phantom',desc:'Stealth assassin.'},
    serpent:{name:'Serpent',desc:'Poison saboteur.'},
    scavenger:{name:'Scavenger',desc:'Resourceful opportunist.'}
  }
},
paladin:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'p_G1',name:'Righteous Resolve',type:'general',tier:1,cost:2,desc:'+4 max HP.',prereq:[],effects:[{type:'maxHP',value:4}]},
    {id:'p_G2',name:'Devotion',type:'general',tier:1,cost:2,desc:'Holy Light MP 5 to 4.',prereq:[],effects:[{type:'abilityCostReduce',ability:'holy_light',value:1}]},
    // --- Second Tier ---
    {id:'p_G3',name:'Holy Fervor',type:'general',tier:2,cost:3,desc:'Smite +1d4. Burn +10% (50 to 60%).',prereq:[['p_G1','p_G2']],effects:[{type:'abilityEnhance',ability:'smite',mods:{dmgDie:4}},{type:'statusChanceBonus',status:'burn',value:10}]},
    {id:'p_G4',name:'Stalwart Faith',type:'general',tier:2,cost:3,desc:'Consecrate +1 turn (3 to 4), +1 damage/turn (2 to 3).',prereq:[['p_G1','p_G2']],effects:[{type:'abilityEnhance',ability:'consecrate',mods:{durationBonus:1,dmgPerTurnBonus:1}}]},
    {id:'p_S_Hea1',name:'Mercy',type:'healer',tier:2,cost:3,desc:'Holy Light +3 HP (8 to 11). Can target summons in 2v2.',prereq:[['p_G2']],effects:[{type:'abilityEnhance',ability:'holy_light',mods:{healBonus:3,targetSummons:true}}]},
    {id:'p_S_Wra1',name:'Burning Judgment',type:'wrathbringer',tier:2,cost:3,desc:'Smite Burn +20% (stacks with G3 up to 80%). Burn stacks +1 per Smite.',prereq:[['p_G3','p_G1']],effects:[{type:'statusChanceBonus',status:'burn',value:20},{type:'abilityEnhance',ability:'smite',mods:{burnStackBonus:1}}]},
    // --- Third Tier ---
    {id:'p_G5',name:'Unyielding',type:'general',tier:3,cost:3,desc:'Divine Shield usable twice per combat. Second use +2 MP (8 to 10).',prereq:[['p_G1']],effects:[{type:'abilityEnhance',ability:'divine_shield',mods:{usesPerCombat:2,secondUseCostBonus:2}}]},
    {id:'p_G6',name:'Aura of Protection',type:'general',tier:3,cost:3,desc:'+1 DEF in Consecrated zone. Undead in zone +1 holy damage per turn.',prereq:[['p_G4']],effects:[{type:'passive',id:'aura_protection',defInConsecrate:1,holyVsUndead:1}]},
    {id:'p_S_Oat1',name:'Fortress Stance',type:'oathshield',tier:3,cost:4,desc:'Shield block +2. Block grants +1 DEF 2 turns (stacks to +3).',prereq:[['p_G1','p_G4']],effects:[{type:'blockBonus',value:2},{type:'passive',id:'fortress_stance',blockDefBonus:1,blockDefDuration:2,blockDefCap:3}]},
    {id:'p_S_Hea2',name:'Wellspring',type:'healer',tier:3,cost:4,desc:'Regen 1 HP/turn in Consecrated zone. Holy Light cleanses 1 status.',prereq:[['p_S_Hea1']],minGeneral:2,effects:[{type:'passive',id:'wellspring',regenInConsecrate:1},{type:'abilityEnhance',ability:'holy_light',mods:{cleanse:1}}]},
    // --- Fourth Tier ---
    {id:'p_S_Wra2',name:'Purging Fire',type:'wrathbringer',tier:4,cost:4,desc:'Detonate: consume Burn for 2x tick damage. 4 MP. Smite +2 vs Burning.',prereq:[['p_S_Wra1']],minGeneral:2,effects:[{type:'grantAbility',id:'detonate_burn',cost:4,tickMultiplier:2},{type:'abilityEnhance',ability:'smite',mods:{bonusVsBurning:2}}]},
    {id:'p_S_Oat2',name:'Immovable Bastion',type:'oathshield',tier:4,cost:4,desc:'Consecrate Slows enemies. Counter-attack 2 holy on block in zone. -1 damage in own Consecrated zone.',prereq:[['p_S_Oat1'],['p_G5','p_G6']],effects:[{type:'abilityEnhance',ability:'consecrate',mods:{slowEnemies:true}},{type:'passive',id:'immovable_bastion',counterHoly:2,zoneReduction:1}]},
    // --- Unlock (Tier 5) ---
    {id:'p_U_Hea',name:'Healer Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Healer subclass.',prereq:[['p_S_Hea1'],['p_S_Hea2']],subclass:'healer',minNodes:8,effects:[{type:'subclassUnlock',subclass:'healer'}]},
    {id:'p_U_Wra',name:'Wrathbringer Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Wrathbringer subclass.',prereq:[['p_S_Wra1'],['p_S_Wra2']],subclass:'wrathbringer',minNodes:8,effects:[{type:'subclassUnlock',subclass:'wrathbringer'}]},
    {id:'p_U_Oat',name:'Oathshield Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Oathshield subclass.',prereq:[['p_S_Oat1'],['p_S_Oat2']],subclass:'oathshield',minNodes:8,effects:[{type:'subclassUnlock',subclass:'oathshield'}]}
  ],
  subclasses:{
    healer:{name:'Healer',desc:'Divine support specialist.'},
    wrathbringer:{name:'Wrathbringer',desc:'Holy offensive caster.'},
    oathshield:{name:'Oathshield',desc:'Immovable fortress defender.'}
  }
},
necromancer:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'n_G1',name:'Death\'s Whisper',type:'general',tier:1,cost:2,desc:'Grave Charge +1 per enemy death (doubles base rate).',prereq:[],effects:[{type:'passive',id:'deaths_whisper',graveChargeBonus:1}]},
    {id:'n_G2',name:'Dark Resilience',type:'general',tier:1,cost:2,desc:'+4 max HP. Immune to Curse.',prereq:[],effects:[{type:'maxHP',value:4},{type:'statusImmune',status:'curse'}]},
    // --- Second Tier ---
    {id:'n_G3',name:'Bone Servitor',type:'general',tier:2,cost:3,desc:'Undead +2 HP, +1 turn before decay.',prereq:[['n_G1','n_G2']],effects:[{type:'passive',id:'bone_servitor',undeadHPBonus:2,undeadDurationBonus:1}]},
    {id:'n_G4',name:'Necrotic Attunement',type:'general',tier:2,cost:3,desc:'Staff +1 necrotic damage. Personal kills +1 bonus Grave Charge.',prereq:[['n_G1','n_G2']],effects:[{type:'meleeDmg',value:1},{type:'passive',id:'necrotic_attunement',personalKillCharge:1}]},
    {id:'n_S_Gra1',name:'Mass Grave',type:'gravecaller',tier:2,cost:3,desc:'Raise 2 undead simultaneously. Basic undead cost -1 Charge.',prereq:[['n_G1']],effects:[{type:'abilityEnhance',ability:'raise_dead',mods:{raiseCount:2,costReduce:1}}]},
    {id:'n_S_Dre1',name:'Dread Aura',type:'dreadmage',tier:2,cost:3,desc:'Enemies in zone -1 damage dealt. Curse guaranteed on direct spells.',prereq:[['n_G2']],effects:[{type:'passive',id:'dread_aura',enemyDmgReduce:1},{type:'statusChanceBonus',status:'curse',value:100}]},
    // --- Third Tier ---
    {id:'n_G5',name:'Soul Harvest',type:'general',tier:3,cost:3,desc:'Harvest +1 Charge refund, +2 HP healing.',prereq:[['n_G3','n_G4']],effects:[{type:'abilityEnhance',ability:'harvest',mods:{chargeRefund:1,healBonus:2}}]},
    {id:'n_G6',name:'Forbidden Knowledge',type:'general',tier:3,cost:3,desc:'+1 Sight. Undead bestiary auto-complete on first encounter.',prereq:[['n_G4']],effects:[{type:'sight',value:1},{type:'passive',id:'forbidden_knowledge',undeadBestiaryAuto:true}]},
    {id:'n_S_Sou1',name:'Death Pyre',type:'soulreaper',tier:3,cost:4,desc:'Detonate Undead: sacrifice for 2x minion HP as burst AoE. 2 MP. Applies Curse.',prereq:[['n_G1','n_G3']],effects:[{type:'grantAbility',id:'detonate_undead',cost:2,hpMultiplier:2,appliesCurse:true}]},
    {id:'n_S_Gra2',name:'Endless Horde',type:'gravecaller',tier:3,cost:4,desc:'2 active + 1 reserve undead. Weaken on hit 25%. Mass Rise: raise all fallen at half HP for 3 Charges.',prereq:[['n_S_Gra1']],minGeneral:2,effects:[{type:'passive',id:'endless_horde',activeUndead:2,reserveUndead:1,weakenOnHit:25},{type:'grantAbility',id:'mass_rise',chargeCost:3}]},
    // --- Fourth Tier ---
    {id:'n_S_Sou2',name:'Soul Engine',type:'soulreaper',tier:4,cost:4,desc:'Detonate 3x HP. Harvest cleanses all self-debuffs. +1 damage on next attack when minion dies.',prereq:[['n_S_Sou1']],minGeneral:2,effects:[{type:'abilityEnhance',ability:'detonate_undead',mods:{hpMultiplier:3}},{type:'abilityEnhance',ability:'harvest',mods:{cleanseSelf:true}},{type:'passive',id:'soul_engine',dmgOnMinionDeath:1}]},
    {id:'n_S_Dre2',name:'Grasp of the Grave',type:'dreadmage',tier:4,cost:4,desc:'Soul Drain: necrotic to Cursed enemy, heal 50%. Rooted via direct spell. Silenced 60%.',prereq:[['n_S_Dre1']],minGeneral:2,effects:[{type:'grantAbility',id:'soul_drain',healPct:50,appliesRooted:true,silencedChance:60}]},
    // --- Unlock (Tier 5) ---
    {id:'n_U_Gra',name:'Gravecaller Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Gravecaller subclass.',prereq:[['n_S_Gra1'],['n_S_Gra2']],subclass:'gravecaller',minNodes:8,effects:[{type:'subclassUnlock',subclass:'gravecaller'}]},
    {id:'n_U_Sou',name:'Soulreaper Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Soulreaper subclass.',prereq:[['n_S_Sou1'],['n_S_Sou2']],subclass:'soulreaper',minNodes:8,effects:[{type:'subclassUnlock',subclass:'soulreaper'}]},
    {id:'n_U_Dre',name:'Dreadmage Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Dreadmage subclass.',prereq:[['n_S_Dre1'],['n_S_Dre2']],subclass:'dreadmage',minNodes:8,effects:[{type:'subclassUnlock',subclass:'dreadmage'}]}
  ],
  subclasses:{
    gravecaller:{name:'Gravecaller',desc:'Undead horde commander.'},
    soulreaper:{name:'Soulreaper',desc:'Sacrifice-fueled destroyer.'},
    dreadmage:{name:'Dreadmage',desc:'Dark debuff caster.'}
  }
},
wizard:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'w_G1',name:'Arcane Focus',type:'general',tier:1,cost:2,desc:'Arcane Bolt +1d4 (2d6 to 2d6+1d4).',prereq:[],effects:[{type:'abilityEnhance',ability:'arcane_bolt',mods:{bonusDie:4}}]},
    {id:'w_G2',name:'Mana Well',type:'general',tier:1,cost:2,desc:'+4 max MP.',prereq:[],effects:[{type:'maxMP',value:4}]},
    // --- Second Tier ---
    {id:'w_G3',name:'Efficient Casting',type:'general',tier:2,cost:3,desc:'Arcane Bolt MP 3 to 2. Arcane Binding MP -1.',prereq:[['w_G1','w_G2']],effects:[{type:'abilityCostReduce',ability:'arcane_bolt',value:1},{type:'abilityCostReduce',ability:'arcane_binding',value:1}]},
    {id:'w_G4',name:'Elemental Affinity',type:'general',tier:2,cost:3,desc:'Fireball +1d4. Burn +10% (50 to 60%).',prereq:[['w_G1','w_G2']],effects:[{type:'abilityEnhance',ability:'fireball',mods:{bonusDie:4}},{type:'statusChanceBonus',status:'burn',value:10}]},
    {id:'w_S_Asc1',name:'Overcharge',type:'arcane_ascended',tier:2,cost:3,desc:'Double MP on damage spell for +50% damage. 1/combat.',prereq:[['w_G1']],effects:[{type:'grantAbility',id:'overcharge',perCombat:1,dmgMultiplier:1.5,costMultiplier:2}]},
    {id:'w_S_Con1',name:'Arcane Familiar',type:'conjurer',tier:2,cost:3,desc:'Summon entity (HP = Smarts x 2, 1d4 attack). 4 MP.',prereq:[['w_G2']],effects:[{type:'grantAbility',id:'summon_familiar',cost:4,hpFormula:'smarts*2',atkDie:4}]},
    // --- Third Tier ---
    {id:'w_G5',name:'Spell Shaping',type:'general',tier:3,cost:3,desc:'Arcane Binding Slow +1 turn. Dispel removes 2 effects.',prereq:[['w_G3','w_G4']],effects:[{type:'abilityEnhance',ability:'arcane_binding',mods:{slowDurationBonus:1}},{type:'abilityEnhance',ability:'dispel',mods:{removeCount:2}}]},
    {id:'w_G6',name:'Arcane Insight',type:'general',tier:3,cost:3,desc:'+1 Sight. +1 effective Smarts for Arcane Bolt hit.',prereq:[['w_G3']],effects:[{type:'sight',value:1},{type:'passive',id:'arcane_insight',smartsBonus:1}]},
    {id:'w_S_Asc2',name:'Annihilation',type:'arcane_ascended',tier:3,cost:4,desc:'Overcharge 2/combat. Fireball Burn 90%. Free spell after kill.',prereq:[['w_S_Asc1']],minGeneral:2,effects:[{type:'abilityEnhance',ability:'overcharge',mods:{perCombat:2}},{type:'abilityEnhance',ability:'fireball',mods:{burnChance:90}},{type:'passive',id:'annihilation',freeSpellOnKill:true}]},
    {id:'w_S_Bat1',name:'Arcane Armor',type:'battlemage',tier:3,cost:4,desc:'Mana Shield: 1 MP absorbs 2 damage. Can equip shield without Spellbook.',prereq:[['w_G2','w_G5']],effects:[{type:'passive',id:'arcane_armor',manaShieldRatio:2,shieldWithoutSpellbook:true}]},
    // --- Fourth Tier ---
    {id:'w_S_Con2',name:'Master Conjurer',type:'conjurer',tier:4,cost:4,desc:'Familiar +3 HP, 1d6 attack, Support Slows. Resummon 1/combat 3 MP. +1 MP regen while active.',prereq:[['w_S_Con1']],minGeneral:2,effects:[{type:'abilityEnhance',ability:'summon_familiar',mods:{hpBonus:3,atkDie:6,supportSlow:true,resummon:true,resummonCost:3}},{type:'passive',id:'master_conjurer',mpRegenWhileActive:1}]},
    {id:'w_S_Bat2',name:'War Mage',type:'battlemage',tier:4,cost:4,desc:'1 MP regen/turn. Mana Shield 25% reflects 2 damage. Staff melee +2.',prereq:[['w_S_Bat1'],['w_G4','w_G6']],effects:[{type:'passive',id:'war_mage',mpRegen:1,manaShieldReflect:2,manaShieldReflectChance:25},{type:'meleeDmg',value:2}]},
    // --- Unlock (Tier 5) ---
    {id:'w_U_Asc',name:'Arcane Ascended Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Arcane Ascended subclass.',prereq:[['w_S_Asc1'],['w_S_Asc2']],subclass:'arcane_ascended',minNodes:8,effects:[{type:'subclassUnlock',subclass:'arcane_ascended'}]},
    {id:'w_U_Con',name:'Conjurer Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Conjurer subclass.',prereq:[['w_S_Con1'],['w_S_Con2']],subclass:'conjurer',minNodes:8,effects:[{type:'subclassUnlock',subclass:'conjurer'}]},
    {id:'w_U_Bat',name:'Battlemage Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Battlemage subclass.',prereq:[['w_S_Bat1'],['w_S_Bat2']],subclass:'battlemage',minNodes:8,effects:[{type:'subclassUnlock',subclass:'battlemage'}]}
  ],
  subclasses:{
    arcane_ascended:{name:'Arcane Ascended',desc:'Glass cannon spellcaster.'},
    conjurer:{name:'Conjurer',desc:'Arcane summoner.'},
    battlemage:{name:'Battlemage',desc:'Armored spell-warrior.'}
  }
},
berserker:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'b_G1',name:'Bloodlust',type:'general',tier:1,cost:2,desc:'Aggro Bleed chance raised to 90%.',prereq:[],effects:[{type:'statusChanceBonus',status:'bleed',value:20}]},
    {id:'b_G2',name:'Thick Skin',type:'general',tier:1,cost:2,desc:'+5 max HP. -1 damage from first hit each combat.',prereq:[],effects:[{type:'maxHP',value:5},{type:'firstHitReduction',value:1}]},
    // --- Second Tier ---
    {id:'b_G3',name:'Reckless Fury',type:'general',tier:2,cost:3,desc:'Aggro +3 damage (from +2), +1 turn (3 to 4).',prereq:[['b_G1','b_G2']],effects:[{type:'abilityEnhance',ability:'aggro',mods:{dmgBonus:1,durationBonus:1}}]},
    {id:'b_G4',name:'Pain Tolerance',type:'general',tier:2,cost:3,desc:'Frenzy at 60% (from 50%). Frenzy +3 per hit (from +2).',prereq:[['b_G1','b_G2']],effects:[{type:'abilityEnhance',ability:'frenzy',mods:{threshold:60,hitBonus:1}}]},
    {id:'b_S_Sca1',name:'Blood Price',type:'scarborne',tier:2,cost:3,desc:'Sacrifice: spend 20% current HP as bonus damage on next attack. No MP. 1/turn.',prereq:[['b_G1']],effects:[{type:'grantAbility',id:'sacrifice',cost:0,hpPct:20,perTurn:1}]},
    {id:'b_S_War1',name:'Cleaving Strikes',type:'warpath',tier:2,cost:3,desc:'Rampage applies Bleed independently per hit. In 1v2: hits split between targets.',prereq:[['b_G1','b_G2']],effects:[{type:'abilityEnhance',ability:'rampage',mods:{bleedPerHit:true,splitTargets:true}}]},
    // --- Third Tier ---
    {id:'b_G5',name:'Berserker\'s Instinct',type:'general',tier:3,cost:3,desc:'+5% melee hit. Below 50%: additional +10%.',prereq:[['b_G3','b_G4']],effects:[{type:'meleeHit',value:5},{type:'passive',id:'berserker_instinct',lowHPHitBonus:10,lowHPThreshold:50}]},
    {id:'b_G6',name:'Intimidating Presence',type:'general',tier:3,cost:3,desc:'+1 Speech. Enemies -5% hit for first 2 turns.',prereq:[['b_G4']],effects:[{type:'speech',value:1},{type:'passive',id:'intimidating_presence',enemyHitPenalty:5,penaltyDuration:2}]},
    {id:'b_S_Sca2',name:'Agony Fueled',type:'scarborne',tier:3,cost:4,desc:'+1 damage per 10% HP missing. Self-debuffs +1 damage each. Sacrifice 2/turn.',prereq:[['b_S_Sca1']],minGeneral:2,effects:[{type:'passive',id:'agony_fueled',dmgPer10PctMissing:1,dmgPerSelfDebuff:1},{type:'abilityEnhance',ability:'sacrifice',mods:{perTurn:2}}]},
    {id:'b_S_Und1',name:'Iron Will',type:'undying',tier:3,cost:4,desc:'Undying Rage triggers twice (second costs 10 MP). Status durations on self -1 turn.',prereq:[['b_G2','b_G4']],effects:[{type:'abilityEnhance',ability:'undying_rage',mods:{uses:2,secondCost:10}},{type:'statusDurationSelfMod',value:-1}]},
    // --- Fourth Tier ---
    {id:'b_S_War2',name:'Unstoppable',type:'warpath',tier:4,cost:4,desc:'Rampage: 3 attacks. Free attack on kill. Bleed guaranteed during Aggro.',prereq:[['b_S_War1']],minGeneral:2,effects:[{type:'abilityEnhance',ability:'rampage',mods:{attacks:3,freeOnKill:true}},{type:'passive',id:'unstoppable',bleedGuaranteedAggro:true}]},
    {id:'b_S_Und2',name:'Deathless',type:'undying',tier:4,cost:4,desc:'Regen 2 HP/turn below 50%. Undying Rage +2 DEF 3 turns. -2 damage below 25% HP.',prereq:[['b_S_Und1'],['b_G3','b_G5']],effects:[{type:'passive',id:'deathless',regenBelow50:2,undyingDefBonus:2,undyingDefDuration:3,reductionBelow25:2}]},
    // --- Unlock (Tier 5) ---
    {id:'b_U_Sca',name:'Scarborne Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Scarborne subclass.',prereq:[['b_S_Sca1'],['b_S_Sca2']],subclass:'scarborne',minNodes:8,effects:[{type:'subclassUnlock',subclass:'scarborne'}]},
    {id:'b_U_War',name:'Warpath Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Warpath subclass.',prereq:[['b_S_War1'],['b_S_War2']],subclass:'warpath',minNodes:8,effects:[{type:'subclassUnlock',subclass:'warpath'}]},
    {id:'b_U_Und',name:'Undying Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Undying subclass.',prereq:[['b_S_Und1'],['b_S_Und2']],subclass:'undying',minNodes:8,effects:[{type:'subclassUnlock',subclass:'undying'}]}
  ],
  subclasses:{
    scarborne:{name:'Scarborne',desc:'Pain-fueled berserker.'},
    warpath:{name:'Warpath',desc:'Relentless cleaving warrior.'},
    undying:{name:'Undying',desc:'Unkillable last-stand fighter.'}
  }
},
warlock:{
  nodes:[
    // --- Entry (Tier 1) ---
    {id:'wk_G1',name:'Hex Mastery',type:'general',tier:1,cost:2,desc:'Curse +15% chance, +1 turn duration.',prereq:[],effects:[{type:'statusChanceBonus',status:'curse',value:15},{type:'statusDurationBonus',status:'curse',value:1}]},
    {id:'wk_G2',name:'Dark Vitality',type:'general',tier:1,cost:2,desc:'Lifesteal +5% of damage vs debuffed enemies.',prereq:[],effects:[{type:'lifestealPct',value:5}]},
    // --- Second Tier ---
    {id:'wk_G3',name:'Maleficent Knowledge',type:'general',tier:2,cost:3,desc:'+1 Sight. Hexing Focus +1 damage.',prereq:[['wk_G1','wk_G2']],effects:[{type:'sight',value:1},{type:'passive',id:'maleficent_knowledge',focusDmgBonus:1}]},
    {id:'wk_G4',name:'Sympathetic Resonance',type:'general',tier:2,cost:3,desc:'Effigy +2 turns. Status tick damage on linked target +1 per tick.',prereq:[['wk_G1','wk_G2']],effects:[{type:'abilityEnhance',ability:'effigy',mods:{durationBonus:2,tickDmgBonus:1}}]},
    {id:'wk_S_Vam1',name:'Blood Siphon',type:'vampire',tier:2,cost:3,desc:'Lifesteal doubled vs Cursed. +3 HP on debuffed enemy death.',prereq:[['wk_G2']],effects:[{type:'passive',id:'blood_siphon',lifestealDoubledVsCursed:true,hpOnDebuffedKill:3}]},
    {id:'wk_S_Bli1',name:'Rapid Affliction',type:'blightweaver',tier:2,cost:3,desc:'Debuff ability MP costs -1. Free Marked 1/combat.',prereq:[['wk_G1']],effects:[{type:'passive',id:'rapid_affliction',debuffCostReduce:1,freeMarked:1}]},
    // --- Third Tier ---
    {id:'wk_G5',name:'Eldritch Resilience',type:'general',tier:3,cost:3,desc:'+4 max HP. Status durations on self -1 turn.',prereq:[['wk_G3','wk_G4']],effects:[{type:'maxHP',value:4},{type:'statusDurationSelfMod',value:-1}]},
    {id:'wk_G6',name:'Tormentor',type:'general',tier:3,cost:3,desc:'Brittle +20% chance, +1 turn. Brittle enemies take +1 from status ticks.',prereq:[['wk_G4']],effects:[{type:'statusChanceBonus',status:'brittle',value:20},{type:'statusDurationBonus',status:'brittle',value:1},{type:'passive',id:'tormentor',brittleTickBonus:1}]},
    {id:'wk_S_Pup1',name:'Thread of Pain',type:'puppet_master',tier:3,cost:4,desc:'30% damage taken redirected to linked enemy. Effigy links both in 1v2, effects bleed 50%.',prereq:[['wk_G4']],effects:[{type:'passive',id:'thread_of_pain',redirectPct:30,effigyLinksBoth:true,effectBleedPct:50}]},
    {id:'wk_S_Vam2',name:'Feast of Suffering',type:'vampire',tier:3,cost:4,desc:'Soul Tap: drain HP = 2x debuff count on Cursed enemy. 3 MP, 1/turn. Lifesteal on tick damage.',prereq:[['wk_S_Vam1']],minGeneral:2,effects:[{type:'grantAbility',id:'soul_tap',cost:3,perTurn:1,drainPerDebuff:2},{type:'passive',id:'feast_of_suffering',lifestealOnTicks:true}]},
    // --- Fourth Tier ---
    {id:'wk_S_Pup2',name:'Master of Strings',type:'puppet_master',tier:4,cost:4,desc:'Redirect 50%. Mirror Hex: copy all effects between linked enemies, 4 MP, 1/combat. +1 DEF while Effigy active.',prereq:[['wk_S_Pup1']],minGeneral:2,effects:[{type:'passive',id:'master_of_strings',redirectPct:50,defWhileEffigy:1},{type:'grantAbility',id:'mirror_hex',cost:4,perCombat:1}]},
    {id:'wk_S_Bli2',name:'Cascade of Ruin',type:'blightweaver',tier:4,cost:4,desc:'Apply 2 effects in one action. Brittle +35% damage taken. +1 per active debuff. Guaranteed Marked on all abilities.',prereq:[['wk_S_Bli1']],minGeneral:2,effects:[{type:'passive',id:'cascade_of_ruin',dualApply:true,brittleDmgBonus:35,dmgPerDebuff:1,guaranteedMarked:true}]},
    // --- Unlock (Tier 5) ---
    {id:'wk_U_Vam',name:'Vampire Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Vampire subclass.',prereq:[['wk_S_Vam1'],['wk_S_Vam2']],subclass:'vampire',minNodes:8,effects:[{type:'subclassUnlock',subclass:'vampire'}]},
    {id:'wk_U_Pup',name:'Puppet Master Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Puppet Master subclass.',prereq:[['wk_S_Pup1'],['wk_S_Pup2']],subclass:'puppet_master',minNodes:8,effects:[{type:'subclassUnlock',subclass:'puppet_master'}]},
    {id:'wk_U_Bli',name:'Blightweaver Unlock',type:'unlock',tier:5,cost:5,desc:'Unlock the Blightweaver subclass.',prereq:[['wk_S_Bli1'],['wk_S_Bli2']],subclass:'blightweaver',minNodes:8,effects:[{type:'subclassUnlock',subclass:'blightweaver'}]}
  ],
  subclasses:{
    vampire:{name:'Vampire',desc:'Life-draining sustain specialist.'},
    puppet_master:{name:'Puppet Master',desc:'Damage-redirecting manipulator.'},
    blightweaver:{name:'Blightweaver',desc:'Multi-debuff affliction caster.'}
  }
}
};

const SHRINE_UPGRADES={
tavern:[
{id:'shr_ration',name:'Trail Rations',cost:5,desc:'Start each adventure with 1 extra Ration.'},
{id:'shr_shop',name:'Supply Crate',cost:15,desc:'Tavern shop stocks 2 additional items.'},
{id:'shr_bounty',name:'Bounty Expansion',cost:25,desc:'Bounty board can hold 7 postings.'}
],
species:[],
starting:[
{id:'shr_gold',name:'Nest Egg',cost:10,desc:'Start each run with 25 bonus gold.'},
{id:'shr_lvl',name:'Head Start',cost:20,desc:'Start each run at level 2.'}
],
world:[]
};

// --- Phase 6A: Subclass ability replacements (Ability 4 slot) ---

const SUBCLASS_ABILITIES={
fighter:{
  sentinel:{name:'Iron Guard',cost:5,desc:'+3 DEF 3 turns, taunt enemy focus.',unlockLevel:12},
  commandant:{name:'War Orders',cost:4,desc:'Extend all buffs 2 turns. Allies +1 damage.',unlockLevel:12},
  blade:{name:'Deathblow',cost:5,desc:'+50% damage, +20% crit. MP refund on kill.',unlockLevel:12}
},
ranger:{
  marksman:{name:'Killshot',cost:5,desc:'Skip turn. Next attack triple damage + auto-crit.',unlockLevel:12},
  trapper:{name:'Spring Trap',cost:3,desc:'Place zone trap: damage + Bleed on entry.',unlockLevel:12},
  outrider:{name:'Skirmish',cost:3,desc:'Melee + ranged attack in same turn.',unlockLevel:12}
},
gunslinger:{
  sniper:{name:'One Perfect Shot',cost:6,desc:'Skip turn. Next shot triple + crit + Exposed.',unlockLevel:12},
  cowboy:{name:'Fan the Hammer',cost:4,desc:'3 shots at -15% accuracy. Blind +15% each.',unlockLevel:12},
  lucky_shooter:{name:'Trick Shot',cost:4,desc:'Choose guaranteed Weaken, Slow, or Blind.',unlockLevel:12}
},
rogue:{
  phantom:{name:'Shadow Kill',cost:4,desc:'Vanish resets on kill. Assassinate at 6x.',unlockLevel:12},
  serpent:{name:'Envenom',cost:3,desc:'Next 3 attacks guarantee Poison. +1 per debuff on target.',unlockLevel:12},
  scavenger:{name:'Pilfer',cost:2,desc:'Steal consumable from enemy. 1/combat.',unlockLevel:12}
},
paladin:{
  healer:{name:'Prayer of Restoration',cost:5,desc:'Heal 6 + cleanse 1 status + 1 DEF 2 turns.',unlockLevel:12},
  wrathbringer:{name:'Purging Fire',cost:4,desc:'Consume Burn for 2x tick damage instantly. +2 vs Burning.',unlockLevel:12},
  oathshield:{name:'Fortify',cost:4,desc:'+3 DEF 3 turns. Consecrate Slows while active.',unlockLevel:12}
},
necromancer:{
  gravecaller:{name:'Endless Horde',cost:0,chargeCost:3,desc:'Raise 2 undead. Weaken on hit 25%.',unlockLevel:12},
  soulreaper:{name:'Detonate Undead',cost:2,desc:'Sacrifice minion for 2x HP burst AoE + Curse.',unlockLevel:12},
  dreadmage:{name:'Soul Drain',cost:4,desc:'Necrotic damage to Cursed enemy, heal 50%. Rooted 40%.',unlockLevel:12}
},
wizard:{
  arcane_ascended:{name:'Overcharge',cost:0,desc:'Double MP on damage spell for +50% damage. 2/combat.',unlockLevel:12,special:'costMultiplier'},
  conjurer:{name:'Summon Familiar',cost:4,desc:'Summon entity: HP = Smarts x 2, 1d4 attack. Attack/Defend/Support.',unlockLevel:12},
  battlemage:{name:'Arcane Armor',cost:3,desc:'Mana Shield 1:2 ratio. Equip shield without Spellbook.',unlockLevel:12}
},
berserker:{
  scarborne:{name:'Sacrifice',cost:0,desc:'Spend 20% current HP as bonus damage. No MP. 1/turn.',unlockLevel:12},
  warpath:{name:'Cleave',cost:4,desc:'Rampage splits targets in 1v2. Bleed per hit.',unlockLevel:12},
  undying:{name:'Iron Will',cost:6,desc:'-2 incoming damage 3 turns. Status durations -1 turn.',unlockLevel:12}
},
warlock:{
  vampire:{name:'Soul Tap',cost:3,desc:'Drain HP = 2x debuff count on Cursed enemy. 1/turn.',unlockLevel:12},
  puppet_master:{name:'Sympathetic Link',cost:4,desc:'Enhanced Effigy. 30% damage redirect. Effect bleed in 1v2.',unlockLevel:12},
  blightweaver:{name:'Cascade',cost:3,desc:'Apply 2 effects simultaneously from Curse/Brittle/Marked.',unlockLevel:12}
}
};

// --- Phase 6A: Out-of-combat class abilities ---

const CLASS_OOC_ABILITIES={
fighter:{stat:'movement',abilities:[
  {id:'ooc_forced_entry',name:'Forced Entry',desc:'Break obstacles using Melee instead of Sight.',statSwap:{from:'sight',to:'melee'},passive:false},
  {id:'ooc_endurance_march',name:'Endurance March',desc:'No movement penalties from consecutive combat nodes.',passive:true}
]},
ranger:{stat:'sight',abilities:[
  {id:'ooc_tracker',name:'Tracker',desc:'Auto-reveals animal tracks at exploration events.',passive:true},
  {id:'ooc_forager',name:'Forager',desc:'Small chance to find free consumable at Lore events.',passive:true}
]},
gunslinger:{stat:'movement',abilities:[
  {id:'ooc_warning_shot',name:'Warning Shot',desc:'Use Ranged instead of Speech for intimidation.',statSwap:{from:'speech',to:'ranged'},passive:false},
  {id:'ooc_quick_draw',name:'Quick Draw Reflexes',desc:'+5% to avoid ambush damage at trap events.',passive:true}
]},
rogue:{stat:'sight',abilities:[
  {id:'ooc_lockpick',name:'Lockpick',desc:'Bonus to locked container/door checks innately.',passive:true},
  {id:'ooc_case_joint',name:'Case the Joint',desc:'At shops, reveals full inventory including hidden items.',passive:true}
]},
paladin:{stat:'speech',abilities:[
  {id:'ooc_holy_light',name:'Holy Light',desc:'Heal outside combat. Only class with OOC healing.',passive:false,mpCost:4},
  {id:'ooc_consecrate_ground',name:'Consecrate Ground',desc:'At undead/spirit events: bonus Pedia entries + Spiritfire.',passive:false}
]},
necromancer:{stat:'speech',abilities:[
  {id:'ooc_speak_dead',name:'Speak with Dead',desc:'At Lore events: lore entries, path reveals, or enemy intel.',passive:false},
  {id:'ooc_sense_death',name:'Sense Death',desc:'Detect undead in upcoming nodes (mini-shroud reveal).',passive:true}
]},
wizard:{stat:'sight',abilities:[
  {id:'ooc_arcane_analysis',name:'Arcane Analysis',desc:'At magical events: bonus lore, recipe hints, or buffs.',passive:false},
  {id:'ooc_identify',name:'Identify',desc:'Identify unknown items on discovery before equipping.',passive:true}
]},
berserker:{stat:'movement',abilities:[
  {id:'ooc_intimidate',name:'Intimidate',desc:'Use Melee instead of Speech at social encounters.',statSwap:{from:'speech',to:'melee'},passive:false},
  {id:'ooc_brute_force',name:'Brute Force',desc:'Destroy obstacles. Always works but may cause collateral.',passive:false}
]},
warlock:{stat:'speech',abilities:[
  {id:'ooc_hex_sense',name:'Hex Sense',desc:'Sense curses, dark magic, traps. +2 Sight for curse detection.',passive:true},
  {id:'ooc_dark_bargain',name:'Dark Bargain',desc:'Trade HP for better rewards at Risk/Social events.',passive:false,hpCost:true}
]}
};

// === BATCH 5: TAVERN NPCs + DIALOGUE + REPUTATION ===

const TAVERN_NPCS={
tvn_hearthkeeper:{
  name:'The Hearthkeeper',title:'Spirit of Spiritfire',
  desc:{ember:'"...the fire... remembers..."',spark:'"The fire burns steadier now. Welcome back."',flame:'"Welcome home, traveler."',hearth:'"The hearth burns bright. You are never alone here."'},
  recruitCondition:null, // always present
  services:['heal','bounty_board','shrine'],
  dialoguePool:{
    stranger:{greetings:['"...you came."','"The fire... flickers for you."','"Another soul, drawn to the warmth."'],
      topics:[{text:'"What is this place?"',response:'"A ruin. A memory. A fire that refuses to die."'},{text:'"Who are you?"',response:'"I am the fire. I am what remains."'}]},
    trusted:{greetings:['"The fire knows your step."','"Welcome back. The hearth remembers."','"You return. Good."'],
      topics:[{text:'"How is the tavern?"',response:'"Growing. Each soul that joins feeds the flame."'},{text:'"Tell me about Spiritfire."',response:'"It is the light left behind by those who fall. It endures where flesh does not."'}]},
    ally:{greetings:['"Welcome home."','"The hearth burns bright for you."','"You are the fire\'s champion now."'],
      topics:[{text:'"What happens when the hearth is full?"',response:'"Then we are whole. Then the tavern lives again, truly. And the darkness knows it."'}]}
  }
},
tvn_smith:{
  name:'The Smith',title:'Master Forgewright',
  desc:'A gruff woman with soot-streaked arms hammers at a makeshift anvil.',
  recruitCondition:{type:'exploration_event',event:'smith_recruit'},
  unlocks:{adventure:'iron_hollows'},
  services:['shop','craft'],
  shop:{stock:[{key:'iron_sword',price:25},{key:'steel_sword',price:40},{key:'mace',price:30},{key:'rapier',price:28},{key:'scale_mail',price:35},{key:'iron_plate',price:55},{key:'iron_shield',price:30},{key:'broadsword',price:32},{key:'war_hammer',price:45},{key:'halberd',price:40},{key:'longbow',price:35},{key:'crossbow',price:45}]},
  dialoguePool:{
    stranger:{greetings:['"What do you want?"','"Steel or plate? Speak up."','"Another one. Fine. Browse, don\'t touch."'],
      topics:[{text:'"Tell me about your craft."',response:'"I forge. You fight. That\'s all you need to know."'}]},
    trusted:{greetings:['"Back again. Your gear holding up?"','"I\'ve sharpened a new blade. Want to see?"'],
      topics:[{text:'"Any recommendations?"',response:'"Depends on what\'s trying to kill you. Show me your weapon and I\'ll tell you if it\'s garbage."'}]},
    ally:{greetings:['"My best customer. What\'ll it be?"','"I forged something special. Have a look."'],
      topics:[{text:'"You seem happier here."',response:'"Don\'t push it. But... yeah. This place isn\'t bad. The fire\'s warm, the anvil\'s steady. Could be worse."'}]}
  }
},
tvn_apothecary:{
  name:'The Apothecary',title:'Quiet Healer',
  desc:'A slight figure in herb-stained robes sorts dried plants into glass vials with practiced care.',
  recruitCondition:{type:'spiritfire_tier',value:1,sfCost:15},
  services:['shop','heal_better'],
  shop:{stock:[{key:'purification_scroll',price:12},{key:'antidote',price:8},{key:'bandage',price:8},{key:'burn_salve',price:8},{key:'ghpot',price:20},{key:'elixir',price:25},{key:'scroll_dispel',price:24},{key:'mushroom_brew',price:8},{key:'strength_tonic',price:10},{key:'focus_draught',price:10}]},
  dialoguePool:{
    stranger:{greetings:['"Hm? Oh. A customer."','"Careful with that. It\'s fragile."','"Need something for the pain?"'],
      topics:[{text:'"What do you sell?"',response:'"Cures. Tonics. Things that keep you alive when the wilderness tries to kill you."'}]},
    trusted:{greetings:['"Ah, you again. I mixed something new."','"Your timing is good. Fresh batch of elixirs."'],
      topics:[{text:'"How did you learn herbalism?"',response:'"My mother. Her mother before her. We\'ve always been healers. The world always needs healers."'}]},
    ally:{greetings:['"I saved the good stock for you."','"Come in. I\'ll make you something special."'],
      topics:[{text:'"Do you like it here?"',response:'"The Hearthkeeper\'s fire dries the herbs perfectly. And I can hear myself think. Yes. I like it here."'}]}
  }
},
tvn_drifter:{
  name:'The Drifter',title:'Keeper of Secrets',
  desc:'A hooded figure leans against the far wall, barely visible in the flickering light.',
  recruitCondition:{type:'exploration_event',event:'drifter_recruit'},
  unlocks:{adventure:'ashen_waste',bountySlots:5},
  services:['shop','bounty_expand'],
  shop:{stock:[{key:'shadow_cloak',price:40},{key:'throwing_knives',price:32},{key:'flashbang',price:18},{key:'silencing_powder',price:24},{key:'poison_vial',price:10},{key:'fire_flask',price:10},{key:'hex_scroll',price:18},{key:'root_snare',price:15}]},
  dialoguePool:{
    stranger:{greetings:['"..."','"You\'re staring."','"I deal in things. You want things?"'],
      topics:[{text:'"What do you sell?"',response:'"Rare goods. Don\'t ask where I get them."'}]},
    trusted:{greetings:['"You again. You\'re persistent."','"I heard something interesting. Maybe later."'],
      topics:[{text:'"Any news from the wasteland?"',response:'"The Ashen Waste shifts. New paths open. Old ones close. Stay sharp."'}]},
    ally:{greetings:['"Partner. What do you need?"','"I saved something for you. Don\'t tell the others."'],
      topics:[{text:'"Why do you stay?"',response:'"The fire\'s warm. The company\'s... tolerable. And someone needs to keep an eye on things."'}]}
  }
},
tvn_captain:{
  name:'The Captain',title:'Field Commander',
  desc:'A stern woman in battered plate armor studies a map pinned to the wall, marking positions with a charcoal stick.',
  recruitCondition:{type:'bounties_or_spiritfire',bounties:10,sfTier:2,sfCost:30},
  services:['modifiers','map_intel'],
  dialoguePool:{
    stranger:{greetings:['"State your business."','"Hmph. Another recruit."','"Can you fight? That\'s all I care about."'],
      topics:[{text:'"What do you do here?"',response:'"I organize the hunt. Bounties, modifiers, tactical intel. I keep this operation running."'}]},
    trusted:{greetings:['"Soldier. What\'s your report?"','"Good timing. I have new assignments."'],
      topics:[{text:'"Any strategic advice?"',response:'"Know your enemy. The bestiary isn\'t just a book — it\'s a survival guide. Study it."'}]},
    ally:{greetings:['"Commander. It\'s good to see you."','"I\'ve been waiting for you. We have work to do."'],
      topics:[{text:'"How goes the war?"',response:'"Better, since you arrived. The darkness is retreating. But it\'s not over yet."'}]}
  }
},
tvn_scholar:{
  name:'The Scholar',title:'Cataloguer of Wonders',
  desc:'A bespectacled figure hunches over a pile of books and scrolls, muttering about taxonomies and classifications.',
  recruitCondition:{type:'pedia_pct',value:25},
  services:['discovery_quests','pedia_commentary'],
  dialoguePool:{
    stranger:{greetings:['"Hm? What? Oh, a person."','"Don\'t touch the books."','"Are you here about the catalogue?"'],
      topics:[{text:'"What are you researching?"',response:'"Everything. The bestiary, the atlas, the class codex. Someone needs to document all of this before it\'s lost."'}]},
    trusted:{greetings:['"Ah, my field researcher! What have you found?"','"I\'ve updated the catalogue. Come see."'],
      topics:[{text:'"How is the Adventurepedia?"',response:'"Growing. Every entry you bring back fills another gap. We\'re building something important here."'}]},
    ally:{greetings:['"My favorite adventurer! I have discoveries to share."','"Come, come! I\'ve made a breakthrough."'],
      topics:[{text:'"Is the catalogue complete?"',response:'"Getting closer. Every creature documented, every region mapped. The world is vast, but we\'re learning its shape."'}]}
  }
},
tvn_exile:{
  name:'The Exile',title:'???',
  desc:'A vast, still figure sits in the darkest corner. You cannot make out their features.',
  recruitCondition:{type:'all_adventures'},
  unlocks:{legendMode:true},
  services:['legend_mode','legendary_shop'],
  shop:{stock:[]},
  dialoguePool:{
    stranger:{greetings:['*Silence.*','*A low hum.*','*Eyes like dying stars.*'],
      topics:[]},
    trusted:{greetings:['"You have walked far."','"The fire does not warm me. But it... remembers."'],
      topics:[{text:'"What are you?"',response:'"What remains when everything else is stripped away."'}]},
    ally:{greetings:['"You are ready."','"The legend awaits. Will you answer?"'],
      topics:[{text:'"Tell me about Legend Mode."',response:'"Everything you have faced, amplified. No mercy. No forgiveness. Only glory — or oblivion."'}]}
  }
}
};

const ADVENTURE_SIDE_NPCS={
adv_warden:{name:'The Warden',adventure:'muddy_trail',
  desc:'A hooded ranger emerges from the undergrowth, bow in hand. They study you with calm, appraising eyes.',
  dialogueText:'"The trail is treacherous. I patrol these woods — have for years. If you need healing or advice, I can help."',
  services:['heal'],healAmount:0.5},
adv_delver:{name:'The Delver',adventure:'iron_hollows',
  desc:'A stocky figure in mining gear waves from a side tunnel. Their headlamp flickers but holds.',
  dialogueText:'"Down here alone? You\'re braver than most. I\'ve cached some supplies — take what you need."',
  services:['sell'],shop:{stock:[{key:'hpot',price:10},{key:'mpot',price:10},{key:'antidote',price:8},{key:'iron_shard',price:15}]}},
adv_crone:{name:'The Crone',adventure:'ashen_waste',
  desc:'An ancient woman sits cross-legged on a flat stone, seemingly immune to the heat. She watches you with milky eyes.',
  dialogueText:'"The wasteland takes its toll. Let me ease your burden."',
  services:['heal','sell'],healAmount:0.5,
  shop:{stock:[{key:'burn_salve',price:8},{key:'ghpot',price:18},{key:'elixir',price:22},{key:'strength_tonic',price:10}]}}
};

const TAVERN_STATES={
ember:{minNPCs:0,desc:'A guttering fire in a ruined hall. Dust and silence. A flickering shape by the dying flame.'},
spark:{minNPCs:2,desc:'The fire burns steadier. A workbench against the wall. Bottles on a shelf. A clearer voice speaks from the hearth.'},
flame:{minNPCs:4,desc:'Lanterns line the walls. The smell of stew. A bounty board thick with postings. The Hearthkeeper stands tall by the fire.'},
hearth:{minNPCs:6,desc:'The Hearthstone Tavern lives again. Voices, warmth, purpose. Something vast and quiet sits in the far corner.'}
};

const REPUTATION_TIERS=[
{key:'stranger',threshold:0,discount:0},
{key:'trusted',threshold:5,discount:0.10},
{key:'ally',threshold:10,discount:0.15}
];

const CLASS_UNLOCK_TIERS={
simple:{classes:['fighter','ranger','gunslinger'],reqUnlocked:0},
medium:{classes:['rogue','paladin','necromancer'],reqUnlocked:3},
complex:{classes:['wizard','berserker','warlock'],reqUnlocked:6}
};

const MILESTONES={
// Tier A (auto-tracked breadcrumbs)
first_blood:{tier:'A',name:'First Blood',desc:'Win your first combat encounter.',trackKey:'totalKills',target:1,reward:{gold:15}},
first_steps:{tier:'A',name:'First Steps',desc:'Complete your first adventure.',trackKey:'adventuresCompleted',target:1,reward:{spiritfire:3}},
bounty_beginner:{tier:'A',name:'Bounty Beginner',desc:'Complete your first bounty.',trackKey:'totalBounties',target:1,reward:{gold:20}},
well_traveled:{tier:'A',name:'Well-Traveled',desc:'Visit 5 different regions.',trackKey:'regionsVisited',target:5,reward:{gold:25}},
survivor:{tier:'A',name:'Survivor',desc:'Survive 3 runs.',trackKey:'totalRuns',target:3,reward:{spiritfire:2}},
explorer:{tier:'A',name:'Explorer',desc:'Complete 2 different adventures.',trackKey:'adventuresCompleted',target:2,reward:{spiritfire:5}},
full_house:{tier:'A',name:'Full House',desc:'Recruit 4 tavern NPCs.',trackKey:'recruitedCount',target:4,reward:{spiritfire:10}},
level_five:{tier:'A',name:'Rising Star',desc:'Reach level 5.',trackKey:'bestLevel',target:5,reward:{gold:30}},
level_ten:{tier:'A',name:'Veteran',desc:'Reach level 10.',trackKey:'bestLevel',target:10,reward:{spiritfire:5}},
crafter:{tier:'A',name:'Apprentice Crafter',desc:'Discover 3 recipes.',trackKey:'recipesFound',target:3,reward:{gold:20}},
collector:{tier:'A',name:'Collector',desc:'Find 15 bestiary entries.',trackKey:'bestiaryEntries',target:15,reward:{spiritfire:3}},
class_explorer:{tier:'A',name:'Class Explorer',desc:'Play 3 different classes.',trackKey:'classesPlayed',target:3,reward:{spiritfire:5}},
gold_hoarder:{tier:'A',name:'Gold Hoarder',desc:'Earn 200 total gold from bounties.',trackKey:'totalBountyGold',target:200,reward:{spiritfire:3}},
dungeon_diver:{tier:'A',name:'Dungeon Diver',desc:'Complete your first dungeon.',trackKey:'dungeonsCompleted',target:1,reward:{spiritfire:5}},
// Tier B (progression gates)
veteran_hunter:{tier:'B',name:'Veteran Hunter',desc:'Complete 10 bounties.',trackKey:'totalBounties',target:10,reward:{bountyGoldBonus:0.10}},
slayer:{tier:'B',name:'Slayer',desc:'Complete 25 bounties.',trackKey:'totalBounties',target:25,reward:{spiritfire:20}},
master_explorer:{tier:'B',name:'Master Explorer',desc:'Complete all 3 adventures.',trackKey:'adventuresCompleted',target:3,reward:{spiritfire:15}},
pedia_scholar:{tier:'B',name:'Pedia Scholar',desc:'Reach 50% Adventurepedia completion.',trackKey:'pediaPct',target:50,reward:{spiritfire:10}},
iron_will:{tier:'B',name:'Iron Will',desc:'Survive 10 runs.',trackKey:'totalRuns',target:10,reward:{spiritfire:8}},
legend_seeker:{tier:'B',name:'Legend Seeker',desc:'Reach level 15.',trackKey:'bestLevel',target:15,reward:{spiritfire:10}}
};
