import { useCallback, useState } from "react";
import { CREWS } from "./data.js";
import Nav from "./components/Nav.jsx";
import Hero from "./components/Hero.jsx";
import LiveStrip from "./components/LiveStrip.jsx";
import CrewFinder from "./components/CrewFinder.jsx";
import CrewDrawer from "./components/CrewDrawer.jsx";
import CreateCrew from "./components/CreateCrew.jsx";
import HowItWorks from "./components/HowItWorks.jsx";
import Safety from "./components/Safety.jsx";
import Voices from "./components/Voices.jsx";
import CtaFooter from "./components/CtaFooter.jsx";

export default function App() {
  const [crews, setCrews] = useState(CREWS);
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState(() => new Set());
  const [creating, setCreating] = useState(false);

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
      <Nav onCreate={openCreate} />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero onCreate={openCreate} />
        <LiveStrip />
        <CrewFinder
          crews={crews}
          requests={requests}
          onOpen={setSelected}
          onCreate={openCreate}
        />
        <HowItWorks />
        <Safety />
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
