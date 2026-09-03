import { ensureSession, supabase } from "../lib/supabase.js";

export async function loadNotifications(limit = 60) {
  await ensureSession();
  const { data, error } = await supabase
    .from("notifications")
    .select("id, crew_id, actor_id, type, title, body, payload, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function markNotificationRead(id) {
  const session = await ensureSession();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id).eq("user_id", session.user.id);
  if (error) throw error;
}

export async function markAllNotificationsRead() {
  const session = await ensureSession();
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("user_id", session.user.id).is("read_at", null);
  if (error) throw error;
}

export function subscribeToNotifications(userId, onNotification) {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, (event) => onNotification(event.new))
    .subscribe();
  return () => supabase.removeChannel(channel);
}

export async function shareChartWithMember(crewId, targetUserId, payload) {
  await ensureSession();
  const { data, error } = await supabase.rpc("share_chart_with_member", {
    p_crew_id: crewId,
    p_target_user_id: targetUserId,
    p_payload: payload,
  });
  if (error) throw error;
  return data;
}
