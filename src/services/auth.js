import { backendConfigured, supabase } from "../lib/supabase.js";

export async function getCurrentSession() {
  if (!backendConfigured) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export function watchSession(callback) {
  if (!backendConfigured) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export async function signUp({ displayName, email, password }) {
  const confirmationUrl = import.meta.env.VITE_SITE_URL?.trim()
    || (import.meta.env.PROD ? "https://fnf-lac.vercel.app" : window.location.origin);
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { display_name: displayName.trim() },
      emailRedirectTo: confirmationUrl,
    },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!backendConfigured) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}
