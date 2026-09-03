import {
  backendConfigured,
  supabase,
  supabaseAnonKey,
  supabaseUrl,
} from "../lib/supabase.js";

async function callMarketData(params) {
  if (!backendConfigured) throw new Error("Connect Supabase before loading live market data.");

  const { data } = await supabase.auth.getSession();
  const accessToken = data.session?.access_token || supabaseAnonKey;
  const endpoint = new URL(`${supabaseUrl}/functions/v1/market-data`);
  Object.entries(params).forEach(([key, value]) => endpoint.searchParams.set(key, String(value)));

  const response = await fetch(endpoint, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || "Market data could not be loaded.");
  return payload;
}

export function searchTokens(query) {
  return callMarketData({ action: "search", q: query });
}

export function getTokenPools(tokenAddress) {
  return callMarketData({ action: "token", address: tokenAddress });
}

export function getPoolCandles(poolAddress, network = "solana", timeframe = "minute", aggregate = 1, limit = 300) {
  return callMarketData({
    action: "ohlcv",
    pool: poolAddress,
    network,
    timeframe,
    aggregate,
    limit,
  });
}
