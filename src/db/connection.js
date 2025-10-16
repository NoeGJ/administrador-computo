import { createClient } from "@supabase/supabase-js";
import { getCredentials } from "../config.js";

const credentials = getCredentials();

export let supabase  = null

if (credentials?.url && credentials?.key) {
  supabase = createClient(credentials.url, credentials.key);
} else {
  console.warn("No Supabase credentials found. Skipping Supabase client initialization.");
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