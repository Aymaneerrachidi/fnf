import { backendConfigured, ensureSession, supabase } from "../lib/supabase.js";

export async function getRoomConnection(crewId) {
  if (!backendConfigured) throw new Error("Connect Supabase before opening a live room.");

  await ensureSession();
  let data;
  let error;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    ({ data, error } = await supabase.functions.invoke("livekit-token", {
      body: { room_name: crewId },
    }));
    if (!error || !/failed to send|failed to fetch|network/i.test(error.message || "")) break;
    await new Promise((resolve) => window.setTimeout(resolve, 500 * (attempt + 1)));
  }
  if (error) throw new Error(error.message || "The media room could not be opened.");

  return {
    serverUrl: data.server_url,
    participantToken: data.participant_token,
  };
}
