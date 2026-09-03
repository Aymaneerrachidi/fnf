import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bell, Check, CirclesThreePlus, Compass, Gear, House, MagnifyingGlass, Plus, SignOut, SpinnerGap, UsersThree, X } from "@phosphor-icons/react";
import { FILTERS } from "../data.js";
import { Button, Mark } from "./ui.jsx";
import { decideSeatRequest, loadCrewRequests } from "../services/crews.js";
import { loadProfile, saveProfile } from "../services/profile.js";

const TABS = [
  ["home", "Home", House], ["discover", "Discover", Compass], ["rooms", "My rooms", UsersThree], ["requests", "Requests", Bell], ["settings", "Profile", Gear],
];

function RoomTile({ crew, onOpen, onEnter }) {
  const open = Math.max(0, crew.seats - crew.members);
  return <article className="app-room-card">
    <button className="app-room-card__body" type="button" onClick={() => onOpen(crew)}>
      <div className="app-room-card__head"><Mark name={crew.name} size={44} tone={crew.membershipRole ? "volt" : "ink"} /><span>{crew.membershipRole || crew.requestStatus || `${open} open`}</span></div>
      <h3>{crew.name}</h3><p>{crew.thesis}</p>
      <div className="app-room-card__tags"><span>{crew.trading}</span><span>{crew.lang}</span><span>{crew.hours}</span></div>
      <footer><span>{crew.members} / {crew.seats} seats</span><span>{crew.live} live</span></footer>
    </button>
    {crew.membershipRole && <button className="app-room-card__enter" type="button" onClick={() => onEnter(crew)}>{crew.membershipRole === "owner" ? "Manage room" : "Enter room"}<ArrowRight /></button>}
  </article>;
}

function HomeTab({ profile, crews, onTab, onEnter, onOpen, onCreate }) {
  const rooms = crews.filter((crew) => crew.membershipRole);
  const pending = crews.reduce((sum, crew) => sum + crew.pendingRequests, 0);
  return <div className="app-page">
    <header className="app-hero"><div><span className="app-eyebrow">YOUR FNF DESK</span><h1>{profile ? `Good to see you, ${profile.display_name.split(" ")[0]}.` : "Your rooms, in one place."}</h1><p>Find the people you want beside you when the chart gets loud.</p></div><Button onClick={onCreate}><Plus />Start a crew</Button></header>
    <div className="app-snapshot"><button onClick={() => onTab("rooms")}><span>Rooms you can enter</span><strong>{rooms.length}</strong><small>{rooms.length ? "Your crews are ready" : "Find your first crew"}</small></button><button onClick={() => onTab("requests")}><span>Seat requests</span><strong>{pending}</strong><small>{pending ? "Waiting for your answer" : "Nothing waiting"}</small></button><button onClick={() => onTab("discover")}><span>Open rooms</span><strong>{crews.filter((crew) => crew.members < crew.seats).length}</strong><small>Matched to the board</small></button></div>
    <section className="app-section"><div className="app-section__title"><div><span>YOUR CIRCLES</span><h2>Pick up where the room left off.</h2></div><button onClick={() => onTab("rooms")}>See all <ArrowRight /></button></div>{rooms.length ? <div className="app-room-grid">{rooms.slice(0, 3).map((crew) => <RoomTile key={crew.id} crew={crew} onOpen={onOpen} onEnter={onEnter} />)}</div> : <div className="app-empty-card"><CirclesThreePlus size={34} /><h3>No room yet.</h3><p>Browse rooms by trading style, language, and active hours.</p><Button onClick={() => onTab("discover")}>Find a crew</Button></div>}</section>
  </div>;
}

