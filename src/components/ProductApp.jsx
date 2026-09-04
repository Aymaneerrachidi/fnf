import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Bell, Check, CirclesThreePlus, Compass, Gear, House, MagnifyingGlass, Plus, SignOut, SpinnerGap, Tray, UsersThree, X } from "@phosphor-icons/react";
import { FILTERS } from "../data.js";
import { Button, Mark } from "./ui.jsx";
import { decideSeatRequest, loadCrewRequests } from "../services/crews.js";
import { loadProfile, saveProfile } from "../services/profile.js";
import { loadNotifications, markAllNotificationsRead, markNotificationRead, subscribeToNotifications } from "../services/notifications.js";
import { uploadImage } from "../services/uploads.js";

const TABS = [
  ["home", "Home", House, "/app"],
  ["discover", "Discover", Compass, "/discover"],
  ["rooms", "My rooms", UsersThree, "/rooms"],
  ["requests", "Requests", Tray, "/requests"],
  ["activity", "Activity", Bell, "/notifications"],
  ["settings", "Profile", Gear, "/profile"],
];

function Avatar({ src, name, size = 44, tone }) {
  return src ? <img className="fnf-avatar" src={src} alt="" style={{ width: size, height: size }} /> : <Mark name={name} size={size} tone={tone} />;
}

function RoomTile({ crew, onOpen, onEnter }) {
  const open = Math.max(0, crew.seats - crew.members);
  return <article className="app-room-card">
    <button className="app-room-card__body" type="button" onClick={() => onOpen(crew)}>
      <div className="app-room-card__head"><Avatar src={crew.avatarUrl} name={crew.name} size={44} tone={crew.membershipRole ? "volt" : "ink"} /><span>{crew.membershipRole || crew.requestStatus || `${open} open`}</span></div>
      <h3>{crew.name}</h3><p>{crew.thesis}</p>
      <div className="app-room-card__tags"><span>{crew.trading}</span><span>{crew.lang}</span><span>{crew.hours}</span></div>
      <footer><span>{crew.members} / {crew.seats} seats</span><span>{open > 0 ? `${open} open` : "room full"}</span></footer>
    </button>
    {crew.membershipRole && <button className="app-room-card__enter" type="button" onClick={() => onEnter(crew)}>{crew.membershipRole === "owner" ? "Manage room" : "Enter room"}<ArrowRight /></button>}
  </article>;
}

function HomeTab({ profile, crews, onTab, onEnter, onOpen, onCreate }) {
  const rooms = crews.filter((crew) => crew.membershipRole);
  const pending = crews.reduce((sum, crew) => sum + crew.pendingRequests, 0);
  return <div className="app-page">
    <header className="app-hero"><img className="app-hero__media" src="/assets/fnf-brand-hero-chrome-v3.png" alt="" aria-hidden="true" /><div className="app-hero__veil" aria-hidden="true" /><div className="app-hero__copy"><span className="app-eyebrow">FNF / YOUR PRIVATE DESK</span><h1>{profile ? `Trade with your people, ${profile.display_name.split(" ")[0]}.` : "Your rooms, in one place."}</h1><p>Your rooms, seat requests, and exact contract charts—without the follower-count noise.</p><Button onClick={onCreate}><Plus />Start a crew</Button></div></header>
    <div className="app-snapshot"><button onClick={() => onTab("rooms")}><span>Rooms you can enter</span><strong>{rooms.length}</strong><small>{rooms.length ? "Your crews are ready" : "Find your first crew"}</small></button><button onClick={() => onTab("requests")}><span>Seat requests</span><strong>{pending}</strong><small>{pending ? "Waiting for your answer" : "Nothing waiting"}</small></button><button onClick={() => onTab("discover")}><span>Open rooms</span><strong>{crews.filter((crew) => crew.members < crew.seats).length}</strong><small>Real rooms on the board</small></button></div>
    <section className="app-section"><div className="app-section__title"><div><span>YOUR CIRCLES</span><h2>Pick up where the room left off.</h2></div><button onClick={() => onTab("rooms")}>See all <ArrowRight /></button></div>{rooms.length ? <div className="app-room-grid">{rooms.slice(0, 3).map((crew) => <RoomTile key={crew.id} crew={crew} onOpen={onOpen} onEnter={onEnter} />)}</div> : <div className="app-empty-card"><CirclesThreePlus size={34} /><h3>No room yet.</h3><p>Browse real rooms by trading style, language, and active hours.</p><Button onClick={() => onTab("discover")}>Find a crew</Button></div>}</section>
  </div>;
}

