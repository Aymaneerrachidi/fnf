import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { ArrowLeft, ChatCircleDots, Check, Copy, Desktop, Gear, Microphone, MicrophoneSlash, PhoneDisconnect, SpeakerHigh, SpeakerSlash, SpinnerGap, UserMinus, Users, X } from "@phosphor-icons/react";
import MarketChart from "./MarketChart.jsx";
import { Button, Mark } from "./ui.jsx";
import { getRoomConnection } from "../services/media.js";
import { archiveCrew, decideSeatRequest, leaveCrew, loadCrewMembers, loadCrewRequests, removeCrewMember, updateCrew } from "../services/crews.js";
import { loadRoomMessages, sendRoomMessage, subscribeToRoomMessages } from "../services/room.js";
import { FILTERS } from "../data.js";

function time(value) { return new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(value)); }

function AttachedTrack({ track, className = "" }) {
  const hostRef = useRef(null);
  useEffect(() => {
    if (!track || !hostRef.current) return undefined;
    const element = track.attach();
    element.className = className;
    hostRef.current.replaceChildren(element);
    return () => { track.detach(element); element.remove(); };
  }, [track, className]);
  return <div className="attached-track" ref={hostRef} />;
}

function RemoteAudio({ room, muted }) {
  const hostRef = useRef(null);
  useEffect(() => {
    const attached = new Map();
    const attach = (track) => {
      if (track.kind !== Track.Kind.Audio || attached.has(track.sid)) return;
      const element = track.attach();
      element.muted = muted;
      hostRef.current?.appendChild(element);
      attached.set(track.sid, { track, element });
    };
    const detach = (track) => {
      const item = attached.get(track.sid);
      if (!item) return;
      item.track.detach(item.element); item.element.remove(); attached.delete(track.sid);
    };
    room.remoteParticipants.forEach((participant) => participant.audioTrackPublications.forEach((publication) => publication.track && attach(publication.track)));
    room.on(RoomEvent.TrackSubscribed, attach);
    room.on(RoomEvent.TrackUnsubscribed, detach);
    return () => {
      room.off(RoomEvent.TrackSubscribed, attach); room.off(RoomEvent.TrackUnsubscribed, detach);
      attached.forEach(({ track, element }) => { track.detach(element); element.remove(); });
    };
  }, [room]);
  useEffect(() => { hostRef.current?.querySelectorAll("audio").forEach((element) => { element.muted = muted; }); }, [muted]);
  return <div hidden ref={hostRef} />;
}

function ChatPanel({ crew, session }) {
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadRoomMessages(crew.id).then((items) => alive && setMessages(items)).catch((cause) => alive && setError(cause.message)).finally(() => alive && setLoading(false));
    const stop = subscribeToRoomMessages(crew.id, (message) => setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]));
    return () => { alive = false; stop(); };
  }, [crew.id]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const submit = async (event) => {
    event.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true); setError("");
    try { await sendRoomMessage(crew.id, text); setBody(""); }
    catch (cause) { setError(cause.message || "Message not sent."); }
    finally { setSending(false); }
  };

  return <div className="room-chat">
    <div className="room-chat__messages">
      {loading && <div className="room-empty"><SpinnerGap className="animate-spin" />Loading the room…</div>}
      {!loading && messages.length === 0 && <div className="room-empty"><ChatCircleDots size={26} /><strong>Start the room.</strong><span>Share a ticker, a chart, or the thesis you are watching.</span></div>}
      {messages.map((message) => <article key={message.id} className={`room-message ${message.user_id === session.user.id ? "is-mine" : ""}`}>
        <Mark name={message.sender_name || "FNF"} size={30} />
        <div><header><strong>{message.sender_name}</strong><span>@{message.sender_handle} · {time(message.created_at)}</span></header><p>{message.body}</p>{message.kind === "chart" && message.metadata?.symbol && <span className="room-message__ticker">{message.metadata.symbol} · {message.metadata.price}</span>}</div>
      </article>)}
      <div ref={endRef} />
    </div>
    <form className="room-composer" onSubmit={submit}>
      {error && <p role="alert">{error}</p>}
      <div><textarea rows="1" value={body} onChange={(e) => setBody(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) submit(e); }} maxLength="2000" placeholder={`Message ${crew.name}`} aria-label={`Message ${crew.name}`} /><button type="submit" disabled={!body.trim() || sending}>{sending ? <SpinnerGap className="animate-spin" /> : "Send ↵"}</button></div>
    </form>
  </div>;
}

