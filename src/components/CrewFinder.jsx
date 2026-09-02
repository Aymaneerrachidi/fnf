import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  MagnifyingGlass,
  Plus,
  SlidersHorizontal,
  X,
} from "@phosphor-icons/react";
import { FILTERS } from "../data.js";
import { Button, EASE, inputClass } from "./ui.jsx";

const ANY = "Any";
const TRADING = FILTERS.find((item) => item.id === "trading").options;
const MORE_FILTERS = FILTERS.filter((item) => item.id !== "trading");

function CrewCard({ crew, requested, onOpen }) {
  const reduce = useReducedMotion();
  const seats = Math.max(0, crew.seats - crew.members);

  return (
    <motion.article
      layout
      className="crew-row"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
      whileHover={reduce ? undefined : { y: -4 }}
      transition={{ duration: 0.36, ease: EASE }}
    >
      <button type="button" onClick={() => onOpen(crew)} className="crew-card__button">
        <div className="crew-card__top">
          <span>{crew.trading}</span>
          <span>{requested ? "Request sent" : seats ? `${seats} ${seats === 1 ? "seat" : "seats"}` : "Waitlist"}</span>
        </div>
        <div className="crew-row__identity">
          <h3>{crew.name}</h3>
          <ArrowUpRight className="crew-card__arrow" size={22} weight="bold" />
        </div>
        <p className="crew-row__thesis">{crew.thesis}</p>
        <div className="crew-card__facts">
          <span><b>{crew.lang}</b><small>Language</small></span>
          <span><b>{crew.hours}</b><small>Hours</small></span>
          <span><b>{crew.live}</b><small>In room</small></span>
        </div>
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
      return [crew.name, crew.thesis, crew.trading, crew.lang]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [crews, query, trading, picks]);

  const openRooms = crews.filter((crew) => crew.members < crew.seats).length;
  const active = Number(Boolean(query.trim())) + Number(trading !== ANY) + Object.values(picks).filter((value) => value !== ANY).length;
  const clear = () => {
    setQuery("");
    setTrading(ANY);
    setPicks({ lang: ANY, hours: ANY, voice: ANY });
  };

  return (
    <section id="find" className="floor-section section-space">
      <div className="shell">
        <header className="section-heading floor-heading">
          <h2>Rooms built around your vibe.</h2>
          <p>
            Find your trading circle. Every room stays small enough for an actual conversation.
          </p>
          <span>Connect. Trade. Build your circle. · {crews.length} rooms, {openRooms} open</span>
        </header>

        <div className="filter-console">
          <div className="filter-search">
            <MagnifyingGlass size={18} weight="bold" />
            <label htmlFor="crew-search" className="sr-only">Search crews</label>
            <input
              id="crew-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by room, thesis, or language"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                <X size={16} weight="bold" />
              </button>
            )}
          </div>

          <div className="trading-tabs" aria-label="Trading market">
            {[ANY, ...TRADING].map((option) => (
              <button
                type="button"
                key={option}
                className={trading === option ? "active" : ""}
                onClick={() => setTrading(option)}
              >
                {option === ANY ? "All rooms" : option}
              </button>
            ))}
          </div>

          <div className="filter-actions">
            <button
              type="button"
              className="filter-toggle"
              onClick={() => setFiltersOpen((value) => !value)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={17} weight="bold" />
              {active ? `${active} active` : "More filters"}
            </button>
            {active > 0 && (
              <button type="button" className="filter-reset" onClick={clear}>Clear</button>
            )}
          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                className="filter-more"
                initial={reduce ? false : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <div className="filter-more__grid">
                  {MORE_FILTERS.map((filter) => (
                    <label key={filter.id} htmlFor={`filter-${filter.id}`}>
                      <span>{filter.name}</span>
                      <select
                        id={`filter-${filter.id}`}
                        value={picks[filter.id]}
                        onChange={(event) => setPicks((current) => ({ ...current, [filter.id]: event.target.value }))}
                        className={inputClass}
                      >
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

        <div className="crew-deck" aria-live="polite">
          <div className="crew-deck__summary">
            <span>{loading ? "Matching rooms" : `${results.length} ${results.length === 1 ? "room" : "rooms"}`}</span>
            <span>Open a room to read the full thesis</span>
          </div>

          {loading ? (
            <div className="crew-grid" aria-label="Loading rooms">
              {[0, 1, 2, 3].map((item) => <div key={item} className="crew-skeleton" />)}
            </div>
          ) : (
            <motion.div layout className="crew-grid">
              <AnimatePresence mode="popLayout">
                {results.map((crew) => (
                  <CrewCard
                    key={crew.id}
                    crew={crew}
                    requested={requests.has(crew.id)}
                    onOpen={onOpen}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {!loading && results.length === 0 && (
            <div className="empty-floor">
              <strong>No room matches all of that.</strong>
              <p>Clear a filter or start the crew you expected to find.</p>
              <Button onClick={onCreate}><Plus size={16} weight="bold" />Start a crew</Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
