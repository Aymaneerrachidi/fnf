import { useEffect, useMemo, useState } from "react";
import { BellRinging, CalendarBlank, ChartLineUp, Check, Clock, Plus, SpinnerGap, Trash, UsersThree, X } from "@phosphor-icons/react";
import { Button } from "./ui.jsx";
import { addCrewWatch, createCrewEvent, createRoomPoll, loadCrewEvents, loadCrewWatchlist, loadRoomPolls, removeCrewWatch, updateCrewWatch, voteRoomPoll } from "../services/socialMarkets.js";

const money = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 2 });

export function CrewWatchboard({ crew, currentPair, onOpenChart }) {
  const [items, setItems] = useState([]); const [note, setNote] = useState(""); const [sentiment, setSentiment] = useState("watching"); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const refresh = () => loadCrewWatchlist(crew.id).then(setItems).catch((cause) => setError(cause.message));
  useEffect(() => { refresh(); }, [crew.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const add = async () => { if (!currentPair) return; setBusy(true); try { await addCrewWatch(crew.id, currentPair, note, sentiment); setNote(""); await refresh(); } catch (cause) { setError(cause.message); } finally { setBusy(false); } };
  return <div className="room-extra"><header><div><span>CREW WATCHBOARD</span><h3>What the room is discussing.</h3></div><b>{items.length}</b></header>{error && <p className="room-inline-error">{error}</p>}
    {currentPair && <div className="watch-add"><div><strong>{currentPair.symbol}</strong><span>${money.format(currentPair.marketCap)} MC · {currentPair.network}</span></div><select value={sentiment} onChange={(event) => setSentiment(event.target.value)}><option value="watching">Watching</option><option value="interesting">Interesting</option><option value="research">Needs research</option><option value="risky">Too risky</option><option value="dead">Dead</option></select><input value={note} onChange={(event) => setNote(event.target.value)} maxLength="280" placeholder="Why is the room watching?" /><Button size="sm" onClick={add} disabled={busy}>{busy ? <SpinnerGap className="animate-spin" /> : <Plus />}Add current chart</Button></div>}
    {!currentPair && <div className="room-empty"><ChartLineUp /><strong>Open a contract first.</strong><span>The current chart can be added here with room context.</span></div>}
    <div className="watch-list">{items.map((item) => { const pair = item.snapshot || {}; return <article key={item.id}><button className="watch-list__main" onClick={() => onOpenChart({ ...pair, address: item.pool_address, tokenAddress: item.token_address, network: item.network, shareId: `watch-${item.id}` })}><span>{item.symbol.slice(0, 2)}</span><div><strong>{item.symbol}</strong><small>{item.note || "No note yet."}</small></div><em>${money.format(pair.marketCap || 0)}</em></button><footer><select value={item.sentiment} onChange={async (event) => { await updateCrewWatch(item.id, { sentiment: event.target.value }); refresh(); }}><option value="watching">Watching</option><option value="interesting">Interesting</option><option value="research">Needs research</option><option value="risky">Too risky</option><option value="dead">Dead</option></select><button onClick={async () => { await removeCrewWatch(item.id); refresh(); }}><Trash /></button></footer></article>; })}</div>
  </div>;
}

export function CrewEvents({ crew, canCreate, onJoin }) {
  const [items, setItems] = useState([]); const [open, setOpen] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  const [values, setValues] = useState({ title: "", description: "", startsAt: "", duration: "60", type: "voice" });
  const refresh = () => loadCrewEvents(crew.id).then(setItems).catch((cause) => setError(cause.message));
  useEffect(() => { refresh(); }, [crew.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = async (event) => { event.preventDefault(); setBusy(true); try { await createCrewEvent(crew.id, values); setOpen(false); setValues({ title: "", description: "", startsAt: "", duration: "60", type: "voice" }); await refresh(); } catch (cause) { setError(cause.message); } finally { setBusy(false); } };
  return <div className="room-extra room-events"><header><div><span>ROOM RITUALS</span><h3>Upcoming sessions.</h3></div>{canCreate && <button onClick={() => setOpen((value) => !value)}><Plus />Schedule</button>}</header>{error && <p className="room-inline-error">{error}</p>}
    {open && <form className="event-form" onSubmit={submit}><label><span>Session name</span><input required minLength="3" maxLength="80" value={values.title} onChange={(event) => setValues({ ...values, title: event.target.value })} placeholder="Sunday room thesis" /></label><label><span>Starts</span><input required type="datetime-local" value={values.startsAt} onChange={(event) => setValues({ ...values, startsAt: event.target.value })} /></label><label><span>Type</span><select value={values.type} onChange={(event) => setValues({ ...values, type: event.target.value })}><option value="voice">Voice room</option><option value="discussion">Thesis discussion</option><option value="research">Research session</option><option value="hangout">Crew hangout</option></select></label><label><span>Minutes</span><select value={values.duration} onChange={(event) => setValues({ ...values, duration: event.target.value })}>{[30,45,60,90,120].map((value) => <option key={value}>{value}</option>)}</select></label><label className="event-form__wide"><span>Context</span><textarea rows="3" maxLength="500" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} placeholder="What should everyone bring?" /></label><Button type="submit" disabled={busy}>{busy ? <SpinnerGap className="animate-spin" /> : <CalendarBlank />}Schedule session</Button></form>}
    {items.length ? <div className="event-list">{items.map((item) => <article key={item.id}><div className="event-date"><strong>{new Date(item.starts_at).toLocaleDateString([], { day: "2-digit" })}</strong><span>{new Date(item.starts_at).toLocaleDateString([], { month: "short" })}</span></div><div><span>{item.event_type} · {item.duration_minutes} min</span><h4>{item.title}</h4><p>{item.description || "Room session"}</p><small><Clock />{new Date(item.starts_at).toLocaleString()}</small></div><Button size="sm" onClick={onJoin}>Enter room</Button></article>)}</div> : <div className="room-empty"><CalendarBlank /><strong>No session scheduled.</strong><span>Room leads can turn recurring conversations into rituals.</span></div>}
  </div>;
}

export function PollBlock({ poll, onVoted }) {
  const total = useMemo(() => poll.options.reduce((sum, option) => sum + Number(option.votes), 0), [poll]);
  return <div className="feed-poll"><strong>{poll.question}</strong><div>{poll.options.map((option) => <button className={option.mine ? "active" : ""} key={option.id} onClick={async () => { await voteRoomPoll(poll.id, option.id); onVoted(); }}><span>{option.label}</span><i style={{ width: `${total ? (Number(option.votes) / total) * 100 : 0}%` }} /><em>{option.votes}</em></button>)}</div><small>{total} {total === 1 ? "vote" : "votes"}</small></div>;
}

export function PollComposer({ crew, onCreated, onClose }) {
  const [question, setQuestion] = useState(""); const [options, setOptions] = useState(["", ""]); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  const submit = async (event) => { event.preventDefault(); setBusy(true); try { await createRoomPoll(crew.id, question, options.filter((value) => value.trim())); onCreated(); onClose(); } catch (cause) { setError(cause.message); } finally { setBusy(false); } };
  return <div className="poll-composer"><header><strong>Ask the room</strong><button onClick={onClose}><X /></button></header>{error && <p>{error}</p>}<form onSubmit={submit}><input value={question} onChange={(event) => setQuestion(event.target.value)} minLength="3" maxLength="180" required placeholder="What should the room discuss next?" />{options.map((value, index) => <input key={index} value={value} onChange={(event) => setOptions((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))} required placeholder={`Option ${index + 1}`} />)}{options.length < 5 && <button type="button" onClick={() => setOptions([...options, ""])}><Plus />Add option</button>}<Button type="submit" disabled={busy}>{busy ? <SpinnerGap className="animate-spin" /> : <Check />}Post poll</Button></form></div>;
}

export function usePolls(crewId) {
  const [polls, setPolls] = useState([]);
  const refresh = () => loadRoomPolls(crewId).then(setPolls).catch(console.error);
  useEffect(() => { refresh(); }, [crewId]); // eslint-disable-line react-hooks/exhaustive-deps
  return { polls, refresh };
}

