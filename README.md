Zerotype is a **blazing fast**, "Push-to-Talk" AI transcription tool for Windows. Hold **F4**, speak, and the text will be typed into your active application instantly.

## 🛡️ Maximum Privacy & Security
- **100% Core Local:** All transcription happens on your machine.
- **Zero Data Harvesting:** No audio or text is ever saved, logged, or sent to external servers.
- **Proven Privacy:** Your voice stays your own. No clouds, no APIs, no tracking.

## 🚀 Key Features
- **Global Hotkey:** Hold `F4` (or your [custom hotkey](#-configuration)) to record anywhere.
- **High Speed:** Powered by `faster-whisper` for near-instant transcription.
- **Fully Configurable:** Easily change the trigger key and AI model size for your needs.
- **Focus Preservation:** Does not steal focus from your active window (Word, Slack, VS Code, etc.).

## ⚙️ Configuration
You can customize the behavior in `backend/config.json`:
```json
{
  "hotkey": "f4",
  "model": "tiny"
}
```
*   **hotkey**: Any key supported by the `keyboard` library.
*   **model**: `tiny`, `base`, `small`, `medium`, or `large-v3` (Note: larger models are more accurate but slower and require more RAM/VRAM).


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
