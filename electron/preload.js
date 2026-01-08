const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    toggleStealth: (shouldEnable) => ipcRenderer.invoke('toggle-stealth', shouldEnable),
    closeApp: () => ipcRenderer.send('close-app'),
});
