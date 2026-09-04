import { ensureSession, supabase } from "../lib/supabase.js";
import { resolveContract } from "./marketData.js";

function marketRow(pair, extra = {}) {
  return {
    network: pair.network,
    token_address: pair.tokenAddress,
    pool_address: pair.address,
    symbol: pair.symbol,
    name: pair.name || "",
    snapshot: pair,
    ...extra,
  };
}

export async function loadSavedTokens() {
  const session = await ensureSession();
  const { data, error } = await supabase.from("saved_tokens").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function saveToken(pair) {
  const session = await ensureSession();
  const { error } = await supabase.from("saved_tokens").upsert({ user_id: session.user.id, ...marketRow(pair) }, { onConflict: "user_id,network,token_address" });
  if (error) throw error;
}

export async function removeSavedToken(network, tokenAddress) {
  const session = await ensureSession();
  const { error } = await supabase.from("saved_tokens").delete().eq("user_id", session.user.id).eq("network", network).eq("token_address", tokenAddress);
  if (error) throw error;
}

export async function loadTokenAlerts() {
  const session = await ensureSession();
  const { data, error } = await supabase.from("token_alerts").select("*").eq("user_id", session.user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function createTokenAlert(pair, direction, threshold, metric = "market_cap") {
  const session = await ensureSession();
  const { data, error } = await supabase.from("token_alerts").insert({ user_id: session.user.id, network: pair.network, token_address: pair.tokenAddress, pool_address: pair.address, symbol: pair.symbol, direction, threshold: Number(threshold), metric }).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTokenAlert(id) {
  const session = await ensureSession();
  const { error } = await supabase.from("token_alerts").delete().eq("id", id).eq("user_id", session.user.id);
  if (error) throw error;
}

export async function checkTokenAlerts() {
  const alerts = (await loadTokenAlerts()).filter((alert) => alert.active);
  if (!alerts.length) return;
  await Promise.allSettled(alerts.map(async (alert) => {
    const payload = await resolveContract(alert.token_address);
    const pairs = (payload.pairs || []).filter((pair) => pair.chainId === alert.network);
    const pair = pairs.sort((a, b) => Number(b.liquidity?.usd || 0) - Number(a.liquidity?.usd || 0))[0];
    const current = Number(pair?.marketCap || pair?.fdv || 0);
    if (!current) return;
    const crossed = alert.direction === "above" ? current >= Number(alert.threshold) : current <= Number(alert.threshold);
    if (!crossed) return;
    const marker = `fnf-market-alert:${alert.id}:${alert.threshold}`;
    if (localStorage.getItem(marker)) return;
    const { error } = await supabase.rpc("trigger_my_market_alert", { p_alert_id: alert.id, p_current_market_cap: current });
    if (error) {
      // Local fallback keeps MVP alerts useful before the newest database migration
      // reaches an environment; the persisted RPC remains the production path.
      localStorage.setItem(marker, "1");
      window.dispatchEvent(new CustomEvent("fnf:market-alert", { detail: {
        id: marker, type: "market_alert", title: `${alert.symbol} market-cap alert`,
        body: `${alert.symbol} crossed ${alert.direction} $${new Intl.NumberFormat("en", { notation: "compact" }).format(alert.threshold)} MC.`,
        payload: { network: alert.network, token_address: alert.token_address }, created_at: new Date().toISOString(), read_at: null,
      } }));
    }
  }));
}

export async function loadTokenActivity(network, tokenAddress) {
  await ensureSession();
  const { data, error } = await supabase.rpc("list_token_activity", { p_network: network, p_token_address: tokenAddress });
  if (error) throw error;
  return data || [];
}

export async function loadCrewWatchlist(crewId) {
  await ensureSession();
  const { data, error } = await supabase.from("crew_watchlist").select("*").eq("crew_id", crewId).order("updated_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addCrewWatch(crewId, pair, note = "", sentiment = "watching") {
  const session = await ensureSession();
  const { error } = await supabase.from("crew_watchlist").upsert({ crew_id: crewId, added_by: session.user.id, ...marketRow(pair, { note, sentiment, updated_at: new Date().toISOString() }) }, { onConflict: "crew_id,network,token_address" });
  if (error) throw error;
}

export async function updateCrewWatch(id, changes) {
  await ensureSession();
  const { error } = await supabase.from("crew_watchlist").update({ ...changes, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

export async function removeCrewWatch(id) {
  await ensureSession();
  const { error } = await supabase.from("crew_watchlist").delete().eq("id", id);
  if (error) throw error;
}

export async function loadCrewEvents(crewId) {
  await ensureSession();
  const { data, error } = await supabase.from("crew_events").select("*").eq("crew_id", crewId).gte("starts_at", new Date(Date.now() - 3600000).toISOString()).order("starts_at");
  if (error) throw error;
  return data || [];
}

export async function createCrewEvent(crewId, values) {
  const session = await ensureSession();
  const { data, error } = await supabase.from("crew_events").insert({ crew_id: crewId, creator_id: session.user.id, title: values.title.trim(), description: values.description?.trim() || "", starts_at: new Date(values.startsAt).toISOString(), duration_minutes: Number(values.duration || 60), event_type: values.type || "voice" }).select().single();
  if (error) throw error;
  return data;
}

export async function loadRoomPolls(crewId) {
  await ensureSession();
  const { data, error } = await supabase.rpc("list_room_polls", { p_crew_id: crewId });
  if (error) throw error;
  return data || [];
}

export async function createRoomPoll(crewId, question, options) {
  await ensureSession();
  const { data, error } = await supabase.rpc("create_room_poll", { p_crew_id: crewId, p_question: question, p_options: options });
  if (error) throw error;
  return data;
}

export async function voteRoomPoll(pollId, optionId) {
  await ensureSession();
  const { error } = await supabase.rpc("vote_room_poll", { p_poll_id: pollId, p_option_id: optionId });
  if (error) throw error;
}

export async function pinRoomMessage(messageId) {
  await ensureSession();
  const { error } = await supabase.rpc("pin_room_message", { p_message_id: messageId });
  if (error) throw error;
}
