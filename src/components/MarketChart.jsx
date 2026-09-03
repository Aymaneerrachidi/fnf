import { useEffect, useMemo, useRef, useState } from "react";
import { CandlestickSeries, ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { ArrowSquareOut, MagnifyingGlass, PaperPlaneTilt, SpinnerGap, TrendUp, UsersThree } from "@phosphor-icons/react";
import { getPoolCandles, searchTokens } from "../services/marketData.js";

const compactMoney = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });
const NETWORKS = [
  { id: "solana", dex: "solana", label: "Solana", query: "SOL" },
  { id: "base", dex: "base", label: "Base", query: "USDC" },
  { id: "bsc", dex: "bsc", label: "BNB", query: "CAKE" },
  { id: "robinhood", dex: "robinhood", label: "Robinhood", query: "USDC" },
];

function normalizePair(pair) {
  const network = NETWORKS.find((item) => item.dex === pair.chainId)?.id || pair.chainId;
  return {
    id: `${pair.chainId}:${pair.pairAddress}`,
    symbol: pair.baseToken?.symbol || "TOKEN",
    name: pair.baseToken?.name || "Onchain token",
    quote: pair.quoteToken?.symbol || "USD",
    address: pair.pairAddress,
    tokenAddress: pair.baseToken?.address,
    network,
    chainId: pair.chainId,
    dex: pair.dexId || "DEX",
    url: pair.url,
    price: Number(pair.priceUsd || 0),
    change: Number(pair.priceChange?.h24 || 0),
    liquidity: Number(pair.liquidity?.usd || 0),
    volume: Number(pair.volume?.h24 || 0),
  };
}

