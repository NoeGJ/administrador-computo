import { createClient } from "@supabase/supabase-js";
import { getCredentials } from "../config.js";

const {url, key } = getCredentials();


export const supabase = createClient(
  url,
  key
);
