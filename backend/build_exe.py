import PyInstaller.__main__
import os

# Define the path to the main script
main_script = os.path.join(os.path.dirname(__file__), 'main.py')

PyInstaller.__main__.run([
    main_script,
    '--name=zerotype_engine',
    '--onedir',
    '--clean',
    '--noconsole',  # Hide console window
    # Add hidden imports if necessary
    '--hidden-import=engine',
    '--hidden-import=faster_whisper',
    # Ensure config is copied if needed, or we rely on it being external
    # '--add-data=config.json;.' 
])
