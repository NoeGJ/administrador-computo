import { createClient } from "@supabase/supabase-js"
import { ipcMain } from "electron"
import { saveCredentials } from '../config.js'
import { configWindow, startApp } from "../index.js"
import { initSupabase } from "../db/connection.js"



ipcMain.handle('connect-db', async (event, { url, key }) => {
  try {
    const client = createClient(url, key)
    const { data, error } = await client.from('equipos').select('*').limit(1)

    
    if (error) throw error
    
    saveCredentials(url, key);

    initSupabase();
    
    configWindow.close();
    startApp();

    return { ok: true, data }
  } catch (err) {
    return { ok: false, message: err.message }
  }
})