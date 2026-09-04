import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BellRinging, BookmarkSimple, ChartLineUp, Check, Copy, Plus, ShieldWarning, SpinnerGap, Trash, UsersThree, X } from "@phosphor-icons/react";
import MarketChart, { NETWORK_LABELS } from "./MarketChart.jsx";
import { Button } from "./ui.jsx";
import { createTokenAlert, deleteTokenAlert, loadSavedTokens, loadTokenActivity, loadTokenAlerts, removeSavedToken, saveToken } from "../services/socialMarkets.js";
import { sendRoomMessage } from "../services/room.js";

const money = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });
const pct = (value) => `${Number(value) >= 0 ? "+" : ""}${Number(value || 0).toFixed(2)}%`;

function TokenMini({ row, selected, onToggle }) {
  const pair = row.snapshot || row;
  return <button type="button" className={`saved-token ${selected ? "active" : ""}`} onClick={onToggle}>
    <span aria-hidden="true">{pair.symbol?.slice(0, 2)}</span>
    <div><strong>{pair.symbol}</strong><small>{NETWORK_LABELS[pair.network] || pair.network}</small></div>
    <em>${money.format(pair.marketCap || 0)}</em>
    <i className={Number(pair.change) >= 0 ? "up" : "down"}>{pct(pair.change)}</i>
  </button>;
}

function CompareBoard({ rows, onRemove }) {
  if (!rows.length) return <div className="market-blank"><ChartLineUp /><strong>Build a comparison.</strong><span>Select up to four saved tokens. FNF compares context, not trade execution.</span></div>;
  const maxMc = Math.max(...rows.map((row) => Number((row.snapshot || row).marketCap || 0)), 1);
  return <div className="compare-board">{rows.map((row) => {
    const pair = row.snapshot || row;
    return <article key={`${row.network}:${row.token_address}`}>
      <header><div><strong>{pair.symbol}</strong><span>{NETWORK_LABELS[pair.network]}</span></div><button onClick={() => onRemove(row)} aria-label={`Remove ${pair.symbol}`}><X /></button></header>
      <div className="compare-meter"><i style={{ width: `${Math.max(4, (Number(pair.marketCap || 0) / maxMc) * 100)}%` }} /></div>
      <dl><div><dt>Market cap</dt><dd>${money.format(pair.marketCap || 0)}</dd></div><div><dt>Liquidity</dt><dd>${money.format(pair.liquidity || 0)}</dd></div><div><dt>24h volume</dt><dd>${money.format(pair.volume || 0)}</dd></div><div><dt>24h</dt><dd className={Number(pair.change) >= 0 ? "up" : "down"}>{pct(pair.change)}</dd></div></dl>
    </article>;
  })}</div>;
}

