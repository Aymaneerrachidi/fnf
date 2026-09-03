import { createClient } from "@supabase/supabase-js";

const productionUrl = "https://rngoiswvuhoqtlfbhxpw.supabase.co";
const productionPublishableKey = "sb_publishable_umzjilX3k5UqCZBCZH9HvQ_xEPWt5PX";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
  || (import.meta.env.PROD ? productionUrl : undefined);
export const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()
  || (import.meta.env.PROD ? productionPublishableKey : undefined);

export const backendConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = backendConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export class AuthRequiredError extends Error {
  constructor(message = "Create an account or sign in to continue.") {
    super(message);
    this.name = "AuthRequiredError";
    this.code = "AUTH_REQUIRED";
  }
}

export async function ensureSession() {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (data.session) return data.session;
  throw new AuthRequiredError();
}
