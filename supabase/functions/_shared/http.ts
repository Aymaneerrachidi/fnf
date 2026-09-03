const configuredOrigins = (Deno.env.get("ALLOWED_ORIGINS") || "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin") || "";
  if (configuredOrigins.includes("*")) return "*";
  return configuredOrigins.includes(origin) ? origin : configuredOrigins[0];
}

export function corsHeaders(request: Request) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin(request),
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}

export function json(request: Request, body: unknown, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json; charset=utf-8",
      ...extraHeaders,
    },
  });
}

export function options(request: Request) {
  return new Response("ok", { headers: corsHeaders(request) });
}
