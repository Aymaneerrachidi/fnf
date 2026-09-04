import { json, options } from "../_shared/http.ts";

const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const NETWORKS: Record<string, { gecko: string | null; address: RegExp; securityId: string }> = {
  solana: { gecko: "solana", address: SOLANA_ADDRESS, securityId: "solana" },
  base: { gecko: "base", address: EVM_ADDRESS, securityId: "8453" },
  bsc: { gecko: "bsc", address: EVM_ADDRESS, securityId: "56" },
  robinhood: { gecko: "robinhood", address: EVM_ADDRESS, securityId: "4663" },
};
const CACHE = { "Cache-Control": "public, s-maxage=10, stale-while-revalidate=30" };

function address(value: string | null, name: string, network = "solana") {
  const chain = NETWORKS[network];
  if (!chain) throw new Error("Unsupported network");
  if (!value || !chain.address.test(value)) throw new Error(`${name} is not a valid ${network} address`);
  return value;
}

async function upstream(request: Request, url: string) {
  const response = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(9000) });
  if (!response.ok) {
    console.error("market-data upstream", response.status, url);
    return json(request, { error: "Market data is temporarily unavailable" }, 502);
  }
  return json(request, await response.json(), 200, CACHE);
}

function isOne(value: unknown) {
  return value === "1" || value === 1 || value === true;
}

function summarizeSecurity(payload: Record<string, unknown> | null, network: string) {
  if (!payload) return { status: "unknown", label: "Risk scan unavailable", reasons: [], provider: "GoPlus" };

  const critical: string[] = [];
  const caution: string[] = [];
  const nested = (key: string) => isOne((payload[key] as Record<string, unknown> | undefined)?.status);

  if (network === "solana") {
    if (nested("freezable")) critical.push("Freeze authority is active");
    if (nested("balance_mutable_authority")) critical.push("Balances can be changed by an authority");
    if (nested("closable")) critical.push("Token program can be closed");
    if (nested("mintable")) caution.push("Mint authority is active");
    if (nested("metadata_mutable")) caution.push("Metadata can be changed");
  } else {
    if (isOne(payload.is_honeypot)) critical.push("Confirmed honeypot flag");
    if (isOne(payload.cannot_sell_all) || isOne(payload.cannot_sell)) critical.push("Selling may be blocked");
    if (isOne(payload.is_blacklisted)) critical.push("Blacklist restriction detected");
    if (isOne(payload.owner_change_balance)) critical.push("Owner can change holder balances");
    if (isOne(payload.transfer_pausable)) critical.push("Transfers can be paused");
    if (isOne(payload.hidden_owner)) caution.push("Hidden ownership detected");
    if (payload.is_open_source === "0") caution.push("Contract source is closed");
    if (isOne(payload.is_mintable)) caution.push("Token can be minted");
    if (isOne(payload.slippage_modifiable)) caution.push("Trading tax can be changed");
    const sellTax = Number(payload.sell_tax);
    if (Number.isFinite(sellTax) && sellTax >= 0.2) critical.push(`${Math.round(sellTax * 100)}% sell tax reported`);
    else if (Number.isFinite(sellTax) && sellTax >= 0.05) caution.push(`${Math.round(sellTax * 100)}% sell tax reported`);
  }

  if (critical.length) return { status: "blocked", label: "Critical risk detected", reasons: [...critical, ...caution], provider: "GoPlus" };
  if (caution.length) return { status: "warn", label: "Review risk flags", reasons: caution, provider: "GoPlus" };
  return { status: "clear", label: "No critical flags found", reasons: [], provider: "GoPlus" };
}

async function getSecurity(network: string, token: string) {
  const info = NETWORKS[network];
  const endpoint = network === "solana"
    ? `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${encodeURIComponent(token)}`
    : `https://api.gopluslabs.io/api/v1/token_security/${info.securityId}?contract_addresses=${encodeURIComponent(token)}`;
  try {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(5500) });
    if (!response.ok) return summarizeSecurity(null, network);
    const body = await response.json();
    const result = body?.result || {};
    const report = result[token] || result[token.toLowerCase()] || Object.values(result)[0] || null;
    return summarizeSecurity(report as Record<string, unknown> | null, network);
  } catch (error) {
    console.error("security upstream", network, error);
    return summarizeSecurity(null, network);
  }
}

async function resolveContract(request: Request, token: string) {
  const isSolana = SOLANA_ADDRESS.test(token);
  const isEvm = EVM_ADDRESS.test(token);
  if (!isSolana && !isEvm) return json(request, { error: "Paste a complete Solana or EVM contract address" }, 400);

  const chains = isSolana ? ["solana"] : ["base", "bsc", "robinhood"];
  const settled = await Promise.all(chains.map(async (network) => {
    const endpoint = `https://api.dexscreener.com/token-pairs/v1/${network}/${encodeURIComponent(token)}`;
    try {
      const response = await fetch(endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(7500) });
      if (!response.ok) return { network, pairs: [] };
      const raw = await response.json();
      const pairs = (Array.isArray(raw) ? raw : raw?.pairs || []).filter((pair: Record<string, any>) => {
        const base = String(pair?.baseToken?.address || "");
        const quote = String(pair?.quoteToken?.address || "");
        return isEvm
          ? base.toLowerCase() === token.toLowerCase() || quote.toLowerCase() === token.toLowerCase()
          : base === token || quote === token;
      });
      return { network, pairs };
    } catch (error) {
      console.error("pair resolver", network, error);
      return { network, pairs: [] };
    }
  }));

  const matches = settled.filter(({ pairs }) => pairs.length);
  if (!matches.length) return json(request, { address: token, pairs: [], security: {}, exact: true }, 200, CACHE);

  const securityEntries = await Promise.all(matches.map(async ({ network }) => [network, await getSecurity(network, token)]));
  return json(request, {
    address: token,
    addressType: isSolana ? "solana" : "evm",
    exact: true,
    pairs: matches.flatMap(({ pairs }) => pairs),
    security: Object.fromEntries(securityEntries),
  }, 200, CACHE);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return options(request);
  if (request.method !== "GET") return json(request, { error: "Method not allowed" }, 405);

  try {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    if (action === "resolve" || action === "token") {
      return resolveContract(request, (url.searchParams.get("address") || "").trim());
    }

    if (action === "search") {
      return json(request, { error: "Ticker search is disabled. Paste an exact contract address." }, 400);
    }

    if (action === "ohlcv") {
      const network = url.searchParams.get("network") || "solana";
      const chain = NETWORKS[network];
      if (!chain) return json(request, { error: "Unsupported chart network" }, 400);
      const pool = address(url.searchParams.get("pool"), "Pool", network);
      const timeframe = url.searchParams.get("timeframe") || "minute";
      if (!["minute", "hour", "day"].includes(timeframe)) return json(request, { error: "Unsupported chart timeframe" }, 400);

      const aggregate = Math.max(1, Math.min(60, Number(url.searchParams.get("aggregate")) || 1));
      const limit = Math.max(20, Math.min(500, Number(url.searchParams.get("limit")) || 300));
      const endpoint = new URL(`https://api.geckoterminal.com/api/v2/networks/${chain.gecko}/pools/${pool}/ohlcv/${timeframe}`);
      endpoint.searchParams.set("aggregate", String(aggregate));
      endpoint.searchParams.set("limit", String(limit));
      endpoint.searchParams.set("currency", "usd");
      return upstream(request, endpoint.toString());
    }

    return json(request, { error: "Use action=resolve or action=ohlcv" }, 400);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid market-data request";
    return json(request, { error: message }, 400);
  }
});
