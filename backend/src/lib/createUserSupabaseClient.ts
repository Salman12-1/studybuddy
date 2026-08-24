import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) 
{
    throw new Error("Missing Supabase URL or key.");
}


const supabaseUrl = url;
const supabaseKey = key;


export function createUserSupabaseClient(accessToken: string)
{
    return createClient(supabaseUrl, supabaseKey, {
        accessToken: async () => accessToken,
        auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
        },
    });
}