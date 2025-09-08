// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('api', {
    getUsers: () => ipcRenderer.invoke('obtener-usuarios'),
    addUser: (user) => ipcRenderer.invoke('addUser', user),
    onUpdateUser: (callback) =>ipcRenderer.on('updatedUser', callback)
})