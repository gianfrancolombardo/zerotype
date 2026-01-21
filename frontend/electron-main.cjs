const { app, BrowserWindow, ipcMain, screen, Tray, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let pythonProcess;
let tray;
let settingsWindow;

const fs = require('fs');

// Log errors to a file for debugging production issues
const logPath = path.join(app.getPath('userData'), 'crash-log.txt');
function log(msg) {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`);
}

log('App starting...');
process.on('uncaughtException', (error) => {
    log(`Uncaught Exception: ${error.stack || error}`);
});


ipcMain.on('save-settings', (event, settings) => {
    console.log('Saving settings:', settings);
    if (pythonProcess) {
        pythonProcess.stdin.write(JSON.stringify({ type: 'config-update', data: settings }) + '\n');
    }
});

ipcMain.handle('get-settings', async () => {
    const targetPath = path.join(__dirname, '../backend/config.json');

    try {
        if (fs.existsSync(targetPath)) {
            const data = fs.readFileSync(targetPath, 'utf8');
            return JSON.parse(data);
        }
    } catch (e) {
        log(`Failed to load settings: ${e}`);
        console.error("Failed to read config:", e);
    }
    return { hotkey: 'f4', model: 'tiny' };
});

ipcMain.on('relaunch-app', () => {
    app.relaunch({ args: process.argv.slice(1).concat(['--relaunch-settings']) });
    app.exit(0);
});

ipcMain.on('quit-app', () => {
    app.quit();
});

function createWindow() {
    const isRelaunch = process.argv.includes('--relaunch-settings');
    if (isRelaunch) {
        // If we relaunch, we might want to show the settings window immediately
        setTimeout(() => createSettingsWindow(), 500);
    }
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    const windowWidth = 300;
    const windowHeight = 300;

    mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        x: Math.floor((width - windowWidth) / 2), // Horizontal center
        y: height - windowHeight - 50, // Bottom center with more margin
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        focusable: false,
        skipTaskbar: true,
        show: false, // Start hidden
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }

    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log(`Main window failed to load: ${errorDescription} (${errorCode})`);
    });

    mainWindow.once('ready-to-show', () => {
        log('Main window ready to show');
        // mainWindow.show(); // It starts hidden by design
    });

    mainWindow.setIgnoreMouseEvents(true, { forward: true });
}

function createSettingsWindow() {
    if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.show();
        settingsWindow.focus();
        return;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

    settingsWindow = new BrowserWindow({
        width: 480,
        height: 450,
        title: 'Zerotype Settings',
        icon: path.join(__dirname, 'assets', 'icon.png'),
        frame: false,
        transparent: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    settingsWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
        log(`Settings window failed to load: ${errorDescription} (${errorCode})`);
    });

    settingsWindow.once('ready-to-show', () => {
        log('Settings window ready to show');
        settingsWindow.show();
    });

    const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');
    if (isDev) {
        settingsWindow.loadURL('http://localhost:5173/#settings');
    } else {
        settingsWindow.loadFile(path.join(__dirname, 'dist', 'index.html'), { hash: 'settings' });
    }
}

function createTray() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    tray = new Tray(iconPath);
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Mostrar Aplicación', click: () => {
                if (mainWindow) {
                    mainWindow.show();
                    mainWindow.focus();
                }
            }
        },
        { label: 'Ajustes', click: () => createSettingsWindow() },
        { type: 'separator' },
        {
            label: 'Salir de Zerotype', click: () => {
                if (pythonProcess) pythonProcess.kill();
                app.quit();
            }
        }
    ]);
    tray.setToolTip('Zerotype - Pulsar para Hablar');
    tray.setContextMenu(contextMenu);

    // Open settings on click for easier access
    tray.on('click', () => createSettingsWindow());
}

function startPythonBackend() {
    const isDev = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

    let scriptPath;
    let pythonPath;

    if (isDev) {
        scriptPath = path.join(__dirname, '../backend/main.py');
        pythonPath = path.join(__dirname, '../backend/venv/Scripts/python.exe');
        pythonProcess = spawn(pythonPath, [scriptPath]);
    } else {
        // In production, use the compiled executable
        const exePath = path.join(process.resourcesPath, 'zerotype_engine', 'zerotype_engine.exe');
        pythonProcess = spawn(exePath);
    }

    pythonProcess.stdout.on('data', (data) => {
        const lines = data.toString().split('\n');
        lines.forEach((line) => {
            if (!line.trim()) return;
            try {
                const message = JSON.parse(line);

                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send('status-update', message);

                    // Visibility Logic
                    if (message.status === 'idle') {
                        mainWindow.hide();
                    } else if (message.status === 'downloading_model' || message.status === 'model_ready' || message.status === 'loading_model') {
                        // Users asked to remove feedback, stay hidden
                        mainWindow.hide();
                    } else {
                        // Show for recording, transcribing, error, done
                        mainWindow.show();
                    }
                }
            } catch (e) {
                console.error('Failed to parse JSON from Python:', line);
            }
        });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Python Error: ${data}`);
    });

    pythonProcess.on('error', (err) => {
        log(`Failed to start Python process: ${err}`);
    });

    pythonProcess.on('close', (code) => {
        log(`Python process exited with code ${code}`);
        console.log(`Python process exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    createWindow();
    createTray();
    startPythonBackend();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        if (pythonProcess) pythonProcess.kill();
        app.quit();
    }
});

app.on('will-quit', () => {
    if (pythonProcess) pythonProcess.kill();
});
