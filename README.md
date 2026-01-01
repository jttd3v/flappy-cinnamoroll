# 🐰 Cinnamoroll Learning Games

A collection of fun educational games featuring Cinnamoroll and friends!

## 🚀 Quick Start

### Option 1: Double-Click Launcher (Recommended)

1. **Double-click `start-games.bat`** in the project folder
2. The game launcher will automatically open in your browser
3. Play any game!

### Option 2: Manual Server Start

Open a terminal in the project folder and run:

```powershell
# Windows PowerShell
python -m http.server 8080
```

Then open your browser to: **http://localhost:8080/launcher.html**

---

## 🎮 Available Games

| Game | Description | Server Required |
|------|-------------|-----------------|
| 🍬 Candy Shop | Practice math & making change | ❌ No |
| 🧠 Memory Match | Card matching memory game | ❌ No |
| ⭐ Star Counter | Counting practice | ❌ No |
| 🌈 Pattern Rainbow | Pattern recognition | ❌ No |
| ❓ Quiz Quest | Trivia questions | ✅ Yes |
| 🧩 Puzzle Path | Logic puzzles | ✅ Yes |
| 📖 Story Cloud | Interactive stories | ✅ Yes |
| 💭 Dream Journal | Creative writing | ❌ No |
| ☁️ Cloud Kingdom | Adventure game | ❌ No |
| 💼 Career Clouds | Career exploration | ❌ No |

---

## 📁 Project Structure

```
flappy-cinnamoroll/
├── launcher.html          # Main game launcher
├── start-games.bat        # Auto-start script (Windows)
├── games/                 # Individual game folders
│   ├── candy-shop/
│   ├── quiz-quest/
│   └── ...
├── shared-assets/         # Shared CSS, JS, images
└── README.md              # This file
```

---

## 🔧 Troubleshooting

### "Python is not recognized"
Install Python from https://python.org and ensure it's added to PATH.

### Games not loading properly
Make sure you're accessing via `http://localhost:8080` and NOT opening files directly (file:// protocol).

### Port already in use
Change the port number:
```powershell
python -m http.server 3000
```
Then visit http://localhost:3000/launcher.html

---

## 👨‍👩‍👧‍👦 For Parents & Teachers

These games are designed to be:
- **Age-appropriate** - Difficulty adjusts based on player age
- **Educational** - Covers math, reading, memory, and problem-solving
- **Safe** - No external connections, all data stored locally
- **Fun** - Cute Sanrio-themed characters and rewards

---

Made with 💖 for learning and fun!
