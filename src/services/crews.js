import { CREWS } from "../data.js";
import { backendConfigured, ensureSession, supabase } from "../lib/supabase.js";

function toCrew(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    thesis: row.thesis,
    trading: row.trading,
    lang: row.language,
    hours: row.market_hours,
    voice: row.voice_preference,
    members: Number(row.member_count ?? 0),
    seats: Number(row.capacity),
    live: Number(row.live_count ?? 0),
    age: row.age_label || "Started recently",
    track: row.track_record || "No history yet",
    access: row.access_mode || "Open",
    requested: Boolean(row.requested),
    lead: {
      name: row.owner_name || "FNF trader",
      handle: row.owner_handle || "member",
    },
  };
}

function makeLocalCrew(values) {
  return {
    id: `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
    name: values.name.trim(),
    thesis: values.thesis.trim(),
    trading: values.trading,
    lang: values.lang,
    hours: values.hours,
    voice: values.voice,
    members: 1,
    seats: Number(values.seats),
    live: 1,
    age: "Started today",
    track: "No history yet",
    access: "Open",
    lead: { name: "You", handle: "your handle" },
  };
}

export async function loadCrews() {
  if (!backendConfigured) return { crews: CREWS, source: "mock" };

  const { data, error } = await supabase.rpc("list_crews");
  if (error) throw error;

  return { crews: data.map(toCrew), source: "supabase" };
}

export async function createCrew(values) {
  if (!backendConfigured) return makeLocalCrew(values);

  await ensureSession();
  const { data: crewId, error } = await supabase.rpc("create_crew", {
    p_name: values.name.trim(),
    p_thesis: values.thesis.trim(),
    p_trading: values.trading,
    p_language: values.lang,
    p_market_hours: values.hours,
    p_voice_preference: values.voice,
    p_capacity: Number(values.seats),
  });
  if (error) throw error;

  const { data, error: readError } = await supabase.rpc("list_crews", {
    p_crew_id: crewId,
  });
  if (readError) throw readError;
  if (!data?.[0]) throw new Error("The crew was created but could not be loaded.");

  return toCrew(data[0]);
}

export async function requestSeat(crewId) {
  if (!backendConfigured) return { crewId, status: "pending" };

  await ensureSession();
  const { data, error } = await supabase.rpc("request_seat", {
    p_crew_id: crewId,
    p_note: null,
  });
  if (error) throw error;

  return { id: data, crewId, status: "pending" };
}

export { backendConfigured };
