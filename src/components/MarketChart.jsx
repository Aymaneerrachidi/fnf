import { useEffect, useMemo, useRef, useState } from "react";
import { CandlestickSeries, ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { ArrowSquareOut, MagnifyingGlass, PaperPlaneTilt, ShieldCheck, ShieldWarning, SpinnerGap, TrendUp, UsersThree, WarningOctagon } from "@phosphor-icons/react";
import { getPoolCandles, resolveContract } from "../services/marketData.js";

const compactMoney = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });
const NETWORK_LABELS = { solana: "Solana", base: "Base", bsc: "BNB Chain", robinhood: "Robinhood" };
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

function normalizePair(pair, searchedAddress, security = {}) {
  const same = (a, b) => pair.chainId === "solana" ? a === b : a?.toLowerCase() === b?.toLowerCase();
  const token = same(pair.quoteToken?.address, searchedAddress) ? pair.quoteToken : pair.baseToken;
  const quote = token === pair.baseToken ? pair.quoteToken : pair.baseToken;
  return {
    id: `${pair.chainId}:${pair.pairAddress}`,
    symbol: token?.symbol || "TOKEN",
    name: token?.name || "Onchain token",
    quote: quote?.symbol || "USD",
    address: pair.pairAddress,
    tokenAddress: token?.address || searchedAddress,
    network: pair.chainId,
    chainId: pair.chainId,
    dex: pair.dexId || "DEX",
    url: pair.url,
    price: Number(pair.priceUsd || 0),
    marketCap: Number(pair.marketCap || pair.fdv || 0),
    change: Number(pair.priceChange?.h24 || 0),
    liquidity: Number(pair.liquidity?.usd || 0),
    volume: Number(pair.volume?.h24 || 0),
    security: security[pair.chainId] || { status: "unknown", label: "Risk scan unavailable", reasons: [] },
  };
}

function RiskStatus({ report }) {
  const Icon = report?.status === "clear" ? ShieldCheck : report?.status === "blocked" ? WarningOctagon : ShieldWarning;
  return <div className={`market-risk market-risk--${report?.status || "unknown"}`} title={report?.reasons?.join(" · ") || "An automated scan cannot guarantee token safety."}>
    <Icon weight="fill" />
    <span><b>{report?.label || "Risk unknown"}</b><small>Automated scan, not a guarantee</small></span>
  </div>;
}

