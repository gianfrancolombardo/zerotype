const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    onStatusUpdate: (callback) => ipcRenderer.on('status-update', (_event, value) => callback(value)),
    saveSettings: (settings) => ipcRenderer.send('save-settings', settings),
    getSettings: () => ipcRenderer.invoke('get-settings'),
    relaunchApp: () => ipcRenderer.send('relaunch-app'),
    quitApp: () => ipcRenderer.send('quit-app')
});
