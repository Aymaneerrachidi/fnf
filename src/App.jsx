import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { CREWS } from "./data.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import LiveStrip from "./components/LiveStrip.jsx";
import CrewFinder from "./components/CrewFinder.jsx";
import CrewDrawer from "./components/CrewDrawer.jsx";
import CreateCrew from "./components/CreateCrew.jsx";
import Voices from "./components/Voices.jsx";
import CtaFooter from "./components/CtaFooter.jsx";
import GlobalCrews from "./components/GlobalCrews.jsx";
import ClanProof from "./components/ClanProof.jsx";
import AuthModal from "./components/AuthModal.jsx";
import useClickSound from "./hooks/useClickSound.js";
import { createCrew, loadCrews, requestSeat } from "./services/crews.js";
import { getCurrentSession, signOut, watchSession } from "./services/auth.js";
import { AuthRequiredError, backendConfigured } from "./lib/supabase.js";

const HowItWorks = lazy(() => import("./components/HowItWorks.jsx"));
const Safety = lazy(() => import("./components/Safety.jsx"));

export default function App() {
  const [crews, setCrews] = useState(CREWS);
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState(() => new Set());
  const [creating, setCreating] = useState(false);
  const [session, setSession] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const { soundEnabled, toggleSound } = useClickSound();

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const timer = window.setTimeout(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    getCurrentSession()
      .then((current) => active && setSession(current))
      .catch((error) => console.error("FNF session could not be restored.", error));
    const stopWatching = watchSession((current) => active && setSession(current));
    return () => {
      active = false;
      stopWatching();
    };
  }, []);

  useEffect(() => {
    let active = true;

    loadCrews()
      .then(({ crews: loaded }) => {
        if (active) {
          setCrews(loaded);
          setRequests(new Set(loaded.filter((crew) => crew.requested).map((crew) => crew.id)));
        }
      })
      .catch((error) => {
        console.error("FNF backend could not load crews; using local data.", error);
      });

    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const openAuth = useCallback(() => {
    setPendingAction(null);
    setAuthOpen(true);
  }, []);

  const openCreate = useCallback(() => {
    if (backendConfigured && !session) {
      setPendingAction({ type: "create" });
      setAuthOpen(true);
      return;
    }
    setCreating(true);
  }, [session]);

  const handleCreated = useCallback(async (values) => {
    const crew = await createCrew(values);
    setCrews((list) => [crew, ...list]);
    return crew;
  }, []);

  const handleRequest = useCallback(async (id) => {
    if (backendConfigured && !session) {
      setPendingAction({ type: "request", id });
      setAuthOpen(true);
      throw new AuthRequiredError();
    }
    await requestSeat(id);
    setRequests((prev) => new Set(prev).add(id));
    return true;
  }, [session]);

  const handleAuthenticated = useCallback(async (nextSession) => {
    setSession(nextSession);
    setAuthOpen(false);
    const action = pendingAction;
    setPendingAction(null);
    if (action?.type === "create") setCreating(true);
    if (action?.type === "request") {
      try {
        await requestSeat(action.id);
        setRequests((prev) => new Set(prev).add(action.id));
      } catch (error) {
        console.error("Pending seat request failed after sign-in.", error);
      }
    }
  }, [pendingAction]);

  const handleSignOut = useCallback(() => {
    signOut().catch((error) => console.error("FNF sign-out failed.", error));
  }, []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav
        onCreate={openCreate}
        onAuth={openAuth}
        onSignOut={handleSignOut}
        signedIn={Boolean(session)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero onCreate={openCreate} />
        <LiveStrip />
        <CrewFinder
          crews={crews}
          requests={requests}
          onOpen={setSelected}
          onCreate={openCreate}
        />
        <Suspense fallback={null}>
          <HowItWorks />
          <Safety />
        </Suspense>
        <GlobalCrews />
        <ClanProof />
        <Voices />
        <CtaFooter onCreate={openCreate} />
      </main>

      <CrewDrawer
        crew={selected}
        onClose={() => setSelected(null)}
        requested={selected ? requests.has(selected.id) : false}
        onRequest={handleRequest}
      />
      <CreateCrew
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={handleCreated}
      />
      <AuthModal
        open={authOpen}
        onClose={() => {
          setAuthOpen(false);
          setPendingAction(null);
        }}
        onAuthenticated={handleAuthenticated}
      />
    </>
  );
}
