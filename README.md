# 🥷 ZNinja - Service Host Runtime (v2.0.0)

The ultimate stealth assistant. Designed to be invisible to monitoring software and seamless to use without ever leaving your browser.

---

## 🚀 Key Features

### 1. 🌑 Stealth Mode (Ninja Mode)
**Visual:** `[ 🥷 Stealth ON ]` (Emerald Button)
- **What it does:** Makes the app completely invisible to screen recordings, Zoom, OBS, and proctoring software.
- **Why use it:** You can see the AI, but they can't.

### 2. 👻 Ghost Mode (Focus Lock)
**Visual:** `[ 🤍 Ghost ON ]` (Indigo Button)
- **Shortcut:** `Ctrl + L`
- **What it does:** Makes the window "click-through." You can click on the buttons in ZNinja, but the computer thinks you never left your browser.
- **Why use it:** Prevents "Tab Changed" or "App Switched" alerts on exam websites.

### 3. ⌨️ Ghost Typing (Background Input)
**Visual:** `[ ⌨️ Type ON ]` (Amber Button)
- **How it works:** When Ghost Mode is ON, this button appears.
- **Action:** Click anywhere else (like your browser's search bar) and start typing. Your text will appear in ZNinja automatically.
- **Why use it:** Input questions into the AI without the AI window ever getting "Focus."

### 4. 📸 Instant AI
- **Shortcut:** `Ctrl + I`
- **What it does:** Takes a silent screenshot and sends it to the AI along with your current text. 
- **Easy Flow:** Type a question -> `Ctrl + I` -> Get answer.

### 5. 📋 Clipboard Sync
- **What it does:** Anything you copy (`Ctrl + C`) anywhere on your computer is automatically pasted into ZNinja's input box.

---

## 🛠️ Advanced Stealth (Windows Only)

- **Task Manager Hiding:** The app never appears in the "Apps" list. It stays hidden in **"Background processes"** as `Service Host Runtime`.
- **Taskbar Stealth:** No icon appears on the taskbar. 
- **Silent Resizer:** Resize the window by dragging the bottom-right corner. The cursor **will not change** to the resize symbol (total stealth).

---

## 📦 How to Use

1. **Setup:** Add your Gemini API Key in the `.env` file (`VITE_GEMINI=your_key`).
2. **Launch:** Run `npm run dev`.
3. **Show/Hide:** Use `Ctrl + ]` to instantly show or hide the entire window.
4. **Resizing:** Look for the tiny lines at the bottom-right corner to drag and resize.

---

## 💻 Tech Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** Electron (Node.js)
- **Native:** Windows API (koffi) for stealth affinity and global key monitoring.

---
*Powered by Cinfinite | Developed by gajju44*
