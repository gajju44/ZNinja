const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    toggleStealth: (shouldEnable) => ipcRenderer.invoke('toggle-stealth', shouldEnable),
    listModels: () => ipcRenderer.invoke('list-models'),
    askGemini: (data) => ipcRenderer.invoke('ask-gemini', data),
    getSessions: () => ipcRenderer.invoke('get-sessions'),
    saveSession: (session) => ipcRenderer.invoke('save-session', session),
    deleteSession: (sessionId) => ipcRenderer.invoke('delete-session', sessionId),
    clearAllSessions: () => ipcRenderer.invoke('clear-all-sessions'),
    closeApp: () => ipcRenderer.send('close-app'),
});