export default function MarketChart({ onShare, onDirectShare, members = [], externalChart }) {
  const hostRef = useRef(null);
  const [network, setNetwork] = useState("solana");
  const [query, setQuery] = useState("SOL");
  const [results, setResults] = useState([]);
  const [pair, setPair] = useState(null);
  const [candles, setCandles] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [shareOpen, setShareOpen] = useState(false);

  const choosePair = async (nextPair) => {
    setNetwork(nextPair.network || "solana");
    setPair(nextPair);
    setResults([]);
    setStatus("loading");
    setError("");
    if (nextPair.network === "robinhood") {
      setCandles([]); setStatus("chain-ready"); return;
    }
    try {
      const payload = await getPoolCandles(nextPair.address, nextPair.network || "solana", "minute", 5, 240);
      const list = payload?.data?.attributes?.ohlcv_list || [];
      setCandles(list.map(([time, open, high, low, close]) => ({ time: Number(time), open: Number(open), high: Number(high), low: Number(low), close: Number(close) })).sort((a, b) => a.time - b.time));
      setStatus("ready");
    } catch (cause) {
      setCandles([]); setError(cause.message || "This chart could not be loaded."); setStatus("error");
    }
  };

  const runSearch = async (value = query, selectedNetwork = network) => {
    if (value.trim().length < 2) return;
    setStatus("searching"); setError("");
    try {
      const payload = await searchTokens(value.trim());
      const dexId = NETWORKS.find((item) => item.id === selectedNetwork)?.dex;
      const found = (payload.pairs || []).filter((item) => item.chainId === dexId).map(normalizePair).sort((a, b) => b.liquidity - a.liquidity).slice(0, 7);
      setResults(found);
      if (!pair || pair.network !== selectedNetwork) {
        if (found[0]) await choosePair(found[0]);
        else { setPair(null); setCandles([]); setStatus("ready"); setError("No indexed pools matched on this chain."); }
      } else setStatus("ready");
    } catch (cause) {
      setError(cause.message || "Market search is unavailable."); setStatus("error");
    }
  };

  const switchNetwork = (next) => {
    const info = NETWORKS.find((item) => item.id === next);
    setNetwork(next); setQuery(info.query); setPair(null); setCandles([]); setResults([]); runSearch(info.query, next);
  };

  useEffect(() => { runSearch("SOL", "solana"); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (externalChart?.address) choosePair(externalChart); }, [externalChart?.shareId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hostRef.current || !candles.length) return undefined;
    const chart = createChart(hostRef.current, {
      width: hostRef.current.clientWidth, height: hostRef.current.clientHeight,
      layout: { background: { type: ColorType.Solid, color: "#070708" }, textColor: "#858b98", fontFamily: "Satoshi" },
      grid: { vertLines: { color: "rgba(200,206,216,.055)" }, horzLines: { color: "rgba(200,206,216,.055)" } },
      rightPriceScale: { borderColor: "rgba(200,206,216,.12)", scaleMargins: { top: .12, bottom: .12 } },
      timeScale: { borderColor: "rgba(200,206,216,.12)", timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: "#ff3bbe88" }, horzLine: { color: "#a9b1ff66" } },
      localization: { priceFormatter: (value) => value < .01 ? value.toPrecision(4) : value.toFixed(2) },
    });
    const series = chart.addSeries(CandlestickSeries, { upColor: "#ff3bbe", downColor: "#596bff", borderVisible: false, wickUpColor: "#ff74d3", wickDownColor: "#8d9aff" });
    series.setData(candles); chart.timeScale().fitContent();
    const observer = new ResizeObserver(([entry]) => chart.resize(entry.contentRect.width, entry.contentRect.height));
    observer.observe(hostRef.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [candles]);

  const price = useMemo(() => pair?.price ? (pair.price < .01 ? `$${pair.price.toPrecision(4)}` : `$${pair.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}`) : "—", [pair]);

  return <section className="market-desk" aria-label={`${network} market chart`}>
    <nav className="market-networks" aria-label="Chart network">{NETWORKS.map((item) => <button type="button" key={item.id} className={network === item.id ? "active" : ""} onClick={() => switchNetwork(item.id)}><i />{item.label}</button>)}</nav>
    <header className="market-desk__bar">
      <div className="market-symbol"><span className="market-symbol__icon"><TrendUp size={16} weight="bold" /></span><div><strong>{pair ? `${pair.symbol} / ${pair.quote}` : `${NETWORKS.find((item) => item.id === network)?.label} market`}</strong><small>{pair ? `${pair.name} · ${pair.dex}` : "Search a token or contract"}</small></div></div>
      {pair && <div className="market-price"><strong>{price}</strong><span className={pair.change >= 0 ? "is-up" : "is-down"}>{pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%</span></div>}
      <form className="market-search" onSubmit={(event) => { event.preventDefault(); runSearch(); }}><MagnifyingGlass size={15} weight="bold" /><input aria-label={`Search ${network} tokens`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticker or contract" /><button type="submit" aria-label="Search"><span>↵</span></button>{results.length > 0 && <div className="market-results">{results.map((item) => <button key={item.id} type="button" onClick={() => choosePair(item)}><span><b>{item.symbol}</b><small>{item.name}</small></span><em>${compactMoney.format(item.liquidity)} liq</em></button>)}</div>}</form>
    </header>
    <div className="market-desk__meta"><span>5m candles</span><span>24h vol {pair ? `$${compactMoney.format(pair.volume)}` : "—"}</span><span>liquidity {pair ? `$${compactMoney.format(pair.liquidity)}` : "—"}</span>{pair?.url && <a href={pair.url} target="_blank" rel="noreferrer">Open market <ArrowSquareOut /></a>}{pair && <div className="market-share"><button type="button" onClick={() => onShare?.(pair)}><PaperPlaneTilt />Post to room</button>{members.length > 0 && <button type="button" onClick={() => setShareOpen((value) => !value)}><UsersThree />Show a friend</button>}{shareOpen && <div className="market-share__menu"><strong>Send this live chart to</strong>{members.map((member) => <button key={member.user_id} type="button" onClick={() => { onDirectShare?.(member, pair); setShareOpen(false); }}>{member.avatar_url ? <img src={member.avatar_url} alt="" /> : <span>{member.display_name.slice(0, 2).toUpperCase()}</span>}<div><b>{member.display_name}</b><small>@{member.handle}</small></div></button>)}</div>}</div>}</div>
    <div className="market-chart" ref={hostRef}>{(status === "loading" || status === "searching") && <div className="market-state"><SpinnerGap className="animate-spin" size={22} />Loading live market…</div>}{status === "chain-ready" && <div className="market-state market-state--chain"><b>{pair ? `${pair.symbol} is live on Robinhood Chain.` : "Robinhood Chain is connected."}</b><span>Pair discovery and live pricing are connected. Candlestick history will appear when an OHLCV indexer covers Chain ID 4663.</span><a href={pair?.url || "https://robinhoodchain.blockscout.com"} target="_blank" rel="noreferrer">{pair ? "Open live pair" : "Open explorer"} <ArrowSquareOut /></a></div>}{error && <div className="market-state market-state--error">{error}<button type="button" onClick={() => runSearch()}>Try again</button></div>}</div>
  </section>;
}
