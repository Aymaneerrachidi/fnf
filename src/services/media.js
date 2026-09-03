import { backendConfigured, ensureSession, supabase } from "../lib/supabase.js";

export async function getRoomConnection(crewId) {
  if (!backendConfigured) throw new Error("Connect Supabase before opening a live room.");

  await ensureSession();
  const { data, error } = await supabase.functions.invoke("livekit-token", {
    body: { room_name: crewId },
  });
  if (error) throw new Error(error.message || "The media room could not be opened.");

  return {
    serverUrl: data.server_url,
    participantToken: data.participant_token,
  };
}
