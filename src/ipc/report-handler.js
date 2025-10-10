import { ipcMain } from "electron";
import { supabase } from "../db/connection.js";

//Verifica si hay reportes
ipcMain.handle("fetch-reportes", async () => {
  const { data, error } = await supabase
    .from("reportes")
    .select("*, equipos(name), users(code)")
    .order("created_at", { ascending: false });

  if (error) {
    alert("No se cargaron los reportes");
    return;
    }
  return { data, error };
});

// Genera un reporte desde el administrador
ipcMain.on("newReport", async (event, id_user, id_equipo, text) => {
  await supabase
    .from("reportes")
    .insert([{ description: text, id_user, id_equipo }]);
});
