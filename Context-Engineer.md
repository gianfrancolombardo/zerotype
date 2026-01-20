# PROJECT SPECIFICATION: "Typoless" (MVP)

## 1. ROLE & OBJECTIVE
You are an expert Full Stack System Architect specializing in Desktop Applications using Electron and Python. 
Your goal is to build an MVP for a "Push-to-Talk" Windows application named "Typoless".

**Core Concept:** The user holds a specific key (e.g., F4), speaks, and upon releasing the key, the audio is transcribed locally using Whisper and the text is automatically pasted into whichever application has the focus (Word, Chrome, Slack, etc.).

## 2. TECH STACK (Option A - Hybrid)
* **Frontend (UI):** Electron (using React or plain HTML/JS). Minimalist usage.
* **Backend (Logic):** Python 3.10+.
* **AI Model:** `faster-whisper` (running on Python).
* **Communication:** `python-shell` (Node.js) or standard `stdio` (stdin/stdout) to bridge Electron and Python.
* **OS:** Windows 10/11.

## 3. ARCHITECTURE & RESPONSIBILITIES

### A. Python Process (The "Brain") - `backend/main.py`
Since Electron's global shortcuts are limited for "Push-to-Talk" (hold/release) mechanics, Python will handle the low-level heavy lifting.
1.  **Global Hotkey Hook:** Uses the `keyboard` library to detect `KEY_DOWN` (Start Recording) and `KEY_UP` (Stop Recording).
2.  **Audio Capture:** Uses `sounddevice` and `numpy` to record audio into memory (RAM) while the key is held.
3.  **Transcribing:** Uses `faster-whisper` (loaded on startup) to convert audio to text immediately after key release.
4.  **IPC Signals:** Sends JSON messages to Electron via `stdout` (e.g., `{"status": "recording"}`, `{"status": "transcribing"}`).
5.  **Text Injection:** Uses `pyperclip` to copy text and `pyautogui` to simulate `Ctrl+V`.

### B. Electron Process (The "Face") - `main.js` / `renderer.js`
1.  **Overlay Window:** A small, transparent, frameless window positioned in the center or bottom-center of the screen.
2.  **Focus Management:** The window must be `alwaysOnTop` but **must not accept focus** (`focusable: false` or similar technique) to ensure the user's cursor remains in their target app (e.g., Word).
3.  **Visual Feedback:**
    * *State Idle:* Window is hidden or invisible.
    * *State Recording:* Shows a pulsing red microphone/waveform.
    * *State Processing:* Shows a loading spinner.
    * *State Done:* Shows a quick "Checkmark" then fades out.

## 4. CRITICAL CHALLENGES & SOLUTIONS

### Challenge 1: Focus Stealing
* **Problem:** If the Electron UI appears, it might steal keyboard focus, causing the pasted text to go nowhere or into the Electron app itself.
* **Solution:** The Electron window must be instantiated with `{ focusable: false, type: 'toolbar' }` (or similar Windows flags) so it floats visually but the OS considers the focus to be on the previous app.

### Challenge 2: Latency
* **Solution:** The Whisper model must be pre-loaded in Python when the app starts, not when the key is pressed. The `keyboard` hook must be non-blocking.

### Challenge 3: Hotkey Logic
* **Logic:**
    * User presses F4 -> Python detects `down`. Python sends `{"status": "recording"}` to Electron. Audio buffer starts.
    * User releases F4 -> Python detects `up`. Python sends `{"status": "processing"}` to Electron. Audio stream stops.
    * Python transcribes -> text generated.
    * Python performs `pyperclip.copy(text)` -> `pyautogui.hotkey('ctrl', 'v')`.
    * Python sends `{"status": "idle"}` to Electron.

## 5. MVP REQUIREMENTS (Step-by-Step Implementation Plan)

### Step 1: Python Backend Setup
Create a script that runs a loop:
* Load `faster-whisper` (model: "tiny" or "base" for MVP speed).
* Listen for F4 (configurable var).
* On Press: Record.
* On Release: Transcribe & Print JSON to stdout.

### Step 2: Electron Setup
* Spawn the Python script using `child_process.spawn`.
* Listen to `stdout` data lines.
* Parse JSON and update React state.

### Step 3: Injection Logic
* Implement the clipboard paste mechanism in Python.
* Ensure special characters (UTF-8) are handled correctly.

## 6. DELIVERABLES
Generate the code structure and the key files:
1.  `backend/engine.py` (The Python Logic).
2.  `main.js` (Electron Entry point with window configuration).
3.  `preload.js` / `renderer.js` (UI updates).
4.  `requirements.txt` and `package.json`.

**Constraint:** Keep code simple. No complex state management (Redux) for the frontend, just basic React or Vanilla JS.