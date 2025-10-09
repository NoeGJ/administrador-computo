import { app, BrowserWindow, screen, ipcMain } from "electron";
import squirrelStartup from 'electron-squirrel-startup';
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js"; 
// Note: Node.js built-in fetch is available in modern Electron/Node versions.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "dotenv/config.js";

// ----------------------------------------------------------------------------------
// FIX: Aggressive security flags are necessary to bypass internal Node network blocks.
app.commandLine.appendSwitch('ignore-certificate-errors'); 
app.commandLine.appendSwitch('allow-insecure-localhost', 'true');
app.commandLine.appendSwitch('no-sandbox'); 
// ----------------------------------------------------------------------------------

// --- SUPABASE CONFIGURATION ---
const SUPABASE_URL = 'http://192.168.1.127:54321'; 
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- CONSTANTS ---
const renewalDuration = 2 * 60 * 60 * 1000; // 2 hours in ms
const maxduration = 8 * 60 * 60 * 1000; // 8 hours in ms

// DUMMY IDs: REPLACE THESE WITH YOUR ACTIVE SESSION LOGIC!
const DUMMY_USER_SESSION_ID = 31; 
const DUMMY_EQUIPO_ID = 24; 
// -----------------------------------------------------

let mainWindow;
let dialogWindow;

if (squirrelStartup) {
  app.quit();
}

/**
 * Diagnostic function: Bypasses the Supabase client and tests a raw fetch to a specific API path.
 */
async function testExternalConnection() {
    const apiPath = `/rest/v1/users?id=eq.${DUMMY_USER_SESSION_ID}&select=finalTime`;
    const fullUrl = `${SUPABASE_URL}${apiPath}`;

    try {
        console.log(`[DIAGNOSTIC] Attempting raw fetch to: ${fullUrl}`);
        
        // This request mimics what the Supabase client does internally
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.status === 200 || response.status === 204) {
             console.log(`[DIAGNOSTIC] ✅ RAW FETCH SUCCESS! Status: ${response.status}. Connection is fully working.`);
             return true;
        } else if (response.status === 404 || response.status === 400 || response.status === 401) {
             console.log(`[DIAGNOSTIC] ⚠️ RAW FETCH RESPONDED! Status: ${response.status}. This means the network is fine, but the DB key, table name, or ID is likely wrong.`);
             // Log the actual response text to help debug the 4xx error
             try {
                const errorText = await response.text();
                console.error(`[DIAGNOSTIC] Server Response Body: ${errorText.substring(0, 200)}`);
             } catch (e) {
                 console.error('[DIAGNOSTIC] Could not read response body.');
             }
             return true;
        } else {
            console.warn(`[DIAGNOSTIC] ⚠️ RAW FETCH FAILED! Status: ${response.status}. Still receiving an unexpected status code.`);
            return false;
        }
    } catch (e) {
        // If this catches, it's a true, low-level network failure despite all efforts.
        console.error(`[DIAGNOSTIC] ❌ CRITICAL RAW FETCH FAILURE: ${e.message}. This is an internal Node.js network block.`);
        return false;
    }
}


