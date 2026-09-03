import { ensureSession, supabase } from "../lib/supabase.js";

export async function loadProfile() {
  const session = await ensureSession();
  const [{ data: profile, error: profileError }, { data: trading, error: tradingError }] = await Promise.all([
    supabase.from("profiles").select("display_name, handle, avatar_url, wallet_address").eq("id", session.user.id).single(),
    supabase.from("trading_profiles").select("trading, language, market_hours, voice_preference, bio").eq("user_id", session.user.id).single(),
  ]);
  if (profileError) throw profileError;
  if (tradingError) throw tradingError;
  return { ...profile, ...trading, email: session.user.email };
}

export async function saveProfile(values) {
  const session = await ensureSession();
  const [{ error: profileError }, { error: tradingError }] = await Promise.all([
    supabase.from("profiles").update({
      display_name: values.displayName.trim(),
      handle: values.handle.trim().toLowerCase(),
    }).eq("id", session.user.id),
    supabase.from("trading_profiles").update({
      trading: values.trading,
      language: values.language,
      market_hours: values.hours,
      voice_preference: values.voice,
      bio: values.bio.trim(),
    }).eq("user_id", session.user.id),
  ]);
  if (profileError) throw profileError;
  if (tradingError) throw tradingError;
  return loadProfile();
}
