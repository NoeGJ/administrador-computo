// dialog.js
const { ipcRenderer } = require('electron');

// Cerrar ventana al hacer clic en "Cancelar"
document.getElementById('js-close').addEventListener('click', () => {
  window.close();
});
