# 🎮 Flappy Ritu - Mobile Game

A fun Flappy Bird-style game with custom character animations and meme game-over screens!

## 🚀 Play Now

**[Click here to play!](https://flappy-game-spidy-nyx.vercel.app)** *(will be live after Vercel deployment)*

Or open `index.html` in your browser locally.

## ✨ Features

- 🏃‍♀️ Custom animated character with 3 sprite frames
- 📱 Mobile-friendly responsive design
- 🎵 Sound effects and background music
- 💀 Hilarious meme-based game over messages
- 🎨 Smooth particle effects and animations
- 💾 High score tracking (localStorage)
- 🎮 Touch and keyboard controls

## 🎯 How to Play

- **Desktop**: Press `SPACE` or click to jump
- **Mobile**: Tap the screen to jump
- Avoid the pipes and try to get the highest score!

## 🖼️ Images

All images are embedded as base64 strings - no external files needed!

- `player_run1.png` - First running animation frame
- `player_run2.png` - Second running animation frame
- `player_jump.png` - Jumping/hopping frame
- `meme.png` - Game over meme image

## 🔧 Customization

Want to use your own images?

1. Replace the PNG files in the `assets/` folder
2. Run: `python encode-to-js.py`
3. Refresh your browser

## 📁 Project Structure

```
flappy-game/
├── index.html          # Main game file
├── game.js             # Game logic
├── images-data.js      # Base64 encoded images (785KB)
├── style.css           # Styling
├── encode-to-js.py     # Script to convert images to base64
└── assets/             # Original image files
    ├── player_run1.png
    ├── player_run2.png
    ├── player_jump.png
    └── meme.png
```

## 🛠️ Technologies

- Pure JavaScript (no frameworks!)
- HTML5 Canvas
- Web Audio API
- CSS3 animations

## 📝 License

Feel free to use and modify this game!

## 🎮 Credits

Made with vengeance for Ritu 💀

---

**Enjoy the game!** 🎉
