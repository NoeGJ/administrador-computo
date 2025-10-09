// renderer.js

let countdownInterval;
let finalTime = null; // Stores the session end timestamp

// Utility function to format milliseconds into HH:MM:SS
function formatTime(ms) {
    if (ms <= 0) {
        return "00:00:00";
    }
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = num => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

// Countdown loop - runs every second
function updateClock() {
    if (finalTime === null) {
        // Should only happen right at startup before initializeTimer runs
        document.getElementById('clock').textContent = 'Loading...';
        return;
    }

    const now = new Date().getTime();
    const remainingTime = finalTime - now;

    const formattedTime = formatTime(remainingTime);
    document.getElementById('clock').textContent = formattedTime;

    if (remainingTime <= 0) {
        // Stop the countdown and visually indicate the session has expired
        clearInterval(countdownInterval);
        document.getElementById('clock').textContent = 'SESSION ENDED';
        document.getElementById('clock').style.color = '#ef4444'; // Red color
    } else {
        document.getElementById('clock').style.color = 'var(--text)'; // Normal color
    }
}

// Function to start or restart the countdown
function startCountdown() {
    // Clear any existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    // Start the new interval
    countdownInterval = setInterval(updateClock, 1000);
    updateClock(); // Initial update to avoid 1-second delay
}

// Main initialization function - Fetches time from the main process
async function initializeTimer() {
    const clockElement = document.getElementById('clock');
    clockElement.textContent = 'Cargando sesión...';
    
    // Check if the API bridge exists
    if (window.api && window.api.getFinalTime) {
        try {
            const result = await window.api.getFinalTime();
            
            if (result.success && result.finalTime) {
                // SUCCESS: Store the final time and start the timer
                finalTime = new Date(result.finalTime).getTime(); 
                startCountdown();
            } else {
                // FAILURE: Display the specific message returned from index.js
                const errorMessage = result.message || 'Error desconocido al cargar sesión.';
                clockElement.textContent = `ERROR: ${errorMessage}`;
                console.error('Failed to load final time from Supabase:', errorMessage);
            }
        } catch (e) {
            // IPC FAILURE: Error reaching the main process
            clockElement.textContent = 'ERROR: Comunicación IPC fallida.';
            console.error('IPC Error fetching final time:', e);
        }
    } else {
         // PRELOAD FAILURE: window.api wasn't set up correctly
         clockElement.textContent = 'ERROR: API de Electron no disponible.';
         console.error('Preload API not exposed.');
    }
}

// --- BUTTON LOGIC HANDLER ---
const setupButtonListeners = () => {
    // Renovar/Renew Button (Calls IPC for Supabase renewal)
    document.getElementById('pauseBtn').addEventListener('click', async () => {
        const renewBtn = document.getElementById('pauseBtn');
        renewBtn.disabled = true;
        renewBtn.textContent = 'Renovando...';
        
        if (window.api && window.api.renewSession) {
            const result = await window.api.renewSession();
            
            if (result.success) {
                renewBtn.textContent = 'Renovado!';
                // IMMEDIATELY update the countdown with the new time from the server
                finalTime = new Date(result.newTime).getTime();
                startCountdown();
            } else {
                console.error("Renewal failed:", result.message);
                renewBtn.textContent = `Error! (${result.message.substring(0, 10)}...)`;
            }

        } else {
            renewBtn.textContent = 'Error API';
        }

        // Re-enable the button and reset text after a short delay
        setTimeout(() => {
            renewBtn.textContent = 'Renovar';
            renewBtn.disabled = false;
        }, 1500);
    });

    // Reportar/Show Dialog Button 
    document.getElementById('show-dialog').addEventListener('click', () => {
        if (window.api && window.api.openDialog) {
            window.api.openDialog();
        }
    });

    // Salir/Close Button 
    document.getElementById('closeBtn').addEventListener('click', () => {
        if (window.api && window.api.closeApp) {
            window.api.closeApp(); 
        }
    });
};


// Start the timer and set up all event listeners ONLY after the DOM is fully loaded.
window.addEventListener('DOMContentLoaded', () => {
    initializeTimer();
    setupButtonListeners();
});