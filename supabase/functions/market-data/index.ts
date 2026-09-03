import { json, options } from "../_shared/http.ts";

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_ADDRESS = /^0x(?:[a-fA-F0-9]{40}|[a-fA-F0-9]{64})$/;
const NETWORKS: Record<string, { gecko: string | null; address: RegExp }> = {
  solana: { gecko: "solana", address: SOLANA_ADDRESS },
  base: { gecko: "base", address: EVM_ADDRESS },
  bsc: { gecko: "bsc", address: EVM_ADDRESS },
  robinhood: { gecko: null, address: EVM_ADDRESS },
};
const CACHE = { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" };

function address(value: string | null, name: string, network = "solana") {
  const chain = NETWORKS[network];
  if (!chain) throw new Error("Unsupported network");
  if (!value || !chain.address.test(value)) throw new Error(`${name} is not a valid ${network} address`);
  return value;
}

async function upstream(request: Request, url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) {
    console.error("market-data upstream", response.status, url);
    return json(request, { error: "Market data is temporarily unavailable" }, 502);
  }
  return json(request, await response.json(), 200, CACHE);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return options(request);
  if (request.method !== "GET") return json(request, { error: "Method not allowed" }, 405);

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "search") {
      const query = (url.searchParams.get("q") || "").trim().slice(0, 100);
      if (query.length < 2) return json(request, { error: "Search needs at least two characters" }, 400);
      return upstream(
        request,
        `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`,
      );
    }

    if (action === "token") {
      const token = address(url.searchParams.get("address"), "Token");
      return upstream(request, `https://api.dexscreener.com/token-pairs/v1/solana/${token}`);
    }

    if (action === "ohlcv") {
      const network = url.searchParams.get("network") || "solana";
      const chain = NETWORKS[network];
      if (!chain) return json(request, { error: "Unsupported chart network" }, 400);
      if (!chain.gecko) return json(request, {
        error: "Robinhood Chain is connected, but indexed DEX candle data is not available yet.",
        code: "INDEXER_PENDING",
      }, 422);
      const pool = address(url.searchParams.get("pool"), "Pool", network);
      const timeframe = url.searchParams.get("timeframe") || "minute";
      if (!["minute", "hour", "day"].includes(timeframe)) {
        return json(request, { error: "Unsupported chart timeframe" }, 400);
      }

      const aggregate = Math.max(1, Math.min(60, Number(url.searchParams.get("aggregate")) || 1));
      const limit = Math.max(20, Math.min(500, Number(url.searchParams.get("limit")) || 300));
      const endpoint = new URL(
        `https://api.geckoterminal.com/api/v2/networks/${chain.gecko}/pools/${pool}/ohlcv/${timeframe}`,
      );
      endpoint.searchParams.set("aggregate", String(aggregate));
      endpoint.searchParams.set("limit", String(limit));
      endpoint.searchParams.set("currency", "usd");

      return upstream(request, endpoint.toString());
    }

    return json(request, { error: "Use action=search, action=token, or action=ohlcv" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid market-data request";
    return json(request, { error: message }, 400);
  }
});