export default function MarketChart({ onShare, onDirectShare, members = [], externalChart }) {
  const hostRef = useRef(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [pair, setPair] = useState(null);
  const [candles, setCandles] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [resultsOpen, setResultsOpen] = useState(false);

  const choosePair = async (nextPair, closeResults = true) => {
    setPair(nextPair);
    if (closeResults) setResultsOpen(false);
    setCandles([]);
    setError("");
    if (nextPair.security?.status === "blocked") { setStatus("blocked"); return; }
    setStatus("loading");
    try {
      const payload = await getPoolCandles(nextPair.address, nextPair.network, "minute", 5, 240);
      const list = payload?.data?.attributes?.ohlcv_list || [];
      const marketCapScale = nextPair.price > 0 && nextPair.marketCap > 0 ? nextPair.marketCap / nextPair.price : 1;
      setCandles(list.map(([time, open, high, low, close]) => ({ time: Number(time), open: Number(open) * marketCapScale, high: Number(high) * marketCapScale, low: Number(low) * marketCapScale, close: Number(close) * marketCapScale })).sort((a, b) => a.time - b.time));
      setStatus("ready");
    } catch (cause) {
      setCandles([]); setError(cause.message || "This chart could not be loaded."); setStatus("error");
    }
  };

  const runSearch = async () => {
    const address = query.trim();
    if (!SOLANA_ADDRESS.test(address) && !EVM_ADDRESS.test(address)) {
      setError("Paste a complete Solana or EVM contract address. Tickers are intentionally disabled.");
      setStatus("error");
      return;
    }
    setStatus("searching"); setError(""); setResultsOpen(false);
    try {
      const payload = await resolveContract(address);
      const found = (payload.pairs || []).map((item) => normalizePair(item, payload.address, payload.security)).sort((a, b) => b.liquidity - a.liquidity);
      setResults(found);
      if (!found.length) {
        setPair(null); setCandles([]); setStatus("idle"); setError("No indexed pool exists for this exact contract on Solana, Base, BNB Chain, or Robinhood.");
        return;
      }
      setResultsOpen(found.length > 1);
      await choosePair(found[0], found.length === 1);
      if (found.length > 1) setResultsOpen(true);
    } catch (cause) {
      setError(cause.message || "Contract lookup is unavailable."); setStatus("error");
    }
  };

  useEffect(() => {
    if (!externalChart?.address) return;
    const next = { ...externalChart, security: externalChart.security || { status: "unknown", label: "Shared chart · scan unknown", reasons: [] } };
    setQuery(externalChart.tokenAddress || "");
    choosePair(next);
  }, [externalChart?.shareId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hostRef.current || !candles.length || status !== "ready") return undefined;
    const chart = createChart(hostRef.current, {
      width: hostRef.current.clientWidth, height: hostRef.current.clientHeight,
      layout: { background: { type: ColorType.Solid, color: "#070708" }, textColor: "#858b98", fontFamily: "Satoshi" },
      grid: { vertLines: { color: "rgba(200,206,216,.055)" }, horzLines: { color: "rgba(200,206,216,.055)" } },
      rightPriceScale: { borderColor: "rgba(200,206,216,.12)", scaleMargins: { top: .12, bottom: .12 } },
      timeScale: { borderColor: "rgba(200,206,216,.12)", timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: "#ff3bbe88" }, horzLine: { color: "#a9b1ff66" } },
      localization: { priceFormatter: (value) => `$${compactMoney.format(value)}` },
    });
    const series = chart.addSeries(CandlestickSeries, { upColor: "#ff3bbe", downColor: "#596bff", borderVisible: false, wickUpColor: "#ff74d3", wickDownColor: "#8d9aff" });
    series.setData(candles); chart.timeScale().fitContent();
    const observer = new ResizeObserver(([entry]) => chart.resize(entry.contentRect.width, entry.contentRect.height));
    observer.observe(hostRef.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [candles, status]);

  const marketCap = useMemo(() => pair?.marketCap ? `$${compactMoney.format(pair.marketCap)}` : "—", [pair]);

  return <section className="market-desk" aria-label="Multi-chain contract chart">
    <div className="market-terminal-label"><span><i />FNF EXACT CA TERMINAL</span><small>Solana · Base · BNB · Robinhood</small></div>
    <header className="market-desk__bar">
      <div className="market-symbol"><span className="market-symbol__icon"><TrendUp size={16} weight="bold" /></span><div><strong>{pair ? `${pair.symbol} / ${pair.quote}` : "Paste a contract address"}</strong><small>{pair ? `${NETWORK_LABELS[pair.network] || pair.network} · ${pair.dex}` : "One field. The chain resolves automatically."}</small></div></div>
      {pair && <div className="market-price"><small>MC</small><strong>{marketCap}</strong><span className={pair.change >= 0 ? "is-up" : "is-down"}>{pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%</span></div>}
      <form className="market-search" onSubmit={(event) => { event.preventDefault(); runSearch(); }}><MagnifyingGlass size={15} weight="bold" /><input aria-label="Search exact contract address" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Paste Solana or 0x contract address" autoComplete="off" spellCheck="false" /><button type="submit" aria-label="Resolve contract"><span>↵</span></button>{resultsOpen && results.length > 1 && <div className="market-results"><header><b>Exact contract found on {new Set(results.map((item) => item.network)).size} chain(s)</b><small>Best liquidity selected</small></header>{results.slice(0, 10).map((item) => <button key={item.id} type="button" className={pair?.id === item.id ? "active" : ""} onClick={() => choosePair(item)}><span><b>{item.symbol} / {item.quote}</b><small>{NETWORK_LABELS[item.network]} · {item.dex}</small></span><em>${compactMoney.format(item.liquidity)} liq</em></button>)}</div>}</form>
    </header>
    {pair && <div className="market-desk__meta"><span>{NETWORK_LABELS[pair.network] || pair.network}</span><span>5m candles</span><span>24h vol ${compactMoney.format(pair.volume)}</span><span>liquidity ${compactMoney.format(pair.liquidity)}</span>{results.length > 1 && <button type="button" onClick={() => setResultsOpen((value) => !value)}>{results.length} exact pools</button>}{pair.url && <a href={pair.url} target="_blank" rel="noreferrer">Open market <ArrowSquareOut /></a>}<RiskStatus report={pair.security} />{pair.security?.status !== "blocked" && <div className="market-share"><button type="button" onClick={() => onShare?.(pair)}><PaperPlaneTilt />Post to room</button>{members.length > 0 && <button type="button" onClick={() => setShareOpen((value) => !value)}><UsersThree />Show online friend</button>}{shareOpen && <div className="market-share__menu"><strong>Send this live chart to</strong>{members.map((member) => <button key={member.user_id} type="button" onClick={() => { onDirectShare?.(member, pair); setShareOpen(false); }}>{member.avatar_url ? <img src={member.avatar_url} alt="" /> : <span>{member.display_name.slice(0, 2).toUpperCase()}</span>}<div><b>{member.display_name}</b><small>@{member.handle}</small></div></button>)}</div>}</div>}</div>}
    <div className="market-chart" ref={hostRef}>
      {(status === "loading" || status === "searching") && <div className="market-state"><SpinnerGap className="animate-spin" size={22} />{status === "searching" ? "Resolving exact contract and scanning risk…" : "Loading live candles…"}</div>}
      {status === "idle" && !error && <div className="market-state market-state--empty"><MagnifyingGlass size={27} /><b>CA only. No ticker guessing.</b><span>Paste the full token contract. FNF checks exact pools across all four networks, then opens the deepest market.</span></div>}
      {status === "blocked" && <div className="market-state market-state--blocked"><WarningOctagon size={30} weight="fill" /><b>Chart blocked by the risk screen.</b><span>{pair.security.reasons.join(" · ")}</span><small>Automated scanners reduce risk; they cannot prove a token is safe.</small>{pair.url && <a href={pair.url} target="_blank" rel="noreferrer">Inspect source <ArrowSquareOut /></a>}</div>}
      {error && status !== "blocked" && <div className="market-state market-state--error">{error}<button type="button" onClick={() => { setError(""); setStatus(pair && candles.length ? "ready" : "idle"); }}>Dismiss</button></div>}
    </div>
  </section>;
}
