import { createClient } from "@supabase/supabase-js";

// Trim both values: a trailing space or pasted newline in a Vercel env var
// silently breaks every request (the browser refuses to send a header that
// contains a newline). This was the root cause of the Week 1 "Save" bug.
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

export const supabaseConfigOk =
  supabaseUrl.startsWith("https://") &&
  supabaseAnonKey.length > 0 &&
  !/\s/.test(supabaseAnonKey);

// If the variables are missing, still render the page (with a visible
// configuration error) instead of crashing the whole route.
export const supabase = createClient(
  supabaseUrl || "https://missing-config.supabase.co",
  supabaseAnonKey || "missing-key"
);
