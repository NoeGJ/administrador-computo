import { addUser, findUser, removeUser, replaceDate } from "../usuarios.js";
import { supabase } from "./connection.js";

// Escuchar cambios en la tabla users
export const userChannel = (mainWindow) => {
  supabase
    .channel("public:users")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "users" },
      async (payload) => {
        console.log("Cambio detectado:", payload);

        if (payload.eventType === "INSERT") {
          const { data, error } = await supabase
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
          const exist = findUser(payload.new);
          //const exist = users.find((item) => item.id === payload.new.id);
          if (payload.new.active && !exist) {
            addUser(payload.new);
            console.log(users);
          } else if (!payload.new.active && exist)
            //users = users.filter((item) => item.id !== payload.new.id);
            removeUser(payload.new);
          else {
            replaceDate(payload.new, payload.new?.finalTime);
            //const index = users.findIndex((item) => item.id === payload.new.id);
            //users[index] = { ...users[index], finalTime: payload.new.finalTime };
          }
        }
        mainWindow.webContents.send("user-changed", payload);
        
      }
    )
    .subscribe();
};

// Escuchar cambios en la tabla reportes
export const reporteChannel = (mainWindow) => {
  supabase
    .channel("public:reportes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "reportes" },
      async (payload) => {
        if (payload.eventType === "INSERT") {
          const { data: dataRep, error: errorRep } = await supabase
            .from("reportes")
            .select("*, equipos(name), users(code)")
            .eq("id", payload.new.id)
            .single();

          console.log(dataRep, errorRep);

          if (!error) {
            alert("Algo salio mal al importar los reportes");
            return;
          }
          
          mainWindow.webContents.send("reporte-changed", dataRep);
        }
      }
    )
    .subscribe();
};