function DiscoverTab({ crews, onOpen, onEnter }) {
  const [query, setQuery] = useState(""); const [trading, setTrading] = useState("All");
  const shown = useMemo(() => crews.filter((crew) => (trading === "All" || crew.trading === trading) && (!query.trim() || [crew.name, crew.thesis, crew.lang, crew.hours].join(" ").toLowerCase().includes(query.toLowerCase()))), [crews, query, trading]);
  return <div className="app-page"><header className="app-page-title"><span>THE BOARD</span><h1>Find your trading crew.</h1><p>Read the thesis before anybody reads your wallet.</p></header><div className="app-filter"><label><MagnifyingGlass /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rooms, thesis, or language" /></label><div>{["All", ...FILTERS[0].options].map((item) => <button className={trading === item ? "active" : ""} onClick={() => setTrading(item)} key={item}>{item}</button>)}</div><span>{shown.length} matched</span></div>{shown.length ? <div className="app-room-grid">{shown.map((crew) => <RoomTile key={crew.id} crew={crew} onOpen={onOpen} onEnter={onEnter} />)}</div> : <div className="app-empty-card"><MagnifyingGlass size={32} /><h3>No room matches that.</h3><p>Clear the search or try another trading style.</p></div>}</div>;
}

function RoomsTab({ crews, onOpen, onEnter, onCreate }) {
  const rooms = crews.filter((crew) => crew.membershipRole);
  return <div className="app-page"><header className="app-page-title app-page-title--action"><div><span>PRIVATE CIRCLES</span><h1>My rooms.</h1><p>Rooms you own or have been accepted into.</p></div><Button onClick={onCreate}><Plus />Start a crew</Button></header>{rooms.length ? <div className="app-room-grid">{rooms.map((crew) => <RoomTile key={crew.id} crew={crew} onOpen={onOpen} onEnter={onEnter} />)}</div> : <div className="app-empty-card"><UsersThree size={34} /><h3>You are not in a room yet.</h3><p>Request an open seat or start the room you wish existed.</p></div>}</div>;
}

