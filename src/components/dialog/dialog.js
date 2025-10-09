// dialog.js
const { ipcRenderer } = require('electron');

// Cerrar ventana al hacer clic en "Cancelar"
document.getElementById('js-close').addEventListener('click', () => {
  window.close();
});

// --- Utility for Status Feedback ---
function showStatus(message, isError = false) {
    const form = document.getElementById('report-form');
    // Remove any previous status message
    document.getElementById('status-feedback')?.remove(); 

    const statusDiv = document.createElement('div');
    statusDiv.id = 'status-feedback';
    statusDiv.textContent = message;
    statusDiv.style.cssText = `
        margin-top: 15px; 
        padding: 10px; 
        border-radius: 10px; 
        text-align: center; 
        font-size: 0.9rem;
        background-color: ${isError ? '#ef4444' : '#10b981'};
        color: white;
    `;
    form.appendChild(statusDiv);
}

// Manejar envío del formulario (Calls IPC to send report)
document.getElementById('report-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = document.getElementById('report').value.trim();
    const submitBtn = e.submitter; 

    if (!message) {
        showStatus('El mensaje no puede estar vacío.', true);
        return;
    }
    
    // Disable button while sending
    submitBtn.disabled = true;
    submitBtn.value = 'Enviando...';
    
    try {
        // Send the report via IPC to the main process
        const result = await ipcRenderer.invoke('send-report', message);

        if (result.success) {
            showStatus(result.message, false);
            // Wait briefly then close the window
            setTimeout(() => {
                window.close();
            }, 500);
        } else {
            showStatus(result.message, true);
        }

    } catch (error) {
        showStatus('Error de comunicación con el sistema. Intenta de nuevo.', true);
        console.error('Report submission error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.value = 'Enviar';
    }
});