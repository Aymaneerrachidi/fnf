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
import useClickSound from "./hooks/useClickSound.js";

const HowItWorks = lazy(() => import("./components/HowItWorks.jsx"));
const Safety = lazy(() => import("./components/Safety.jsx"));

export default function App() {
  const [crews, setCrews] = useState(CREWS);
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState(() => new Set());
  const [creating, setCreating] = useState(false);
  const { soundEnabled, toggleSound } = useClickSound();

  useEffect(() => {
    if (!window.location.hash) return undefined;
    const timer = window.setTimeout(() => {
      document.querySelector(window.location.hash)?.scrollIntoView({ block: "start" });
    }, 350);
    return () => window.clearTimeout(timer);
  }, []);

  const openCreate = useCallback(() => setCreating(true), []);

  const handleCreated = useCallback((crew) => {
    setCrews((list) => [crew, ...list]);
  }, []);

  const handleRequest = useCallback((id) => {
    setRequests((prev) => new Set(prev).add(id));
  }, []);

  return (
    <>
      <div className="grain" aria-hidden="true" />
      <Nav onCreate={openCreate} soundEnabled={soundEnabled} onToggleSound={toggleSound} />
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
    </>
  );
}
