# Minute Adventurer

A text-based dark fantasy adventure game built as a Progressive Web App. Quick sessions, persistent progress, plays entirely in your browser — online or offline.

## Play

**[Play on GitHub Pages](https://calakai.github.io/Minute-Adventurer/)** — works on mobile, tablet, and desktop.

## Features

### Character Creation
- **5 Species**: Human, Elf, Orc, Dwarf, Halfling — each with unique base stats and racial traits
- **Subspecies**: Elves, Orcs, Dwarves, and Halflings each have two subspecies with distinct abilities
- **6 Classes**: Fighter, Paladin, Ranger, Rogue, Wizard, Berserker — each with 3 unlockable abilities and unique starting gear
- **8-Stat System**: Health, Mana, Melee, Ranged, Speech, Sight, Smarts, Movement

### Combat
- 2.5D turn-based combat with pixel art sprites and battle renderer
- Distance-based mechanics (melee/ranged range system)
- Class abilities with mana costs and level unlocks
- Status effects: poison, burn, stun, and more
- Equipment weight classes (Light, Medium, Heavy)

### World
- **43 scenes** across multiple adventure zones
- **39 enemies** across 5 tiers with unique pixel art sprites (16x16 for Tiers 1–4, 24x24 for Tier 5 bosses)
- **17 NPCs** with branching dialogue trees and shops
- **48 items**: weapons, armor, consumables, spellbooks, and more
- **25 bounties** and **17 quests**
- Gold economy with NPC shops

### Progression
- Persistent journal and bestiary across runs
- Manual saves, quicksave, and autosave
- 24 unique death quotes
- Roguelike structure — knowledge persists, characters don't

## Install as App

### iPhone / iPad
1. Open the game URL in Safari
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**

### Android
1. Open the game URL in Chrome
2. Tap the **Install** banner or go to Menu > **Install app**

### Desktop
1. Open in Chrome/Edge
2. Click the install icon in the address bar

## Technical Details

- Single-page PWA — HTML, CSS, and JS in one file plus a data module
- All pixel art rendered via Canvas at runtime (zero image dependencies for game art)
- localStorage for saves (`activeRun`, `manualSaves`, `quickSave`, `journalMeta`)
- Service worker for full offline support
- WCAG AAA accessibility: 7:1 contrast, keyboard nav, ARIA labels, 44px touch targets
- Mobile-first responsive layout

## File Structure

```
Minute-Adventurer/
├── index.html              # Complete game engine (2660 lines)
├── data.js                 # Game data: enemies, items, NPCs, scenes, quests, bounties
├── enemy-sprites.js        # Pixel art sprite definitions (reference/backup)
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker for offline play
├── validate.js             # Data integrity checker (node validate.js)
├── smoke-test.js           # Headless playthrough test (node smoke-test.js)
├── apple-touch-icon.png    # iOS home screen icon
├── icon-192.png            # PWA icon 192x192
├── icon-512.png            # PWA icon 512x512
├── icon-maskable-192.png   # Maskable PWA icon 192x192
├── icon-maskable-512.png   # Maskable PWA icon 512x512
└── README.md
```

## Hosting

Deploy to any static host with HTTPS:
- **GitHub Pages**: Push this repo, enable Pages in Settings
- **Netlify**: Drag and drop the folder
- **Cloudflare Pages**: Connect the repo

The game also works by opening `index.html` directly as a local file (PWA install requires HTTPS).

## License

Personal project by Caleb. All rights reserved.
