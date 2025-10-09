import { createClient } from "@supabase/supabase-js";

export const supabase = () => {
        return createClient(process.env.SUPABASEURL, process.env.SUPABASEKEY);
}
