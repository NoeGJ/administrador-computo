// preload.js (Use CommonJS syntax)

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    closeApp: () => ipcRenderer.send('close-main-window'),
    openDialog: () => ipcRenderer.send('open-dialog'),
    sendReport: (reportText) => ipcRenderer.invoke('send-report', reportText),
    renewSession: () => ipcRenderer.invoke('renew-session'),
    getFinalTime: () => ipcRenderer.invoke('get-final-time') 
});