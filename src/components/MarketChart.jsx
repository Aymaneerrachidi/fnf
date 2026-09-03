import { useEffect, useMemo, useRef, useState } from "react";
import { CandlestickSeries, ColorType, CrosshairMode, createChart } from "lightweight-charts";
import { MagnifyingGlass, SpinnerGap, TrendUp } from "@phosphor-icons/react";
import { getPoolCandles, searchTokens } from "../services/marketData.js";

const compactMoney = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });

function normalizePair(pair) {
  return {
    id: pair.pairAddress,
    symbol: pair.baseToken?.symbol || "TOKEN",
    name: pair.baseToken?.name || "Solana token",
    quote: pair.quoteToken?.symbol || "USD",
    address: pair.pairAddress,
    price: Number(pair.priceUsd || 0),
    change: Number(pair.priceChange?.h24 || 0),
    liquidity: Number(pair.liquidity?.usd || 0),
    volume: Number(pair.volume?.h24 || 0),
  };
}

export default function MarketChart({ onShare }) {
  const hostRef = useRef(null);
  const [query, setQuery] = useState("SOL");
  const [results, setResults] = useState([]);
  const [pair, setPair] = useState(null);
  const [candles, setCandles] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  const runSearch = async (value = query) => {
    if (value.trim().length < 2) return;
    setStatus("searching");
    setError("");
    try {
      const payload = await searchTokens(value.trim());
      const found = (payload.pairs || []).filter((item) => item.chainId === "solana").map(normalizePair).sort((a, b) => b.liquidity - a.liquidity).slice(0, 6);
      setResults(found);
      if (!pair && found[0]) await choosePair(found[0]);
      else setStatus("ready");
    } catch (cause) {
      setError(cause.message || "Market search is unavailable.");
      setStatus("error");
    }
  };

  const choosePair = async (nextPair) => {
    setPair(nextPair);
    setResults([]);
    setStatus("loading");
    setError("");
    try {
      const payload = await getPoolCandles(nextPair.address, "minute", 5, 240);
      const list = payload?.data?.attributes?.ohlcv_list || [];
      setCandles(list.map(([time, open, high, low, close]) => ({
        time: Number(time), open: Number(open), high: Number(high), low: Number(low), close: Number(close),
      })).sort((a, b) => a.time - b.time));
      setStatus("ready");
    } catch (cause) {
      setError(cause.message || "This chart could not be loaded.");
      setStatus("error");
    }
  };

  useEffect(() => { runSearch("So11111111111111111111111111111111111111112"); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hostRef.current || !candles.length) return undefined;
    const chart = createChart(hostRef.current, {
      width: hostRef.current.clientWidth,
      height: hostRef.current.clientHeight,
      layout: { background: { type: ColorType.Solid, color: "#070708" }, textColor: "#858b98", fontFamily: "Satoshi" },
      grid: { vertLines: { color: "rgba(200,206,216,.055)" }, horzLines: { color: "rgba(200,206,216,.055)" } },
      rightPriceScale: { borderColor: "rgba(200,206,216,.12)", scaleMargins: { top: .12, bottom: .12 } },
      timeScale: { borderColor: "rgba(200,206,216,.12)", timeVisible: true, secondsVisible: false },
      crosshair: { mode: CrosshairMode.Normal, vertLine: { color: "#ff3bbe88" }, horzLine: { color: "#a9b1ff66" } },
      localization: { priceFormatter: (value) => value < .01 ? value.toPrecision(4) : value.toFixed(2) },
    });
    const series = chart.addSeries(CandlestickSeries, {
      upColor: "#ff3bbe", downColor: "#596bff", borderVisible: false, wickUpColor: "#ff74d3", wickDownColor: "#8d9aff",
    });
    series.setData(candles);
    chart.timeScale().fitContent();
    const observer = new ResizeObserver(([entry]) => chart.resize(entry.contentRect.width, entry.contentRect.height));
    observer.observe(hostRef.current);
    return () => { observer.disconnect(); chart.remove(); };
  }, [candles]);

  const price = useMemo(() => pair?.price ? (pair.price < .01 ? `$${pair.price.toPrecision(4)}` : `$${pair.price.toLocaleString(undefined, { maximumFractionDigits: 4 })}`) : "—", [pair]);

  return (
    <section className="market-desk" aria-label="Solana market chart">
      <header className="market-desk__bar">
        <div className="market-symbol">
          <span className="market-symbol__icon"><TrendUp size={16} weight="bold" /></span>
          <div><strong>{pair ? `${pair.symbol} / ${pair.quote}` : "Solana market"}</strong><small>{pair?.name || "Search a token or contract"}</small></div>
        </div>
        {pair && <div className="market-price"><strong>{price}</strong><span className={pair.change >= 0 ? "is-up" : "is-down"}>{pair.change >= 0 ? "+" : ""}{pair.change.toFixed(2)}%</span></div>}
        <form className="market-search" onSubmit={(event) => { event.preventDefault(); runSearch(); }}>
          <MagnifyingGlass size={15} weight="bold" />
          <input aria-label="Search Solana tokens" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticker or contract" />
          <button type="submit" aria-label="Search"><span>↵</span></button>
          {results.length > 0 && <div className="market-results">{results.map((item) => <button key={item.id} type="button" onClick={() => choosePair(item)}><span><b>{item.symbol}</b><small>{item.name}</small></span><em>${compactMoney.format(item.liquidity)} liq</em></button>)}</div>}
        </form>
      </header>
      <div className="market-desk__meta">
        <span>5m candles</span><span>24h vol {pair ? `$${compactMoney.format(pair.volume)}` : "—"}</span><span>liquidity {pair ? `$${compactMoney.format(pair.liquidity)}` : "—"}</span>
        {pair && <button type="button" onClick={() => onShare?.(pair)}>Post chart to room</button>}
      </div>
      <div className="market-chart" ref={hostRef}>
        {(status === "loading" || status === "searching") && <div className="market-state"><SpinnerGap className="animate-spin" size={22} />Loading live market…</div>}
        {error && <div className="market-state market-state--error">{error}<button type="button" onClick={() => runSearch()}>Try again</button></div>}
      </div>
    </section>
  );
}
