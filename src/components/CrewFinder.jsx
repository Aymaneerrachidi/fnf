import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, MagnifyingGlass, Plus, SlidersHorizontal, X } from "@phosphor-icons/react";
import { FILTERS, UI_ART, UI_VIDEO } from "../data.js";
import { AmbientVideo, Button, EASE, inputClass } from "./ui.jsx";

const ANY = "Any";
const TRADING = FILTERS.find((item) => item.id === "trading").options;
const MORE_FILTERS = FILTERS.filter((item) => item.id !== "trading");

function fitFor(crew) {
  return 78 + (crew.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) % 18);
}

function Metric({ value, label }) {
  return <span className="crew-row__metric"><b>{value}</b><small>{label}</small></span>;
}

function CrewRow({ crew, index, requested, onOpen }) {
  const reduce = useReducedMotion();
  const seats = Math.max(0, crew.seats - crew.members);

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -5 }}
      transition={{ duration: 0.25, delay: Math.min(index, 5) * 0.025, ease: EASE }}
      className="crew-row"
    >
      <button type="button" onClick={() => onOpen(crew)} className="crew-row__button">
        <span className="crew-row__index nums">{String(index + 1).padStart(2, "0")}</span>
        <div className="crew-row__identity">
          <h3>{crew.name}</h3>
          <span>{crew.trading}</span>
        </div>
        <p className="crew-row__thesis">{crew.thesis}</p>
        <div className="crew-row__stats">
          <Metric value={`${fitFor(crew)}%`} label="fit" />
          <Metric value={seats || "full"} label="seats" />
          <Metric value={crew.live} label="live" />
        </div>
        <span className="crew-row__go"><ArrowUpRight size={17} weight="bold" /></span>
        {requested && <span className="crew-row__sent">sent</span>}
      </button>
    </motion.article>
  );
}

export default function CrewFinder({ crews, onOpen, requests, onCreate }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [trading, setTrading] = useState(ANY);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [picks, setPicks] = useState({ lang: ANY, hours: ANY, voice: ANY });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 160);
    return () => clearTimeout(timer);
  }, [query, trading, picks]);

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return crews.filter((crew) => {
      if (trading !== ANY && crew.trading !== trading) return false;
      if (Object.entries(picks).some(([key, value]) => value !== ANY && crew[key] !== value)) return false;
      if (!needle) return true;
      return [crew.name, crew.thesis, crew.trading, crew.lang].join(" ").toLowerCase().includes(needle);
    });
  }, [crews, query, trading, picks]);

  const openRooms = crews.filter((crew) => crew.members < crew.seats).length;
  const active = Number(Boolean(query.trim())) + Number(trading !== ANY) + Object.values(picks).filter((value) => value !== ANY).length;
  const clear = () => { setQuery(""); setTrading(ANY); setPicks({ lang: ANY, hours: ANY, voice: ANY }); };

  return (
    <section id="find" className="floor-section relative py-28 md:py-40">
      <div className="shell">
        <div className="floor-directory">
          <header className="floor-directory__mast">
            <AmbientVideo src={UI_VIDEO.floor} poster={UI_ART.floor} className="floor-mast__motion" />
            <div className="floor-mast__wash" aria-hidden="true" />
            <div className="floor-directory__title">
              <p>Live room directory / wallet blind</p>
              <h2>Crew floor</h2>
            </div>
            <p className="floor-directory__intro">Rooms are sorted by how they trade. Audience size does not exist here.</p>
            <div className="floor-directory__counts">
              <span><b>{crews.length}</b> crews</span>
              <span><b>{openRooms}</b> open</span>
              <span><b>{requests.size}</b> sent</span>
            </div>
          </header>

          <div className="filter-console">
            <div className="filter-primary">
              <div className="filter-search">
                <MagnifyingGlass size={17} weight="bold" />
                <label htmlFor="crew-search" className="sr-only">Search crews</label>
                <input id="crew-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search crews" />
              </div>
              <button type="button" className="filter-toggle" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen}>
                <SlidersHorizontal size={16} weight="bold" />
                <span>{active ? `${active} active` : "More filters"}</span>
              </button>
              {active > 0 && <button type="button" className="filter-reset" onClick={clear} aria-label="Clear filters"><X size={16} weight="bold" /></button>}
            </div>

            <div className="style-stack" aria-label="Trading market">
              {[ANY, ...TRADING].map((option) => (
                <button type="button" key={option} className={trading === option ? "active" : ""} onClick={() => setTrading(option)}>
                  {option === ANY ? "All rooms" : option}
                </button>
              ))}
            </div>

            <AnimatePresence initial={false}>
              {filtersOpen && (
                <motion.div
                  className="filter-more"
                  initial={reduce ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.26, ease: EASE }}
                >
                  <div className="filter-more__grid">
                    {MORE_FILTERS.map((filter) => (
                      <label key={filter.id} htmlFor={`filter-${filter.id}`}>
                        <span>{filter.name}</span>
                        <select id={`filter-${filter.id}`} value={picks[filter.id]} onChange={(event) => setPicks((current) => ({ ...current, [filter.id]: event.target.value }))} className={inputClass}>
                          <option value={ANY}>Any {filter.name.toLowerCase()}</option>
                          {filter.options.map((option) => <option key={option}>{option}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="crew-deck">
            <div className="crew-deck__summary">
              <span>{loading ? "Scanning rooms" : `${results.length} rooms matched`}</span>
              <span>Open a room to read the full thesis</span>
            </div>
            <div className="crew-deck__columns" aria-hidden="true">
              <span>No.</span><span>Room</span><span>Thesis</span>
              <span className="crew-deck__metric-head"><i>Fit</i><i>Seats</i><i>Live</i></span><span />
            </div>
            <AnimatePresence mode="popLayout">
              {!loading && results.map((crew, index) => <CrewRow key={crew.id} crew={crew} index={index} requested={requests.has(crew.id)} onOpen={onOpen} />)}
            </AnimatePresence>
            {!loading && results.length === 0 && (
              <div className="empty-floor"><strong>No clean match.</strong><p>Clear one filter or start the room you wanted to find.</p><Button variant="pink" onClick={onCreate}><Plus size={16} weight="bold" />Start a crew</Button></div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
