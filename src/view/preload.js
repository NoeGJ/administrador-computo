// Se exponen las funciones que se usaran en el renderer
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('db', {
    testconn: (url, key) => ipcRenderer.invoke('connect-db', { url, key }),
    
})