export default function MarketHub({ crews = [], compact = false, onClose }) {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const routeAddress = pathParts[0] === "token" ? decodeURIComponent(pathParts[2] || "") : "";
  const [pair, setPair] = useState(null);
  const [saved, setSaved] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [compare, setCompare] = useState([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [threshold, setThreshold] = useState("");
  const [direction, setDirection] = useState("above");
  const [roomId, setRoomId] = useState("");
  const [state, setState] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try { const [savedRows, alertRows] = await Promise.all([loadSavedTokens(), loadTokenAlerts()]); setSaved(savedRows); setAlerts(alertRows); }
    catch (cause) { setError(cause.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!pair) return;
    loadTokenActivity(pair.network, pair.tokenAddress).then(setActivity).catch(() => setActivity([]));
    if (!compact) window.history.replaceState({}, "", `/token/${pair.network}/${pair.tokenAddress}`);
    setThreshold(String(Math.round(pair.marketCap || 0)));
  }, [pair?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const isSaved = pair && saved.some((row) => row.network === pair.network && row.token_address.toLowerCase() === pair.tokenAddress.toLowerCase());
  const roomChoices = crews.filter((crew) => crew.membershipRole);
  const save = async () => { if (!pair) return; setError(""); try { if (isSaved) await removeSavedToken(pair.network, pair.tokenAddress); else await saveToken(pair); await refresh(); setState(isSaved ? "Removed from your market shelf." : `${pair.symbol} saved.`); } catch (cause) { setError(cause.message); } };
  const addAlert = async (event) => { event.preventDefault(); if (!pair || !Number(threshold)) return; try { await createTokenAlert(pair, direction, threshold); setAlertOpen(false); await refresh(); setState("Market-cap alert saved."); } catch (cause) { setError(cause.message); } };
  const shareRoom = async () => { const room = roomChoices.find((item) => item.id === roomId); if (!room || !pair) return; try { await sendRoomMessage(room.id, `${pair.symbol} market context · $${money.format(pair.marketCap)} MC · ${pct(pair.change)} today`, "chart", pair); setState(`Shared with ${room.name}.`); } catch (cause) { setError(cause.message); } };
  const toggleCompare = (row) => setCompare((current) => current.some((item) => item.network === row.network && item.token_address === row.token_address) ? current.filter((item) => item !== row) : current.length < 4 ? [...current, row] : current);

  return <div className={`market-hub ${compact ? "market-hub--compact" : ""}`}>
    <header className="market-hub__head"><div><span>MARKET CONTEXT / NO EXECUTION</span><h1>{compact ? "Inspect without leaving." : "Markets belong inside the conversation."}</h1><p>Exact contracts, market-cap charts, risk context and room activity. FNF never places the trade.</p></div>{onClose && <button type="button" onClick={onClose} aria-label="Close market drawer"><X /></button>}</header>
    {error && <div className="app-alert">{error}<button onClick={() => setError("")}>Dismiss</button></div>}{state && <div className="market-confirm"><Check />{state}<button onClick={() => setState("")}><X /></button></div>}
    <MarketChart initialAddress={routeAddress} onPairChange={setPair} />
    {pair && <div className="market-actions">
      <Button variant={isSaved ? "secondary" : "primary"} onClick={save}><BookmarkSimple weight={isSaved ? "fill" : "regular"} />{isSaved ? "Saved" : "Save token"}</Button>
      <Button variant="secondary" onClick={() => setAlertOpen((value) => !value)}><BellRinging />Add MC alert</Button>
      {roomChoices.length > 0 && <div className="market-room-share"><select value={roomId} onChange={(event) => setRoomId(event.target.value)}><option value="">Share to a room…</option>{roomChoices.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}</select><button type="button" disabled={!roomId} onClick={shareRoom}>Send <ArrowRight /></button></div>}
    </div>}
    <AnimatePresence>{alertOpen && pair && <motion.form className="market-alert-form" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onSubmit={addAlert}><div><BellRinging /><span><strong>Alert me when {pair.symbol} MC moves</strong><small>Informational alert only</small></span></div><select value={direction} onChange={(event) => setDirection(event.target.value)}><option value="above">Above</option><option value="below">Below</option></select><label>$<input type="number" min="1" value={threshold} onChange={(event) => setThreshold(event.target.value)} required /></label><Button type="submit">Save alert</Button></motion.form>}</AnimatePresence>
    {!compact && <div className="market-lower">
      <section className="market-panel market-panel--saved"><header><div><span>YOUR SHELF</span><h2>Saved market context.</h2></div>{loading && <SpinnerGap className="animate-spin" />}</header>{saved.length ? <div className="saved-list">{saved.map((row) => <TokenMini key={`${row.network}:${row.token_address}`} row={row} selected={compare.includes(row)} onToggle={() => toggleCompare(row)} />)}</div> : <div className="market-blank"><BookmarkSimple /><strong>Nothing saved yet.</strong><span>Open an exact contract and keep it here for later conversations.</span></div>}</section>
      <section className="market-panel"><header><div><span>COMPARE / UP TO FOUR</span><h2>Put context side by side.</h2></div></header><CompareBoard rows={compare} onRemove={toggleCompare} /></section>
      <section className="market-panel"><header><div><span>PRIVATE SOCIAL LAYER</span><h2>Rooms discussing this token.</h2></div></header>{pair ? activity.length ? <div className="market-activity">{activity.map((item) => <article key={item.message_id}><span><UsersThree />{item.crew_name}</span><p>{item.body}</p><footer>@{item.sender_handle}<time>{new Date(item.created_at).toLocaleString()}</time></footer></article>)}</div> : <div className="market-blank"><UsersThree /><strong>No crew context yet.</strong><span>Share the chart to a room to start a private discussion.</span></div> : <div className="market-blank"><ChartLineUp /><strong>Paste a contract first.</strong><span>Room context appears after the exact token resolves.</span></div>}</section>
      <section className="market-panel"><header><div><span>YOUR ALERTS</span><h2>Meaningful movement only.</h2></div></header>{alerts.length ? <div className="alert-list">{alerts.map((alert) => <article key={alert.id}><BellRinging /><div><strong>{alert.symbol} MC {alert.direction} ${money.format(alert.threshold)}</strong><span>{NETWORK_LABELS[alert.network]} · {alert.active ? "active" : "paused"}</span></div><button onClick={async () => { await deleteTokenAlert(alert.id); refresh(); }} aria-label="Delete alert"><Trash /></button></article>)}</div> : <div className="market-blank"><BellRinging /><strong>No market alerts.</strong><span>Alerts stay informational and never trigger a trade.</span></div>}</section>
    </div>}
    {pair?.security?.reasons?.length > 0 && <div className="market-risk-sheet"><ShieldWarning /><div><strong>Detected contract flags</strong>{pair.security.reasons.map((reason) => <span key={reason}>{reason}</span>)}</div></div>}
  </div>;
}
