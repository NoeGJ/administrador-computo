import { createClient } from "@supabase/supabase-js";
import { getCredentials } from "../config.js";

export let supabase  = null

export function initSupabase() {
  const { url, key } = getCredentials() || {};
  if (url && key) {
    supabase = createClient(url, key);
   
  } else {
    supabase = null;
  }
  return supabase;
}

export const testConn = async () => {
    if (!supabase) {
    return { ok: false, msg: "Supabase client not initialized." };
  }

  try{
  
  const { error } = await supabase.from('equipos').select('*').limit(1);

  if (error) throw error

    return { ok: true }
  } catch(error) {
    return { ok: false, msg: error }
  } 
}