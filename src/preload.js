// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts


// Se exponen las funciones que se usaran en el renderer
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld('api', {
    addUser: (user) => ipcRenderer.invoke('addUser', user),    
    fetchUsers: () => ipcRenderer.invoke('fetch-users'),
    onUserChanged: (callback) => {
        ipcRenderer.on('user-changed', (event, payload) => {
            callback(payload)
        })
    },
    addTime: (seconds, idTimer) => ipcRenderer.send('date-updated', seconds, idTimer),
    finishTime: (code, id_equipo) => ipcRenderer.send('finish', code, id_equipo),
    sendReport: ( code, id_equipo, text) => ipcRenderer.send('newReport', code, id_equipo, text),
    fetchReportes: () => ipcRenderer.invoke('fetch-reportes'),
    onReporteChanged: (callback) => {
      ipcRenderer.on('reporte-changed', (event, payload) => {
          callback(payload)
      })
    }
})

