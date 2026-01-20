import os
import json
import unittest
import sys

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from engine import ConfigManager

class TestConfigManager(unittest.TestCase):
    def setUp(self):
        self.config_path = 'test_config.json'
        if os.path.exists(self.config_path):
            os.remove(self.config_path)
        self.cm = ConfigManager(self.config_path)

    def tearDown(self):
        if os.path.exists(self.config_path):
            os.remove(self.config_path)

    def test_default_config(self):
        config = self.cm.get_config()
        self.assertEqual(config['hotkey'], 'f4')
        self.assertEqual(config['model'], 'tiny')

    def test_update_config(self):
        self.cm.update_config({'hotkey': 'f5', 'model': 'base'})
        config = self.cm.get_config()
        self.assertEqual(config['hotkey'], 'f5')
        self.assertEqual(config['model'], 'base')
        
        # Verify persistence
        with open(self.config_path, 'r') as f:
            data = json.load(f)
            self.assertEqual(data['hotkey'], 'f5')

if __name__ == '__main__':
    unittest.main()
