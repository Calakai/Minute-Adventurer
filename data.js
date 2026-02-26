/* =====================================================================
   THE MUDDY TRAIL — Game Data
   Enemies, items, NPCs, scenes, death quotes
   ===================================================================== */

const ENEMIES={
gray_ooze:{name:'Gray Ooze',id:'gray_ooze',lore:'A shimmering mass of corrosive slime that oozes along forest trails, drawn to warmth and movement. Slow but relentless.',hp:15,mHP:15,atk:5,def:0,dD:4,dB:1,spd:5,aRng:5,sDist:10,xp:50,
  loot:[{item:'hpot',weight:50},{item:null,weight:50}]},
giant_spider:{name:'Giant Spider',id:'giant_spider',lore:'A forest-dwelling predator that lurks in the canopy, spitting venom and descending on silk threads to ambush travelers below.',hp:18,mHP:18,atk:6,def:1,dD:6,dB:1,spd:7,aRng:10,sDist:15,xp:75,
  onHit:{effect:'poison',chance:40,duration:3,dmg:2},
  loot:[{item:'antidote',weight:40},{item:'hpot',weight:25},{item:null,weight:35}]},
dire_wolf:{name:'Dire Wolf',id:'dire_wolf',lore:'A massive grey wolf, scarred and cunning. It circles its prey with unnerving patience before closing with terrifying speed.',hp:22,mHP:22,atk:7,def:1,dD:8,dB:1,spd:10,aRng:5,sDist:20,xp:90,
  loot:[{item:'wolf_pelt',weight:35},{item:'hpot',weight:20},{item:'mpot',weight:15},{item:null,weight:30}]}
};

const ITEMS={
hpot:{name:'Health Potion',t:'consumable',wt:0,heal:10,desc:'Restores 10 HP'},
mpot:{name:'Mana Potion',t:'consumable',wt:0,mana:10,desc:'Restores 10 MP'},
antidote:{name:'Antidote',t:'consumable',wt:0,cure:'poison',desc:'Cures poison'},
wolf_pelt:{name:'Wolf Pelt',t:'misc',wt:1,desc:'A thick grey pelt. Proof of the kill.',value:15},
guide:{name:"Player's Guide",t:'key',wt:0,desc:'A weathered guide to combat, creatures, and the world.',undrop:true}
};

const NPCS={
aldric:{name:'Aldric',title:'The Gatekeeper',desc:'A weathered guardsman stands beside the trail gate, watching with tired but alert eyes.'},
mira:{name:'Mira',title:'The Healer',desc:'A woman in green robes tends herbs near the shrine. She looks up and smiles warmly.'}
};

const SCENE_DATA={
trailhead:{name:'The Trailhead',subtitle:'Where the road ends and the wild begins',
  description:'The muddy trail stretches northward into a dense, fog-choked forest. The air is thick with wet earth and decay. A half-rotted sign reads: \u201cBeware \u2014 creatures ahead.\u201d',
  npcs:['aldric'],
  exits:{forward:{scene:'midway',label:'Midway on the Trail',discovered:true}},
  events:{onFirstVisit:null,onEnter:null,combat:null}},
midway:{name:'Midway on the Trail',subtitle:'Where the trees close in',
  description:'The trail narrows between gnarled trees whose branches interlock overhead. Mud sucks at your boots with every step.',
  npcs:[],
  exits:{forward:{scene:'ooze',label:'Deeper Trail',discovered:true},back:{scene:'trailhead',label:'The Trailhead',discovered:true}},
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
    {id:'search',label:'Search Again',desc:'Look more carefully',condition(r){return r.ss.oozeSearch1&&!r.ss.oozeSearch2}}]},
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
  actions:[{id:'search_spider',label:'Search Webs',desc:'Something caught in the silk',condition(r){return!r.ss.spiderSearch1}}]},
wolf_den:{name:'The Dark Hollow',subtitle:null,
  description:'The trail dips into a rocky hollow. Claw marks score the stone. A low growl rumbles from the shadows.',
  npcs:[],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:'dire_wolf'}},
post_wolf:{name:'The Hollow, After',subtitle:'Where silence settles like dust',
  description:'The wolf lies still. Blood darkens the stone. The forest holds its breath, as if acknowledging what you\u2019ve done.',
  npcs:[],
  exits:{forward:{scene:'trail_end',label:"Trail's End",discovered:true},back:{scene:'post_spider',label:'The Silken Graveyard',discovered:true}},
  events:{onFirstVisit:null,onEnter(r){
    if(!r.ss.wolfSearch1)UI.addN('The wolf\u2019s den is littered with old supplies from less fortunate travelers.','f')},combat:null},
  actions:[{id:'search_wolf',label:'Search Den',desc:'Scattered supplies among the bones',condition(r){return!r.ss.wolfSearch1}}]},
trail_end:{name:"Trail's End",subtitle:'Where the forest breathes again',
  description:'The forest thins and the trail widens to a mossy clearing lit by dappled sunlight. A small stone shrine stands at the center, covered in climbing ivy.',
  npcs:['mira'],exits:{},
  events:{onFirstVisit:null,onEnter:null,combat:null},
  actions:[{id:'rest',label:'Rest Here',desc:'Your journey is complete',condition(r){return!!r.ss.mira}}]}
};

const DEATH_QUOTES=[
'"Not every path leads home."',
'"The trail remembers those who fall."',
'"Even the bravest meet their end in the mud."',
'"The forest takes what it is owed."',
'"Rest now. The trail goes on without you."',
'"The spider wraps another meal in silk."',
'"The wolves will feast tonight."',
'"Venom and fangs \u2014 the forest\u2019s welcome."'
];
