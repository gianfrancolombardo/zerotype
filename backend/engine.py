import os
import sys
import json
import time
import threading
import queue
import numpy as np
import sounddevice as sd
import keyboard
import pyperclip
import pyautogui
from faster_whisper import WhisperModel
from colorama import init, Fore

# Initialize colorama for debug output
init(autoreset=True)

class AudioRecorder:
    def __init__(self, sample_rate=16000):
        self.sample_rate = sample_rate
        self.recording = False
        self.audio_queue = queue.Queue()
        self.stream = None

    def callback(self, indata, frames, time, status):
        """Callback for sounddevice."""
        if status:
            print(f"Audio status: {status}", file=sys.stderr)
        if self.recording:
            self.audio_queue.put(indata.copy())

    def start(self):
        self.recording = True
        self.audio_queue = queue.Queue() # Clear queue
        self.stream = sd.InputStream(samplerate=self.sample_rate, channels=1, dtype='float32', callback=self.callback)
        self.stream.start()
        print_status("recording")

    def stop(self):
        self.recording = False
        if self.stream:
            self.stream.stop()
            self.stream.close()
            self.stream = None
        
        # Collect all audio chunks
        audio_data = []
        while not self.audio_queue.empty():
            audio_data.append(self.audio_queue.get())
        
        if not audio_data:
            return None
            
        return np.concatenate(audio_data, axis=0).flatten()

class Transcriber:
    def __init__(self, model_size="tiny", device="cpu", compute_type="int8"):
        # Check if the model is already downloaded to avoid unnecessary feedback
        # faster-whisper uses a cache directory, typically ~/.cache/huggingface/hub
        # We can perform a dry-run or check the cache directory
        import os
        cache_dir = os.path.expanduser(os.path.join("~", ".cache", "huggingface", "hub"))
        model_indicator = f"models--systran--faster-whisper-{model_size}"
        is_cached = os.path.exists(cache_dir) and any(model_indicator in d for d in os.listdir(cache_dir)) if os.path.exists(cache_dir) else False

        # We still print to stderr for logs
        self.model = WhisperModel(model_size, device=device, compute_type=compute_type)
        print("Model loaded.", file=sys.stderr)

    def transcribe(self, audio_data):
        print_status("transcribing")
        segments, info = self.model.transcribe(audio_data, beam_size=5)
        text = " ".join([segment.text for segment in segments]).strip()
        return text

class InputSimulator:
    def type_text(self, text):
        if not text:
            return
        
        # Method 1: Pyperclip + Ctrl+V (Fastest for long text)
        pyperclip.copy(text)
        # Small delay to ensure clipboard is ready
        time.sleep(0.1) 
        pyautogui.hotkey('ctrl', 'v')
        
def print_status(status, data=None):
    """Emit JSON status to stdout for Electron."""
    msg = {"status": status}
    if data:
        msg.update(data)
    print(json.dumps(msg))
    sys.stdout.flush()

class ConfigManager:
    def __init__(self, config_file=None):
        if config_file is None:
            # Try to find config in the project root or next to engine.py
            base_path = getattr(sys, '_MEIPASS', os.path.dirname(os.path.abspath(__file__)))
            # In dev, the config is usually in the frontend folder as well, but we'll use a consistent one in backend
            self.config_file = os.path.join(base_path, 'config.json')
        else:
            self.config_file = config_file
        self.config = self.load_config()

    def load_config(self):
        if os.path.exists(self.config_file):
            try:
                with open(self.config_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading config: {e}", file=sys.stderr)
        return {"hotkey": "f4", "model": "tiny"}

    def save_config(self, new_config):
        self.config.update(new_config)
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f)

    def get(self, key):
        return self.config.get(key)

class ZerotypeEngine:
    def __init__(self):
        self.config_manager = ConfigManager()
        self.hotkey = self.config_manager.get("hotkey")
        self.model_size = self.config_manager.get("model")
        
        self.recorder = AudioRecorder()
        self.transcriber = Transcriber(model_size=self.model_size)
        self.simulator = InputSimulator()
        self.running = True

        # Start stdin listener for config updates
        self.stdin_thread = threading.Thread(target=self.listen_stdin, daemon=True)
        self.stdin_thread.start()

    def listen_stdin(self):
        while self.running:
            try:
                line = sys.stdin.readline()
                if not line: break
                data = json.loads(line)
                if data.get('type') == 'config-update':
                    self.config_manager.save_config(data.get('data'))
            except:
                pass

    def run(self):
        print_status("idle")
        print(f"Ready. Hold {self.hotkey} to record.", file=sys.stderr)
        
        while self.running:
            # Simple polling or event-based logic
            # Using keyboard.wait is blocking, so we assume a loop or hooks.
            # Ideally, we want to detect Key DOWN and Key UP.
            
            event = keyboard.read_event()
            if event.name == self.hotkey:
                if event.event_type == 'down':
                    if not self.recorder.recording:
                        self.recorder.start()
                elif event.event_type == 'up':
                    if self.recorder.recording:
                        audio = self.recorder.stop()
                        self.process_audio(audio)
                        print_status("idle")

    def process_audio(self, audio):
        if audio is None or len(audio) == 0:
            return
        
        try:
            text = self.transcriber.transcribe(audio)
            if text:
                print(f"Transcribed: {text}", file=sys.stderr)
                self.simulator.type_text(text)
                print_status("done", {"text": text})
                time.sleep(1) # Show done state for a bit
            else:
                print_status("error", {"message": "No text detected"})
        except Exception as e:
            print(f"Error: {e}", file=sys.stderr)
            print_status("error", {"message": str(e)})

if __name__ == "__main__":
    engine = TypolessEngine()
    engine.run()