function RequestsPanel({ crew, onChanged }) {
  const [requests, setRequests] = useState([]); const [busy, setBusy] = useState(null); const [error, setError] = useState("");
  const refresh = useCallback(() => loadCrewRequests(crew.id).then(setRequests).catch((cause) => setError(cause.message)), [crew.id]);
  useEffect(() => { refresh(); }, [refresh]);
  const decide = async (id, decision) => { setBusy(id + decision); setError(""); try { await decideSeatRequest(id, decision); await refresh(); onChanged?.(); } catch (cause) { setError(cause.message); } finally { setBusy(null); } };
  const pending = requests.filter((item) => item.status === "pending");
  return <div className="room-admin-list">
    {error && <p className="room-inline-error">{error}</p>}
    {pending.length === 0 ? <div className="room-empty"><Check size={25} /><strong>Inbox clear.</strong><span>New seat requests will appear here.</span></div> : pending.map((request) => <article className="request-card" key={request.id}>
      <div className="request-card__person"><Mark name={request.display_name} size={42} /><div><strong>{request.display_name}</strong><span>@{request.handle}</span></div></div>
      <p>{request.note || "No note. Their matching profile is below."}</p>
      <div className="request-card__fit"><span>{request.trading}</span><span>{request.language}</span><span>{request.market_hours}</span><span>{request.voice_preference}</span></div>
      <div className="request-card__actions"><Button variant="secondary" size="sm" onClick={() => decide(request.id, "declined")} disabled={Boolean(busy)}>{busy === request.id + "declined" ? <SpinnerGap className="animate-spin" /> : <X />}Decline</Button><Button size="sm" onClick={() => decide(request.id, "accepted")} disabled={Boolean(busy)}>{busy === request.id + "accepted" ? <SpinnerGap className="animate-spin" /> : <Check />}Approve</Button></div>
    </article>)}
  </div>;
}

function MembersPanel({ crew }) {
  const [members, setMembers] = useState([]); const [error, setError] = useState(""); const [busy, setBusy] = useState(null);
  const refresh = useCallback(() => loadCrewMembers(crew.id).then(setMembers).catch((cause) => setError(cause.message)), [crew.id]);
  useEffect(() => { refresh(); }, [refresh]);
  const remove = async (id) => { setBusy(id); try { await removeCrewMember(crew.id, id); await refresh(); } catch (cause) { setError(cause.message); } finally { setBusy(null); } };
  return <div className="room-member-list">{error && <p className="room-inline-error">{error}</p>}{members.map((member) => <article key={member.user_id}><Mark name={member.display_name} size={38} /><div><strong>{member.display_name}</strong><span>@{member.handle} · {member.role}</span></div>{crew.membershipRole === "owner" && member.role !== "owner" && <button type="button" onClick={() => remove(member.user_id)} disabled={busy === member.user_id} aria-label={`Remove ${member.display_name}`}>{busy === member.user_id ? <SpinnerGap className="animate-spin" /> : <UserMinus />}</button>}</article>)}</div>;
}

