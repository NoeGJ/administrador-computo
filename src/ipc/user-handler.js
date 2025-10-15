import { dialog, ipcMain } from "electron";
import { supabase } from "../db/connection.js";
import { changeDate, removeUserById, setUsers, users } from "../usuarios.js";

// Verifica si hay usuarios existentes
ipcMain.handle("fetch-users", async () => {
  const { data: activeUsers, error: activeError } = await supabase
    .from("users")
    .select("*, equipos(*)")
    .eq("active", true);

  const { data: logs, error: logsError } = await supabase
    .from("users")
    .select("*, equipos(*)")
    .order("finalTime", { ascending: false, active: true })
    .range(0, 99);

  const error = activeError || logsError;

  if (error) {
    dialog.showErrorBox("Error al traer datos de users");
    return { activeUsers: [], logs: [], error };
  }
  
  setUsers(activeUsers);

  return { activeUsers, logs, error };
});

// Actualizar fecha final por el administrador
ipcMain.on("date-updated", async (event, seconds, idTimer) => {

  const newTime = changeDate(idTimer);

  const { error } = await supabase
    .from("users")
    .update({ finalTime: newTime })
    .eq("id", idTimer);

  if (error) {
    dialog.showErrorBox("La fecha no se pudo cambiar");
  }
});

// Terminar temporizador por el administrador
ipcMain.on("finish", async (event, id, id_equipo) => {

  removeUserById(id);

  await Promise.all([
    supabase
      .from("users")
      .update({ active: false, finalTime: new Date().toISOString() })
      .eq("id", id),

    supabase.from("equipos").update({ active: false }).eq("id", id_equipo),
  ]);
});
