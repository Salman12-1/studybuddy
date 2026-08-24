import { createClient } from "@supabase/supabase-js";


const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient(supabaseUrl,supabaseKey);

/*
This file creates and exports the Supabase client used throughout StudyBuddy. 
The client is configured using the Supabase project URL and publishable key stored in environment variables. 
Other files import this client whenever they need to communicate with Supabase Authentication, the database, or Storage.
*/