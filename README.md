# Zerotype (MVP)

Zerotype is a "Push-to-Talk" AI transcription tool for Windows. Hold **F4**, speak, and the text will be typed into your active application.

## 🚀 Features
- **Global Hotkey:** Hold `F4` to record anywhere.
- **Local AI:** Uses `faster-whisper` for high-accuracy, offline transcription.
- **Minimalist UI:** Unintrusive floating overlay.
- **Focus Preservation:** Does not steal focus from your active window (Word, Slack, VS Code, etc.).

## 🛠️ Installation

### Prerequisites
- **Node.js** (v16+)
- **Python** (3.10+)
- **Visual C++ Redistributable** (often required for Python audio libs)

### Setup

1.  **Clone the repository** (if applicable).
2.  **Install Frontend Dependencies**:
    ```bash
    cd frontend
    npm install
    ```
3.  **Install Backend Dependencies**:
    ```bash
    cd backend
    # Create virtual env (if not exists)
    python -m venv venv
    # Activate venv
    .\venv\Scripts\activate
    # Install libs
    pip install -r requirements.txt
    ```

## ▶️ Running the App

To run in Development mode (Hot-reload React + Python):

1.  Open a terminal in `frontend/`.
2.  Run:
    ```bash
    npm start
    ```
    *This will start Vite on port 5173 and launch Electron, which spawns the Python backend.*

**Note:** The first time you record, `faster-whisper` will download the AI model (approx 75MB). The UI might be stuck on "Thinking..." for a minute. Check the terminal for download progress.

## ⚠️ troubleshooting

### "No text detected"
- Ensure your microphone is set as the Default Input Device in Windows Settings.

### Hotkey not working
- Try running the terminal/app as **Administrator**. Global hotkeys sometimes need elevated privileges.

### Dependency Issues
- If `pyaudio` or `sounddevice` fails to install, you might need PortAudio. Usually, the wheels included in `pip` work fine on Windows.

## 🏗️ Architecture
- **Frontend:** Electron + React + Lucide Icons.
- **Backend:** Python + Faster-Whisper + PyAutoGUI.
- **Communication:** Standard IO (stdin/stdout).