function DiscoverTab({ crews, onOpen, onEnter, onCreate }) {
  const [query, setQuery] = useState(""); const [trading, setTrading] = useState("All");
  const shown = useMemo(() => crews.filter((crew) => (trading === "All" || crew.trading === trading) && (!query.trim() || [crew.name, crew.thesis, crew.description, crew.lang, crew.hours].join(" ").toLowerCase().includes(query.toLowerCase()))), [crews, query, trading]);
  return <div className="app-page"><header className="app-page-title"><span>THE BOARD</span><h1>Find your trading crew.</h1><p>Every room here was opened by a real FNF member.</p></header><div className="app-filter"><label><MagnifyingGlass /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search rooms, thesis, or language" /></label><div>{["All", ...FILTERS[0].options].map((item) => <button className={trading === item ? "active" : ""} onClick={() => setTrading(item)} key={item}>{item}</button>)}</div><span>{shown.length} matched</span></div>{shown.length ? <div className="app-room-grid">{shown.map((crew) => <RoomTile key={crew.id} crew={crew} onOpen={onOpen} onEnter={onEnter} />)}</div> : <div className="app-empty-card"><MagnifyingGlass size={32} /><h3>{crews.length ? "No room matches that." : "The board is fresh."}</h3><p>{crews.length ? "Clear the search or try another trading style." : "Open the first real room and make the thesis worth joining."}</p>{!crews.length && <Button onClick={onCreate}>Start a crew</Button>}</div>}</div>;
}

function RoomsTab({ crews, onOpen, onEnter, onCreate }) {
  const rooms = crews.filter((crew) => crew.membershipRole);
  return <div className="app-page"><header className="app-page-title app-page-title--action"><div><span>PRIVATE CIRCLES</span><h1>My rooms.</h1><p>Rooms you own or have been accepted into.</p></div><Button onClick={onCreate}><Plus />Start a crew</Button></header>{rooms.length ? <div className="app-room-grid">{rooms.map((crew) => <RoomTile key={crew.id} crew={crew} onOpen={onOpen} onEnter={onEnter} />)}</div> : <div className="app-empty-card"><UsersThree size={34} /><h3>You are not in a room yet.</h3><p>Request an open seat or start the room you wish existed.</p></div>}</div>;
}

function RequestsTab({ crews, onChanged }) {
  const owned = crews.filter((crew) => crew.membershipRole === "owner"); const [items, setItems] = useState([]); const [loading, setLoading] = useState(true); const [busy, setBusy] = useState(null); const [error, setError] = useState("");
  const refresh = async () => { setLoading(true); try { const groups = await Promise.all(owned.map(async (crew) => ({ crew, requests: await loadCrewRequests(crew.id) }))); setItems(groups.flatMap(({ crew, requests }) => requests.filter((request) => request.status === "pending").map((request) => ({ ...request, crew })))); } catch (cause) { setError(cause.message); } finally { setLoading(false); } };
  useEffect(() => { refresh(); }, [crews]); // eslint-disable-line react-hooks/exhaustive-deps
  const decide = async (item, decision) => { setBusy(item.id + decision); try { await decideSeatRequest(item.id, decision); await refresh(); onChanged(); } catch (cause) { setError(cause.message); } finally { setBusy(null); } };
  return <div className="app-page"><header className="app-page-title"><span>OWNER INBOX</span><h1>Seat requests.</h1><p>Approve the fit, not the follower count.</p></header>{error && <div className="app-alert">{error}</div>}{loading ? <div className="app-loading"><SpinnerGap className="animate-spin" />Loading requests…</div> : items.length ? <div className="app-request-list">{items.map((item) => <article key={item.id}><div className="app-request-list__person"><Avatar src={item.avatar_url} name={item.display_name} size={46} /><div><strong>{item.display_name}</strong><span>@{item.handle} wants to join {item.crew.name}</span></div></div><div className="app-request-list__fit"><span>{item.trading}</span><span>{item.language}</span><span>{item.market_hours}</span><span>{item.voice_preference}</span></div><p>{item.note || item.bio || "No note added."}</p><footer><Button variant="secondary" onClick={() => decide(item, "declined")} disabled={Boolean(busy)}>{busy === item.id + "declined" ? <SpinnerGap className="animate-spin" /> : <X />}Decline</Button><Button onClick={() => decide(item, "accepted")} disabled={Boolean(busy)}>{busy === item.id + "accepted" ? <SpinnerGap className="animate-spin" /> : <Check />}Approve seat</Button></footer></article>)}</div> : <div className="app-empty-card"><Check size={34} /><h3>Your inbox is clear.</h3><p>New requests appear here instantly.</p></div>}</div>;
}

