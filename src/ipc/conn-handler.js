import { createClient } from "@supabase/supabase-js"
import { ipcMain } from "electron"
import { saveCredentials } from '../config.js'
import { configWindow, createWindow } from "../index.js"


ipcMain.handle('connect-db', async (event, { url, key }) => {
  try {
    const client = createClient(url, key)
    const { data, error } = await client.from('equipos').select('*').limit(1)

    
    if (error) throw error
    
    saveCredentials(url, key);
    
    configWindow.close();
    createWindow();

    return { ok: true, data }
  } catch (err) {
    return { ok: false, message: err.message }
  }
})