function RequestsTab({ crews, onChanged }) {
  const owned = crews.filter((crew) => crew.membershipRole === "owner"); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(null); const [error, setError] = useState("");
  const refresh = async () => { setLoading(true); try { const groups = await Promise.all(owned.map(async (crew) => ({ crew, requests: await loadCrewRequests(crew.id) }))); setItems(groups.flatMap(({ crew, requests }) => requests.filter((request) => request.status === "pending").map((request) => ({ ...request, crew })))); } catch (cause) { setError(cause.message); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, [crews.length]); // eslint-disable-line react-hooks/exhaustive-deps
  const decide = async (item, decision) => { setBusy(item.id + decision); try { await decideSeatRequest(item.id, decision); await refresh(); onChanged(); } catch (cause) { setError(cause.message); } finally { setBusy(null); } };
  return <div className="app-page"><header className="app-page-title"><span>OWNER INBOX</span><h1>Seat requests.</h1><p>Approve the fit, not the follower count.</p></header>{error && <div className="app-alert">{error}</div>}{loading ? <div className="app-loading"><SpinnerGap className="animate-spin" />Loading requests…</div> : items.length ? <div className="app-request-list">{items.map((item) => <article key={item.id}><div className="app-request-list__person"><Mark name={item.display_name} size={46} /><div><strong>{item.display_name}</strong><span>@{item.handle} wants to join {item.crew.name}</span></div></div><div className="app-request-list__fit"><span>{item.trading}</span><span>{item.language}</span><span>{item.market_hours}</span><span>{item.voice_preference}</span></div><p>{item.note || "No note added."}</p><footer><Button variant="secondary" onClick={() => decide(item, "declined")} disabled={Boolean(busy)}>{busy === item.id + "declined" ? <SpinnerGap className="animate-spin" /> : <X />}Decline</Button><Button onClick={() => decide(item, "accepted")} disabled={Boolean(busy)}>{busy === item.id + "accepted" ? <SpinnerGap className="animate-spin" /> : <Check />}Approve seat</Button></footer></article>)}</div> : <div className="app-empty-card"><Check size={34} /><h3>Your inbox is clear.</h3><p>New requests to rooms you own will show up here.</p></div>}</div>;
}

function SettingsTab({ session, onProfileChanged }) {
  const [values, setValues] = useState(null); const [saving, setSaving] = useState(false); const [state, setState] = useState(""); const [error, setError] = useState("");
  useEffect(() => { loadProfile().then((profile) => setValues({ displayName: profile.display_name, handle: profile.handle, trading: profile.trading, language: profile.language, hours: profile.market_hours, voice: profile.voice_preference, bio: profile.bio || "" })).catch((cause) => setError(cause.message)); }, []);
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(""); setState(""); try { const profile = await saveProfile(values); onProfileChanged(profile); setState("Profile saved."); } catch (cause) { setError(cause.message); } finally { setSaving(false); } };
  if (!values) return <div className="app-loading"><SpinnerGap className="animate-spin" />Loading profile…</div>;
  return <div className="app-page"><header className="app-page-title"><span>YOUR MATCHING PROFILE</span><h1>Profile.</h1><p>This is what room owners see when you request a seat.</p></header><form className="profile-form" onSubmit={submit}><div className="profile-form__identity"><Mark name={values.displayName || "FNF"} tone="volt" size={68} /><div><strong>{values.displayName}</strong><span>{session.user.email}</span></div></div>{error && <p className="app-alert">{error}</p>}{state && <p className="app-success">{state}</p>}<div className="profile-fields"><label><span>Display name</span><input value={values.displayName} onChange={set("displayName")} minLength="2" maxLength="40" required /></label><label><span>Handle</span><div className="handle-input"><i>@</i><input value={values.handle} onChange={set("handle")} pattern="[a-z0-9_]{3,24}" required /></div></label><label><span>Trading</span><select value={values.trading} onChange={set("trading")}>{FILTERS[0].options.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Language</span><select value={values.language} onChange={set("language")}>{FILTERS[1].options.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Market hours</span><select value={values.hours} onChange={set("hours")}>{FILTERS[2].options.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Room preference</span><select value={values.voice} onChange={set("voice")}>{FILTERS[3].options.map((item) => <option key={item}>{item}</option>)}</select></label><label className="profile-fields__wide"><span>What you bring to a room</span><textarea value={values.bio} onChange={set("bio")} maxLength="280" rows="4" placeholder="Risk style, research edge, and what you want from a crew." /></label></div><footer><Button type="submit" disabled={saving}>{saving ? <><SpinnerGap className="animate-spin" />Saving</> : "Save profile"}</Button></footer></form></div>;
}

export default function ProductApp({ session, crews, loading, onRefresh, onOpenCrew, onEnterRoom, onCreate, onSignOut }) {
  const [tab, setTab] = useState("home"); const [profile, setProfile] = useState(null); const pending = crews.reduce((sum, crew) => sum + crew.pendingRequests, 0);
  useEffect(() => { loadProfile().then(setProfile).catch(console.error); }, [session.user.id]);
  let page = <HomeTab profile={profile} crews={crews} onTab={setTab} onEnter={onEnterRoom} onOpen={onOpenCrew} onCreate={onCreate} />;
  if (tab === "discover") page = <DiscoverTab crews={crews} onOpen={onOpenCrew} onEnter={onEnterRoom} />;
  if (tab === "rooms") page = <RoomsTab crews={crews} onOpen={onOpenCrew} onEnter={onEnterRoom} onCreate={onCreate} />;
  if (tab === "requests") page = <RequestsTab crews={crews} onChanged={onRefresh} />;
  if (tab === "settings") page = <SettingsTab session={session} onProfileChanged={setProfile} />;
  return <div className="product-app"><aside className="app-sidebar"><button className="app-logo" onClick={() => setTab("home")}>FNF<span>●</span></button><nav>{TABS.map(([id, label, Icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon weight={tab === id ? "fill" : "regular"} /><span>{label}</span>{id === "requests" && pending > 0 && <b>{pending}</b>}</button>)}</nav><div className="app-sidebar__account"><button onClick={() => setTab("settings")}><Mark name={profile?.display_name || session.user.email || "FNF"} size={38} /><span><strong>{profile?.display_name || "FNF trader"}</strong><small>@{profile?.handle || "loading"}</small></span></button><button onClick={onSignOut} aria-label="Sign out"><SignOut /></button></div></aside><header className="app-mobile-head"><button className="app-logo" onClick={() => setTab("home")}>FNF<span>●</span></button><button onClick={onCreate}><Plus />Crew</button></header><main className="app-canvas">{loading && <div className="app-sync"><SpinnerGap className="animate-spin" />Syncing</div>}<AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .24 }}>{page}</motion.div></AnimatePresence></main><nav className="app-mobile-nav">{TABS.slice(0, 5).map(([id, label, Icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon /><span>{label}</span>{id === "requests" && pending > 0 && <b>{pending}</b>}</button>)}</nav></div>;
}
