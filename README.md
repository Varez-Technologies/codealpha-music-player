# 🎵 Nocturne Audio — Music Player
**CodeAlpha Internship | Task 4: Music Player using JavaScript**

---

## ✅ Requirements Checklist

| Requirement | Status |
|---|---|
| HTML interface for music player | ✅ Done |
| CSS styling | ✅ Done (Nocturne Audio design system) |
| Play / Pause control | ✅ Done |
| Next / Previous control | ✅ Done |
| Song title & artist display | ✅ Done |
| Duration display | ✅ Done |
| Progress bar (clickable) | ✅ Done |
| Volume control | ✅ Done |
| **BONUS:** Playlist | ✅ Done |
| **BONUS:** Autoplay next song | ✅ Done |
| **BONUS:** Shuffle mode | ✅ Done |
| **BONUS:** Repeat (One / All) | ✅ Done |
| **BONUS:** Search/filter songs | ✅ Done |
| **BONUS:** Keyboard shortcuts | ✅ Done |

---

## 📁 Project Structure

```
music_player/
├── index.html       ← Main HTML structure
├── style.css        ← All styling (Nocturne Audio design system)
├── script.js        ← All audio logic & interactivity
├── README.md        ← This file
└── songs/           ← Put your MP3 files here
    ├── song1.mp3
    ├── song2.mp3
    ├── song3.mp3
    ├── song4.mp3
    ├── song5.mp3
    └── covers/      ← Album art images (JPG/PNG)
        ├── cover1.jpg
        ├── cover2.jpg
        ├── cover3.jpg
        ├── cover4.jpg
        ├── cover5.jpg
        └── default.jpg  ← Fallback if cover not found
```

---

## 🚀 How to Run

1. Add your MP3 files → rename them `song1.mp3` through `song5.mp3`
2. Add album art JPGs → rename them `cover1.jpg` through `cover5.jpg`
3. Open `index.html` in any browser
4. Done! ✅

> **Note:** Songs must be served from a local server or same folder due to browser security. Just open the file directly — Chrome and Edge work fine.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `Space` | Play / Pause |
| `→` | Next song |
| `←` | Previous song |
| `↑` | Volume +10% |
| `↓` | Volume -10% |
| `M` | Mute / Unmute |

---

## 🎨 Design System

Based on **Nocturne Audio** design spec (Stitch AI):
- Font: Plus Jakarta Sans
- Primary accent: Electric Violet `#8B5CF6`
- Secondary accent: Electric Cyan `#38BDF8`
- Background: Deep void `#0B0B14`
- Glassmorphic panels with `backdrop-filter: blur(24px)`
