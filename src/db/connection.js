import { createClient } from "@supabase/supabase-js";
import { getCredentials } from "../config.js";

const {url, key } = getCredentials();


export const supabase = createClient(
  url,
  key
);

export const testConn = async () => {
  try{
  const conn = supabase;
  
  const { error } = await conn.from('equipos').select('*').limit(1);

  if (error) throw error

    return { ok: true }
  } catch(error) {
    return { ok: false, msg: error }
  } 
}