function ActivityTab({ notifications, onOpen, onReadAll }) {
  const unread = notifications.filter((item) => !item.read_at).length;
  return <div className="app-page"><header className="app-page-title app-page-title--action"><div><span>LIVE ACTIVITY</span><h1>Notifications.</h1><p>Seat decisions and chart handoffs arrive here in real time.</p></div>{unread > 0 && <Button variant="secondary" onClick={onReadAll}>Mark all read</Button>}</header>{notifications.length ? <div className="notification-list">{notifications.map((item) => <button type="button" key={item.id} className={!item.read_at ? "is-unread" : ""} onClick={() => onOpen(item)}><i /><div><strong>{item.title}</strong><p>{item.body}</p><span>{new Date(item.created_at).toLocaleString()}</span></div><ArrowRight /></button>)}</div> : <div className="app-empty-card"><Bell size={34} /><h3>Quiet for now.</h3><p>Approvals, requests, and direct chart shares will appear here.</p></div>}</div>;
}

function SettingsTab({ session, onProfileChanged }) {
  const [values, setValues] = useState(null); const [saving, setSaving] = useState(false); const [state, setState] = useState(""); const [error, setError] = useState(""); const [image, setImage] = useState(null);
  useEffect(() => { loadProfile().then((profile) => setValues({ displayName: profile.display_name, handle: profile.handle, avatarUrl: profile.avatar_url || "", socialUrl: profile.social_url || "", trading: profile.trading, language: profile.language, hours: profile.market_hours, voice: profile.voice_preference, bio: profile.bio || "" })).catch((cause) => setError(cause.message)); }, []);
  const imagePreview = useMemo(() => image ? URL.createObjectURL(image) : values?.avatarUrl, [image, values?.avatarUrl]);
  useEffect(() => () => { if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview); }, [imagePreview]);
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const submit = async (event) => { event.preventDefault(); setSaving(true); setError(""); setState(""); try { const avatarUrl = image ? await uploadImage(image, "profiles") : values.avatarUrl; const profile = await saveProfile({ ...values, avatarUrl }); setValues((current) => ({ ...current, avatarUrl })); setImage(null); onProfileChanged(profile); setState("Profile saved."); } catch (cause) { setError(cause.message); } finally { setSaving(false); } };
  if (!values) return <div className="app-loading"><SpinnerGap className="animate-spin" />Loading profile…</div>;
  return <div className="app-page"><header className="app-page-title"><span>YOUR MATCHING PROFILE</span><h1>Profile.</h1><p>Connected accounts can fill this automatically. You control what rooms see.</p></header><form className="profile-form" onSubmit={submit}><div className="profile-form__identity"><Avatar src={imagePreview} name={values.displayName || "FNF"} tone="volt" size={68} /><div><strong>{values.displayName}</strong><span>{session.user.email}</span><label className="profile-photo-key">{image ? "Photo ready" : "Change photo"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => setImage(event.target.files?.[0] || null)} /></label></div></div>{error && <p className="app-alert">{error}</p>}{state && <p className="app-success">{state}</p>}<div className="profile-fields"><label><span>Display name</span><input value={values.displayName} onChange={set("displayName")} minLength="2" maxLength="40" required /></label><label><span>Handle</span><div className="handle-input"><i>@</i><input value={values.handle} onChange={set("handle")} pattern="[a-z0-9_]{3,24}" required /></div></label><label className="profile-fields__wide"><span>Social link</span><input type="url" value={values.socialUrl} onChange={set("socialUrl")} placeholder="https://x.com/yourhandle" /></label><label><span>Trading</span><select value={values.trading} onChange={set("trading")}>{FILTERS[0].options.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Language</span><select value={values.language} onChange={set("language")}>{FILTERS[1].options.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Market hours</span><select value={values.hours} onChange={set("hours")}>{FILTERS[2].options.map((item) => <option key={item}>{item}</option>)}</select></label><label><span>Room preference</span><select value={values.voice} onChange={set("voice")}>{FILTERS[3].options.map((item) => <option key={item}>{item}</option>)}</select></label><label className="profile-fields__wide"><span>What you bring to a room</span><textarea value={values.bio} onChange={set("bio")} maxLength="280" rows="4" placeholder="Risk style, research edge, and what you want from a crew." /></label></div><footer><Button type="submit" disabled={saving}>{saving ? <><SpinnerGap className="animate-spin" />Saving</> : "Save profile"}</Button></footer></form></div>;
}

export default function ProductApp({ session, crews, loading, onRefresh, onOpenCrew, onEnterRoom, onCreate, onSignOut }) {
  const location = useLocation(); const navigate = useNavigate();
  const tab = TABS.find((item) => item[3] === location.pathname)?.[0] || "home";
  const go = (id) => navigate(TABS.find((item) => item[0] === id)?.[3] || "/app");
  const [profile, setProfile] = useState(null); const [notifications, setNotifications] = useState([]); const [toast, setToast] = useState(null);
  const pending = crews.reduce((sum, crew) => sum + crew.pendingRequests, 0); const unread = notifications.filter((item) => !item.read_at).length;
  useEffect(() => { loadProfile().then(setProfile).catch(console.error); }, [session.user.id]);
  useEffect(() => { loadNotifications().then(setNotifications).catch(console.error); return subscribeToNotifications(session.user.id, (item) => { setNotifications((current) => [item, ...current]); setToast(item); if (["seat_request", "seat_accepted", "seat_declined", "member_removed"].includes(item.type)) onRefresh(); }); }, [session.user.id, onRefresh]);
  useEffect(() => { if (!toast) return undefined; const timer = window.setTimeout(() => setToast(null), 6500); return () => window.clearTimeout(timer); }, [toast]);

  const openNotification = async (item) => {
    if (!item.read_at) { await markNotificationRead(item.id); setNotifications((current) => current.map((entry) => entry.id === item.id ? { ...entry, read_at: new Date().toISOString() } : entry)); }
    let available = crews;
    if (["seat_accepted", "chart_share"].includes(item.type)) available = await onRefresh() || crews;
    const crew = available.find((entry) => entry.id === item.crew_id || entry.slug === item.payload?.crew_slug);
    if ((item.type === "seat_accepted" || item.type === "chart_share") && crew?.membershipRole) onEnterRoom(crew, item.type === "chart_share" ? item.payload : null);
    else if (item.type === "seat_request") go("requests"); else if (crew) onOpenCrew(crew);
  };
  const readAll = async () => { await markAllNotificationsRead(); setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() }))); };

  let page = <HomeTab profile={profile} crews={crews} onTab={go} onEnter={onEnterRoom} onOpen={onOpenCrew} onCreate={onCreate} />;
  if (tab === "discover") page = <DiscoverTab crews={crews} onOpen={onOpenCrew} onEnter={onEnterRoom} onCreate={onCreate} />;
  if (tab === "rooms") page = <RoomsTab crews={crews} onOpen={onOpenCrew} onEnter={onEnterRoom} onCreate={onCreate} />;
  if (tab === "requests") page = <RequestsTab crews={crews} onChanged={onRefresh} />;
  if (tab === "activity") page = <ActivityTab notifications={notifications} onOpen={openNotification} onReadAll={readAll} />;
  if (tab === "settings") page = <SettingsTab session={session} onProfileChanged={setProfile} />;

  return <div className="product-app">
    {toast && <button type="button" className="live-toast" onClick={() => { openNotification(toast); setToast(null); }}><i /><div><strong>{toast.title}</strong><span>{toast.body}</span></div><ArrowRight /></button>}
    <aside className="app-sidebar"><button className="app-logo" onClick={() => go("home")}>FNF<span>●</span></button><div className="app-sidebar__status"><i />PRIVATE CREW OS</div><nav>{TABS.map(([id, label, Icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => go(id)}><span className="app-nav-key"><Icon weight={tab === id ? "fill" : "regular"} /></span><span>{label}</span>{id === "requests" && pending > 0 && <b>{pending}</b>}{id === "activity" && unread > 0 && <b>{unread}</b>}</button>)}</nav><div className="app-sidebar__account"><button onClick={() => go("settings")}><Avatar src={profile?.avatar_url} name={profile?.display_name || session.user.email || "FNF"} size={38} /><span><strong>{profile?.display_name || "FNF trader"}</strong><small>@{profile?.handle || "loading"}</small></span></button><button onClick={onSignOut} aria-label="Sign out"><SignOut /></button></div></aside>
    <header className="app-mobile-head"><button className="app-logo" onClick={() => go("home")}>FNF<span>●</span></button><button onClick={onCreate}><Plus />Crew</button></header>
    <main className="app-canvas">{loading && <div className="app-sync"><SpinnerGap className="animate-spin" />Syncing</div>}<AnimatePresence mode="wait"><motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .24 }}>{page}</motion.div></AnimatePresence></main>
    <nav className="app-mobile-nav">{TABS.map(([id, label, Icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span>{id === "requests" && pending > 0 && <b>{pending}</b>}{id === "activity" && unread > 0 && <b>{unread}</b>}</button>)}</nav>
  </div>;
}
