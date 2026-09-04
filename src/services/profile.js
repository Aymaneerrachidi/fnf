import { ensureSession, supabase } from "../lib/supabase.js";

export async function loadProfile() {
  const session = await ensureSession();
  const [{ data: profile, error: profileError }, { data: trading, error: tradingError }] = await Promise.all([
    supabase.from("profiles").select("display_name, handle, avatar_url, wallet_address, provider, social_url, x_url, discord_handle, location, availability_status, last_seen_at").eq("id", session.user.id).single(),
    supabase.from("trading_profiles").select("trading, language, languages, market_hours, voice_preference, bio, experience_level, communication_style").eq("user_id", session.user.id).single(),
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
      avatar_url: values.avatarUrl || null,
      social_url: values.socialUrl?.trim() || null,
      x_url: values.xUrl?.trim() || null,
      discord_handle: values.discordHandle?.trim() || "",
      location: values.location?.trim() || "",
      availability_status: values.availability || "open",
      last_seen_at: new Date().toISOString(),
    }).eq("id", session.user.id),
    supabase.from("trading_profiles").update({
      trading: values.trading,
      language: values.language,
      market_hours: values.hours,
      voice_preference: values.voice,
      bio: values.bio.trim(),
      experience_level: values.experience || "Active",
      communication_style: values.communicationStyle || "Balanced",
      languages: values.languages?.length ? values.languages : [values.language],
    }).eq("user_id", session.user.id),
  ]);
  if (profileError) throw profileError;
  if (tradingError) throw tradingError;
  return loadProfile();
}
