import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

// Create client - type inference handled in hooks with explicit casts
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Export types for use throughout the app
export type { User } from "@supabase/supabase-js";
export type { Database } from "../types/database";
