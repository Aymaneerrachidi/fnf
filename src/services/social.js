import { ensureSession, supabase } from "../lib/supabase.js";

export async function discoverPeople(query = "") {
  await ensureSession();
  const { data, error } = await supabase.rpc("discover_people", { p_query: query, p_limit: 60 });
  if (error) throw error;
  return data || [];
}

export async function loadConnections() {
  await ensureSession();
  const { data, error } = await supabase.rpc("list_connections");
  if (error) throw error;
  return data || [];
}

export async function requestConnection(userId) {
  await ensureSession();
  const { data, error } = await supabase.rpc("send_connection_request", { p_target: userId });
  if (error) throw error;
  return data;
}

export async function decideConnection(connectionId, decision) {
  await ensureSession();
  const { data, error } = await supabase.rpc("decide_connection", { p_connection_id: connectionId, p_decision: decision });
  if (error) throw error;
  return data;
}

export function subscribeToConnections(onChange) {
  const channel = supabase.channel(`connections:${crypto.randomUUID()}`).on("postgres_changes", {
    event: "*", schema: "public", table: "connections",
  }, onChange).subscribe();
  return () => supabase.removeChannel(channel);
}

export async function openConversation(userId) {
  await ensureSession();
  const { data, error } = await supabase.rpc("get_or_create_conversation", { p_target: userId });
  if (error) throw error;
  return data;
}

export async function loadConversations() {
  await ensureSession();
  const { data, error } = await supabase.rpc("list_conversations");
  if (error) throw error;
  return data || [];
}

export async function loadDirectMessages(conversationId) {
  await ensureSession();
  const { data, error } = await supabase.rpc("list_direct_messages", { p_conversation_id: conversationId, p_limit: 160 });
  if (error) throw error;
  return (data || []).reverse();
}

export async function sendDirectMessage(conversationId, body, kind = "message", metadata = {}) {
  await ensureSession();
  const { data, error } = await supabase.rpc("send_direct_message", { p_conversation_id: conversationId, p_body: body, p_kind: kind, p_metadata: metadata });
  if (error) throw error;
  return data;
}

export function subscribeToDirectMessages(conversationId, onMessage) {
  const channel = supabase.channel(`dm:${conversationId}`).on("postgres_changes", {
    event: "INSERT", schema: "public", table: "direct_messages", filter: `conversation_id=eq.${conversationId}`,
  }, (event) => onMessage(event.new)).subscribe();
  return () => supabase.removeChannel(channel);
}

export async function createIntroduction(personA, personB, note) {
  await ensureSession();
  const { data, error } = await supabase.rpc("create_introduction", { p_person_a: personA, p_person_b: personB, p_note: note });
  if (error) throw error;
  return data;
}

export async function loadIntroductions() {
  await ensureSession();
  const { data, error } = await supabase.rpc("list_introductions");
  if (error) throw error;
  return data || [];
}

export function joinSocialPresence(user, profile, onSync) {
  const channel = supabase.channel("fnf:social-presence", { config: { presence: { key: user.id } } });
  const sync = () => {
    const state = channel.presenceState();
    const people = Object.entries(state).map(([id, entries]) => ({ id, ...(entries[entries.length - 1] || {}) }));
    onSync(people);
  };
  channel.on("presence", { event: "sync" }, sync).on("presence", { event: "join" }, sync).on("presence", { event: "leave" }, sync).subscribe(async (status) => {
    if (status === "SUBSCRIBED") await channel.track({ displayName: profile?.display_name || "FNF trader", handle: profile?.handle || "member", avatarUrl: profile?.avatar_url || null, state: "online", page: window.location.pathname, at: new Date().toISOString() });
  });
  const onVisibility = () => channel.track({ displayName: profile?.display_name || "FNF trader", handle: profile?.handle || "member", avatarUrl: profile?.avatar_url || null, state: document.hidden ? "away" : "online", page: window.location.pathname, at: new Date().toISOString() });
  document.addEventListener("visibilitychange", onVisibility);
  return () => { document.removeEventListener("visibilitychange", onVisibility); channel.untrack(); supabase.removeChannel(channel); };
}
