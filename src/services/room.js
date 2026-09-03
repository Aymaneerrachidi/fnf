import { ensureSession, supabase } from "../lib/supabase.js";

export async function loadRoomMessages(crewId) {
  await ensureSession();
  const { data, error } = await supabase.rpc("list_room_messages", {
    p_crew_id: crewId,
    p_limit: 120,
  });
  if (error) throw error;
  return data || [];
}

export async function sendRoomMessage(crewId, body, kind = "message", metadata = {}) {
  await ensureSession();
  const { data, error } = await supabase.rpc("send_room_message", {
    p_crew_id: crewId,
    p_body: body,
    p_kind: kind,
    p_metadata: metadata,
  });
  if (error) throw error;
  return data;
}

export function subscribeToRoomMessages(crewId, onMessage) {
  const channel = supabase
    .channel(`room:${crewId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "room_messages", filter: `crew_id=eq.${crewId}` },
      (event) => onMessage(event.new),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
}
