const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    toggleStealth: (shouldEnable) => ipcRenderer.invoke('toggle-stealth', shouldEnable),
    listModels: () => ipcRenderer.invoke('list-models'),
    askGemini: (data) => ipcRenderer.invoke('ask-gemini', data),
    getSessions: () => ipcRenderer.invoke('get-sessions'),
    saveSession: (session) => ipcRenderer.invoke('save-session', session),
    deleteSession: (sessionId) => ipcRenderer.invoke('delete-session', sessionId),
    clearAllSessions: () => ipcRenderer.invoke('clear-all-sessions'),
    captureScreen: () => ipcRenderer.invoke('capture-screen'),
    minimize: () => ipcRenderer.send('minimize-app'),
    closeApp: () => ipcRenderer.send('close-app'),
    getApiKey: () => ipcRenderer.invoke('get-api-key'),
    saveApiKey: (key) => ipcRenderer.invoke('save-api-key', key),
    clearApiKey: () => ipcRenderer.invoke('clear-api-key'),
});