function RoomSettingsPanel({ crew, onChanged, onLeave }) {
  const [values, setValues] = useState({ name: crew.name, thesis: crew.thesis, trading: crew.trading, lang: crew.lang, hours: crew.hours, voice: crew.voice, seats: String(crew.seats) });
  const [busy, setBusy] = useState(""); const [error, setError] = useState(""); const [saved, setSaved] = useState("");
  const set = (key) => (event) => setValues((current) => ({ ...current, [key]: event.target.value }));
  const save = async (event) => { event.preventDefault(); setBusy("save"); setError(""); try { await updateCrew(crew.id, values); await onChanged(); setSaved("Room settings saved."); } catch (cause) { setError(cause.message); } finally { setBusy(""); } };
  const leave = async () => { setBusy("leave"); setError(""); try { await leaveCrew(crew.id); await onChanged(); onLeave(); } catch (cause) { setError(cause.message); setBusy(""); } };
  const archive = async () => { if (!window.confirm(`Archive ${crew.name}? Members will no longer be able to enter.`)) return; setBusy("archive"); try { await archiveCrew(crew.id); await onChanged(); onLeave(); } catch (cause) { setError(cause.message); setBusy(""); } };
  if (crew.membershipRole !== "owner") return <div className="room-settings"><div><span>MEMBERSHIP</span><h3>Leave {crew.name}</h3><p>You will need a new approved seat request to come back.</p></div>{error && <p className="room-inline-error">{error}</p>}<Button variant="secondary" onClick={leave} disabled={Boolean(busy)}>{busy ? <SpinnerGap className="animate-spin" /> : null}Leave room</Button></div>;
  return <form className="room-settings" onSubmit={save}><div><span>ROOM ADMIN</span><h3>Room settings</h3><p>Changes update the board for everyone.</p></div>{error && <p className="room-inline-error">{error}</p>}{saved && <p className="room-settings__saved">{saved}</p>}<label><span>Name</span><input value={values.name} onChange={set("name")} minLength="3" maxLength="24" required /></label><label><span>Thesis</span><textarea value={values.thesis} onChange={set("thesis")} minLength="20" maxLength="200" rows="4" required /></label>{[["trading", "Trading", FILTERS[0].options], ["lang", "Language", FILTERS[1].options], ["hours", "Hours", FILTERS[2].options], ["voice", "Room", FILTERS[3].options]].map(([key, label, options]) => <label key={key}><span>{label}</span><select value={values[key]} onChange={set(key)}>{options.map((item) => <option key={item}>{item}</option>)}</select></label>)}<label><span>Room size</span><select value={values.seats} onChange={set("seats")}>{[4,5,6,7,8].map((item) => <option key={item}>{item} people</option>)}</select></label><Button type="submit" disabled={Boolean(busy)}>{busy === "save" ? <SpinnerGap className="animate-spin" /> : null}Save room</Button><button className="room-settings__archive" type="button" onClick={archive} disabled={Boolean(busy)}>Archive room</button></form>;
}

