import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASEURL,
  process.env.SUPABASEKEY
);
