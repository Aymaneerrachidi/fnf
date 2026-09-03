import { createClient } from "npm:@supabase/supabase-js@2.114.0";
import { AccessToken } from "npm:livekit-server-sdk@2.18.0";
import { json, options } from "../_shared/http.ts";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return options(request);
  if (request.method !== "POST") return json(request, { error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json(request, { error: "Authentication required" }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const livekitUrl = Deno.env.get("LIVEKIT_URL");
    const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
    const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

    if (!supabaseUrl || !supabaseAnonKey || !livekitUrl || !livekitApiKey || !livekitApiSecret) {
      return json(request, { error: "Cloud media is not configured" }, 503);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) return json(request, { error: "Invalid session" }, 401);

    const body = await request.json();
    const crewId = String(body.room_name || "");
    if (!UUID.test(crewId)) return json(request, { error: "A valid crew room is required" }, 400);

    const { data: isMember, error: memberError } = await supabase.rpc("is_crew_member", {
      p_crew_id: crewId,
    });
    if (memberError) throw memberError;
    if (!isMember) return json(request, { error: "Only active crew members can enter this room" }, 403);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, handle")
      .eq("id", auth.user.id)
      .single();

    const roomName = `fnf-${crewId}`;
    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: auth.user.id,
      name: profile?.display_name || "FNF trader",
      metadata: JSON.stringify({ crewId, handle: profile?.handle || "member" }),
      attributes: { crew_id: crewId },
      ttl: "10m",
    });
    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    });

    return json(
      request,
      { server_url: livekitUrl, participant_token: await token.toJwt() },
      201,
      { "Cache-Control": "no-store" },
    );
  } catch (error) {
    console.error("livekit-token", error);
    return json(request, { error: "Could not open the media room" }, 500);
  }
});