function MediaRoom({ room, crew, session, onLeave, onCrewChanged }) {
  const localParticipant = room.localParticipant;
  const [mediaVersion, setMediaVersion] = useState(0);
  const [deafened, setDeafened] = useState(false); const [side, setSide] = useState("chat"); const [mediaError, setMediaError] = useState("");
  useEffect(() => {
    const update = () => setMediaVersion((value) => value + 1);
    [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.LocalTrackPublished, RoomEvent.LocalTrackUnpublished, RoomEvent.TrackSubscribed, RoomEvent.TrackUnsubscribed, RoomEvent.TrackMuted, RoomEvent.TrackUnmuted].forEach((event) => room.on(event, update));
    return () => [RoomEvent.ParticipantConnected, RoomEvent.ParticipantDisconnected, RoomEvent.LocalTrackPublished, RoomEvent.LocalTrackUnpublished, RoomEvent.TrackSubscribed, RoomEvent.TrackUnsubscribed, RoomEvent.TrackMuted, RoomEvent.TrackUnmuted].forEach((event) => room.off(event, update));
  }, [room]);
  const participants = useMemo(() => [localParticipant, ...room.remoteParticipants.values()], [room, localParticipant, mediaVersion]);
  const isMicrophoneEnabled = localParticipant.isMicrophoneEnabled;
  const isScreenShareEnabled = localParticipant.isScreenShareEnabled;
  const share = useMemo(() => participants.map((participant) => ({ participant, publication: participant.getTrackPublication(Track.Source.ScreenShare) })).find((item) => item.publication?.track), [participants, mediaVersion]);
  const toggleMic = async () => { setMediaError(""); try { await localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled); } catch { setMediaError("Microphone permission was blocked. Allow it in your browser and try again."); } };
  const toggleShare = async () => { setMediaError(""); try { await localParticipant.setScreenShareEnabled(!isScreenShareEnabled); } catch { setMediaError("Screen sharing did not start. Choose a window or screen and try again."); } };
  const postChart = async (pair) => sendRoomMessage(crew.id, `${pair.symbol} chart · $${pair.price < .01 ? pair.price.toPrecision(4) : pair.price.toFixed(2)} · ${pair.change >= 0 ? "+" : ""}${pair.change.toFixed(2)}% today`, "chart", { symbol: pair.symbol, price: pair.price, pair: pair.address });

  return <div className="room-workspace">
    <RemoteAudio room={room} muted={deafened} />
    <header className="room-topbar"><div className="room-brand"><button type="button" onClick={onLeave} aria-label="Leave room"><ArrowLeft /></button><span>FNF</span><i>/</i><strong>{crew.name}</strong><em>{crew.membershipRole}</em></div><div className="room-presence"><span><i />LIVE ROOM</span><b>{participants.length} {participants.length === 1 ? "person" : "people"}</b><button type="button" onClick={() => navigator.clipboard?.writeText(window.location.href)}><Copy />Invite</button></div></header>
    <main className="room-main"><div className="room-stage">
      {share ? <div className="screen-stage"><AttachedTrack track={share.publication.track} /><span>{share.participant.name || "A crew member"} is sharing</span></div> : <MarketChart onShare={postChart} />}
      {mediaError && <div className="room-media-error">{mediaError}<button onClick={() => setMediaError("")}>×</button></div>}
    </div><aside className="room-side"><nav><button className={side === "chat" ? "active" : ""} onClick={() => setSide("chat")}><ChatCircleDots />Chat</button><button className={side === "members" ? "active" : ""} onClick={() => setSide("members")}><Users />People <span>{participants.length}</span></button>{crew.membershipRole === "owner" && <button className={side === "requests" ? "active" : ""} onClick={() => setSide("requests")}>Requests {crew.pendingRequests > 0 && <span>{crew.pendingRequests}</span>}</button>}<button className={side === "settings" ? "active" : ""} onClick={() => setSide("settings")} aria-label="Room settings"><Gear /></button></nav><div className="room-side__content">{side === "chat" && <ChatPanel crew={crew} session={session} />}{side === "members" && <MembersPanel crew={crew} />}{side === "requests" && <RequestsPanel crew={crew} onChanged={onCrewChanged} />}{side === "settings" && <RoomSettingsPanel crew={crew} onChanged={onCrewChanged} onLeave={onLeave} />}</div></aside></main>
    <footer className="room-controls"><div className="room-controls__identity"><Mark name={localParticipant.name || "You"} size={36} /><div><strong>{localParticipant.name || "You"}</strong><span>{isMicrophoneEnabled ? "Mic on" : "Mic off"}</span></div></div><div className="room-controls__keys"><button className={isMicrophoneEnabled ? "is-on" : ""} type="button" onClick={toggleMic}>{isMicrophoneEnabled ? <Microphone /> : <MicrophoneSlash />}<span>{isMicrophoneEnabled ? "Mute" : "Unmute"}</span></button><button className={deafened ? "is-danger" : ""} type="button" onClick={() => setDeafened((value) => !value)}>{deafened ? <SpeakerSlash /> : <SpeakerHigh />}<span>{deafened ? "Undeafen" : "Deafen"}</span></button><button className={isScreenShareEnabled ? "is-on" : ""} type="button" onClick={toggleShare}>{isScreenShareEnabled ? <X /> : <Desktop />}<span>{isScreenShareEnabled ? "Stop share" : "Share screen"}</span></button><button className="is-hangup" type="button" onClick={onLeave}><PhoneDisconnect /><span>Leave</span></button></div><div className="room-controls__thesis"><span>ROOM THESIS</span><p>{crew.thesis}</p></div></footer>
  </div>;
}

export default function RoomWorkspace({ crew, session, onLeave, onCrewChanged }) {
  const [room, setRoom] = useState(null); const [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    let nextRoom;
    const open = async () => {
      try {
        const connection = await getRoomConnection(crew.id);
        if (!alive) return;
        nextRoom = new Room({ adaptiveStream: true, dynacast: true });
        await nextRoom.connect(connection.serverUrl, connection.participantToken);
        if (alive) setRoom(nextRoom); else nextRoom.disconnect();
      } catch (cause) {
        if (alive) setError(cause.message || "The media room could not be opened.");
      }
    };
    open();
    return () => { alive = false; if (nextRoom) nextRoom.disconnect(); };
  }, [crew.id]);
  if (error) return <div className="room-gate"><Mark name={crew.name} tone="volt" size={64} /><h1>The room did not open.</h1><p>{error}</p><Button onClick={onLeave}>Back to FNF</Button></div>;
  if (!room) return <div className="room-gate"><SpinnerGap className="animate-spin" size={34} /><h1>Opening {crew.name}</h1><p>Securing the voice room and loading its live desk.</p></div>;
  return <MediaRoom room={room} crew={crew} session={session} onLeave={onLeave} onCrewChanged={onCrewChanged} />;
}
