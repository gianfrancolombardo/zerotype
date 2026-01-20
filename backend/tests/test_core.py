import unittest
from unittest.mock import MagicMock, patch
import sys
import os
import numpy as np

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from engine import AudioRecorder, Transcriber, InputSimulator

class TestAudioRecorder(unittest.TestCase):
    @patch('sounddevice.InputStream')
    def test_start_stop(self, mock_stream):
        recorder = AudioRecorder()
        recorder.start()
        self.assertTrue(recorder.recording)
        recorder.stop()
        self.assertFalse(recorder.recording)

class TestTranscriber(unittest.TestCase):
    @patch('engine.WhisperModel')
    def test_transcribe(self, mock_model_class):
        # Mock the model instance and its transcribe method
        mock_model_instance = MagicMock()
        mock_model_class.return_value = mock_model_instance
        
        # Mock return value of model.transcribe
        Segment = MagicMock()
        Segment.text = "Hello world"
        mock_model_instance.transcribe.return_value = ([Segment], None)

        transcriber = Transcriber(model_size="tiny", device="cpu")
        fake_audio = np.zeros(16000, dtype=np.float32)
        text = transcriber.transcribe(fake_audio)
        
        self.assertEqual(text, "Hello world")

class TestInputSimulator(unittest.TestCase):
    @patch('pyautogui.hotkey')
    @patch('pyperclip.copy')
    def test_type_text(self, mock_copy, mock_hotkey):
        sim = InputSimulator()
        sim.type_text("Test")
        
        mock_copy.assert_called_with("Test")
        mock_hotkey.assert_called_with('ctrl', 'v')

if __name__ == '__main__':
    unittest.main()
