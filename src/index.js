import { app, BrowserWindow, dialog, screen } from "electron";
import electronSquirrelStartup from "electron-squirrel-startup";
import { fileURLToPath } from "node:url";
import path from "node:path";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "dotenv/config.js";
import { reporteChannel, userChannel } from "./db/channels.js";
import "./ipc/index.js";
import { hasCredentials } from "./config.js";
import { initSupabase, testConn } from "./db/connection.js";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

let mainWindow;
export let configWindow;
export const createWindow = () => {
  // Create the browser window.
  const { width, height } = screen.getPrimaryDisplay().size;

  mainWindow = new BrowserWindow({
    width: width,
    height: height,

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  mainWindow.maximize();

  mainWindow.removeMenu();
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

};

const createConfigWindow = () => {
    // Create the browser window.
  configWindow = new BrowserWindow({
    width: 500,
    height: 600,

    webPreferences: {
      preload: path.join(__dirname, "view","preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  configWindow.removeMenu();
  // and load the index.html of the app.
  configWindow.loadFile(path.join(__dirname, "/view/config.html"));

}

export async function startApp(){
  const hasCred = hasCredentials();

  if(hasCred){
    initSupabase();
    const isConn = await testConn();
    createWindow();
    
    if(isConn.ok){
       // Inicializa los canales por donde recibira datos de la DB
      userChannel(mainWindow);
      reporteChannel(mainWindow);
    }
    else {
      dialog.showErrorBox("Error de conexion", "No se pudo acceder a la base de datos");
      mainWindow.close();
    }

    } 
  else
    createConfigWindow();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(startApp);

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
