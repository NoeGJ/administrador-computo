import { app, BrowserWindow, screen, ipcMain } from "electron";
import { supabase } from "./db/connection.js";

import { fileURLToPath } from "node:url";
import path from "node:path";
import * as usuarios from "./usuarios.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "dotenv/config.js";
import electronSquirrelStartup from "electron-squirrel-startup";
import { error } from "node:console";

const { getUsers, addUser } = usuarios;
let { usuarios: users } = usuarios;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

let mainWindow;
const createWindow = () => {
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

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
};

// Eventos
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  ipcMain.on("date-updated", async (event, seconds, idTimer) => {
    const index = users.findIndex((item) => item.id === idTimer);
    console.log(index);

    console.log(users[index]);

    let newTime = new Date(users[index].finalTime);
    newTime.setHours(newTime.getHours() + 2);
    console.log(newTime);

    const { error } = await supabase()
      .from("users")
      .update({ finalTime: newTime })
      .eq("id", idTimer);
  });

  ipcMain.on("finish", async (event, id, id_equipo) => {
    users = users.filter((item) => item.id != id);

    await Promise.all([
    supabase().from("users").update({ active: false }).eq("id", id),
    supabase().from("equipos").update({ active: false }).eq("id", id_equipo)
    ]);
  });

  ipcMain.on("newReport", async (event, id_user, id_equipo, text) => {
    await supabase()
      .from("reportes")
      .insert([{ description: text, id_user, id_equipo }]);
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
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

// Verifica si hay usuarios existentes
ipcMain.handle("fetch-users", async () => {
  const { data: activeUsers, error: activeError } = await supabase()
    .from("users")
    .select("*, equipos(*)")
    .eq("active", true)

  const { data: logs, error: logsError } = await supabase()
    .from("users")
    .select("*, equipos(*)")
    .order("finalTime", { ascending: false })
    .range(0, 99)

    const error = activeError || logsError;

    console.log(logs);

    if (error) {
    alert("Error al traer datos de users:", error);
    return { activeUsers: [], logs: [], error };
    }

  //users = data.filter((user) => user.active);
  return { activeUsers, logs, error };
});

//Verifica si hay reportes
ipcMain.handle("fetch-reportes", async () => {
  const { data, error } = await supabase()
    .from("reportes")
    .select("*, equipos(name), users(code)")
    .order("created_at", { ascending: false });

  if (error) return;
  return { data, error };
});
// Escuchar cambios en la tabla users
supabase()
  .channel("public:users")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "users" },
    async (payload) => {
      console.log("Cambio detectado:", payload);

      if (payload.eventType === "INSERT") {
        const { data, error } = await supabase()
          .from("equipos")
          .select("*")
          .eq("id", payload.new.id_equipo)
          .single();

        if (error) {
          alert("Algo salio mal");
          return;
        } else {
          payload.new.equipos = data;
          addUser(payload.new);
        }
      }

      if (payload.eventType === "UPDATE") {
        const exist = users.find((item) => item.id === payload.new.id);
        if (payload.new.active && !exist) {
          addUser(payload.new);
          console.log(users);
          
        } else if (!payload.new.active && exist)
          users = users.filter((item) => item.id !== payload.new.id);
        else {
          const index = users.findIndex((item) => item.id === payload.new.id);
          users[index] = { ...users[index], finalTime: payload.new.finalTime };
        }
      }

      mainWindow.webContents.send("user-changed", payload);
    }
  )
  .subscribe();

// Escuchar cambios en la tabla reportes
supabase()
  .channel("public:reportes")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "reportes" },
    async (payload) => {
      if (payload.eventType === "INSERT") {
        const { data: dataRep, error: errorRep } = await supabase()
          .from("reportes")
          .select("*, equipos(name), users(code)")
          .eq("id", payload.new.id)
          .single();

        console.log(dataRep, errorRep);

        if (!error) return;

        mainWindow.webContents.send("reporte-changed", dataRep);
      }
    }
  )
  .subscribe();