const createWindow = () => {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 300,
    height: 200,
    x: width - 310, 
    y: 20,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    movable: false,             
    skipTaskbar: true,          
    focusable: false,           
    fullscreenable: false,
    hasShadow: false,
    webPreferences: {
        preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.webContents.openDevTools({ mode: 'detach' }); 
}

function showDialog() {
    if (dialogWindow && !dialogWindow.isDestroyed()) {
        dialogWindow.focus();
        return;
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    dialogWindow = new BrowserWindow({
    width: 480,
    height: 360,
    x: Math.round((width - 480) / 2),
    y: Math.round((height - 360) / 2),
    frame: false, 
    transparent: false, 
    alwaysOnTop: true,  
    resizable: false,
    parent: mainWindow, 
    modal: true, 
    webPreferences: {
      nodeIntegration: true, 
      contextIsolation: false, 
    }
  });
  dialogWindow.loadFile(path.join(__dirname, "components/dialog/dialog.html")); 
  dialogWindow.webContents.openDevTools({ mode: 'detach' }); 
  
  dialogWindow.on('closed', () => {
      dialogWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow()
  testExternalConnection(); // Run diagnostic test immediately

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// --- IPC EVENT HANDLERS ---

// NEW HANDLER: Fetches the current finalTime for the renderer to start the countdown.
ipcMain.handle('get-final-time', async () => {
    // Uses DUMMY_USER_SESSION_ID = 31
    try {
        const { data: session, error: fetchError } = await supabase
            .from('users')
            .select('finalTime')
            .eq('id', DUMMY_USER_SESSION_ID)
            .single();

        if (fetchError || !session) {
            // Return specific error if the ID doesn't exist or fetch fails
            return { success: false, finalTime: null, message: fetchError?.message || "Session not found." };
        }
        
        // Return the finalTime string
        return { success: true, finalTime: session.finalTime };

    } catch (e) {
        // The error here is likely a database/route error, not a network error.
        console.error('Fetch Final Time Error (Supabase route issue suspected):', e);
        
        let userMessage = e.message;
        if (e.message.includes('fetch failed')) {
            userMessage = `Network Error: Connection established, but fetch failed. Double-check your Supabase URL format or API versioning.`;
        }

        return { success: false, finalTime: null, message: userMessage };
    }
});


// Closes the application
ipcMain.on('close-main-window', () => {
    if (mainWindow) {
        app.quit();
    }
});

// Opens the dialog window
ipcMain.on('open-dialog', () => {
    showDialog();
});

// HANDLER FOR RENOVAR BUTTON: Renews the finalTime in the 'users' table.
ipcMain.handle('renew-session', async (event) => {
    try {
        // 1. Fetch the current finalTime from the active session
        const { data: session, error: fetchError } = await supabase
            .from('users')
            .select('finalTime')
            .eq('id', DUMMY_USER_SESSION_ID) 
            .single();

        if (fetchError || !session) {
            throw new Error(`Session not found or error fetching time: ${fetchError?.message}`);
        }

        const now = new Date().getTime();
        const currentEndTime = new Date(session.finalTime).getTime();
        
        // Renewal calculation
        const effectiveStartTime = Math.max(now, currentEndTime);
        const newEndTime = Math.min(effectiveStartTime + renewalDuration, now + maxduration);
        const finalTimeISO = new Date(newEndTime).toISOString();

        // 2. Update the finalTime in the database
        const { error: updateError } = await supabase
            .from('users')
            .update({"finalTime": finalTimeISO})
            .eq('id', DUMMY_USER_SESSION_ID);

        if (updateError) {
            throw new Error(`Error updating DB time: ${updateError.message}`);
        }

        // Return the new final time so the renderer can update the countdown immediately
        return { success: true, newTime: finalTimeISO };

    } catch (e) {
        console.error('Renewal Error:', e);
        return { success: false, message: e.message };
    }
});


// HANDLER FOR REPORTAR BUTTON: Inserts a new row into the 'reportes' table.
ipcMain.handle('send-report', async (event, reportText) => {
    try {
        const { error } = await supabase
            .from('reportes')
            .insert([
                {
                    description: `Reporte desde Reloj App: ${reportText}`,
                    id_user: DUMMY_USER_SESSION_ID,
                    id_equipo: DUMMY_EQUIPO_ID,
                }
            ]);

        if (error) {
            console.error('Supabase Report Error:', error.message);
            return { success: false, message: `Error al enviar: ${error.message}` };
        }
        
        return { success: true, message: 'Reporte enviado con éxito.' };

    } catch (e) {
        console.error('General Report Submission Error:', e);
        return { success: false, message: `Error al enviar el reporte: ${e.message}` };
    }
});
