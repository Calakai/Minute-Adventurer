# Minute Adventurer

A text-based dark fantasy adventure game built as a Progressive Web App. Quick sessions, persistent progress, plays entirely in your browser — online or offline.

## 🎮 Current Adventure: The Muddy Trail

A tutorial adventure featuring:
- Character creation with 3 species (Human, Elf, Orc) and 4 classes (Fighter, Paladin, Ranger, Rogue)
- Distance-based combat system (5m–30m range)
- NPC dialogues with Aldric the Gatekeeper and Mira the Healer
- Persistent journal, bestiary, and save system
- Roguelike structure — journal knowledge persists across runs

## 📱 Install as App

### iPhone / iPad
1. Open the game URL in Safari
2. Tap the **Share** button (square with arrow)
3. Tap **Add to Home Screen**
4. The game now launches fullscreen like a native app

### Android
1. Open the game URL in Chrome
2. Tap the **Install** banner or go to Menu → **Install app**

### Desktop
1. Open in Chrome/Edge
2. Click the install icon in the address bar

## 🛠 Technical Details

- Single-page PWA — HTML, CSS, JS all in one file
- Pixel art rendered via Canvas (no image dependencies)
- localStorage for saves (4 keys: `activeRun`, `manualSaves`, `quickSave`, `journalMeta`)
- Service worker for full offline support
- WCAG AAA accessibility: 7:1 contrast, keyboard nav, ARIA labels, 44px touch targets
- Mobile-first responsive layout, max-width 680px on desktop

## 📂 File Structure

```
minute-adventurer/
├── index.html          # The complete game
├── manifest.json       # PWA manifest
├── sw.js              # Service worker for offline
├── icons/
│   ├── icon-192.png
│   ├── icon-512.png
│   ├── icon-maskable-192.png
│   ├── icon-maskable-512.png
│   └── apple-touch-icon.png
└── README.md
```

## 🚀 Hosting

Deploy to any static host with HTTPS:
- **GitHub Pages**: Push this repo, enable Pages in Settings
- **Netlify**: Drag and drop the folder
- **Cloudflare Pages**: Connect the repo

The game also works by opening `index.html` directly as a local file (PWA install features require HTTPS hosting).

## License

Personal project by Caleb. All rights reserved.
