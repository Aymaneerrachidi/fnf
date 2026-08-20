import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, Funnel, MagnifyingGlass, Plus, RadioButton } from "@phosphor-icons/react";
import { FILTERS, VIDEO } from "../data.js";
import { AmbientVideo, Button, Chip, EASE, inputClass } from "./ui.jsx";

const SELECT_FILTERS = FILTERS.filter((f) => f.id !== "style");
const STYLES = FILTERS.find((f) => f.id === "style").options;
const ANY = "Any";
const STAT_LABELS = {
  crews: "rooms scanned",
  open: "seats open",
  requests: "requests sent",
};

function compatFor(crew, index) {
  const seed = crew.id.split("").reduce((sum, c) => sum + c.charCodeAt(0), 0);
  return 78 + ((seed + index * 7) % 20);
}

function CrewRow({ crew, index, requested, onOpen }) {
  const reduce = useReducedMotion();
  const open = Math.max(0, crew.seats - crew.members);
  const compat = compatFor(crew, index);
  const palette = [
    ["var(--volt)", "var(--paper-2)"],
    ["var(--sky)", "var(--ink)"],
    ["var(--sand)", "var(--ink)"],
    ["var(--ink)", "var(--paper-2)"],
  ][index % 4];

  return (
    <motion.article
      layout
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.42, delay: Math.min(index, 7) * 0.025, ease: EASE }}
      whileHover={reduce ? undefined : { y: -2 }}
      className="group relative mb-3 overflow-hidden rounded-[24px] border border-line bg-paper-2/82 shadow-[0_16px_52px_-48px_rgba(28,45,58,.44)] transition-[background-color,transform,border-color] hover:-translate-y-0.5 hover:border-volt/35 hover:bg-paper-2"
      style={{ "--row-tone": palette[0], "--row-ink": palette[1] }}
    >
      <div className="row-light pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
      <button
        type="button"
        onClick={() => onOpen(crew)}
        className="grid w-full grid-cols-1 gap-0 overflow-hidden rounded-[24px] text-left xl:grid-cols-[330px_minmax(380px,1fr)_270px_64px] xl:items-stretch"
      >
        <div className="flex min-w-0 items-start gap-4 p-5 xl:border-r xl:border-line xl:p-6">
          <span className="nums pt-1 text-[11px] font-black text-ink-3">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className="grid size-11 shrink-0 place-items-center rounded-full font-mono text-[12px] font-black"
            style={{ background: "var(--row-tone)", color: "var(--row-ink)" }}
            aria-hidden="true"
          >
            {crew.name.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="font-sans text-[clamp(1.35rem,1.55vw,1.72rem)] font-extrabold leading-[1.02] tracking-[-0.055em] text-ink">
              {crew.name}
            </h3>
            <p className="mt-2 max-w-full truncate font-mono text-[10.5px] font-bold uppercase tracking-[0.05em] text-ink-3">
              {crew.style} / {crew.cap}
            </p>
          </div>
        </div>

        <div className="min-w-0 border-t border-line px-5 py-5 xl:border-t-0 xl:border-r xl:px-7 xl:py-6">
          <p className="max-w-[64ch] text-[14.5px] leading-[1.55] tracking-[-0.01em] text-ink-2">
            {crew.thesis}
          </p>
        </div>

        <div className="grid grid-cols-3 border-t border-line xl:border-t-0 xl:border-r">
          {[
            ["fit", `${compat}%`],
            ["seats", open > 0 ? `${open}/${crew.seats}` : "full"],
            ["live", crew.live],
          ].map(([k, v]) => (
            <div key={k} className="px-4 py-5 text-left xl:flex xl:flex-col xl:justify-center">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3">{k}</div>
              <div className="nums mt-1.5 text-[18px] font-black leading-none text-ink">{v}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-line px-5 py-4 xl:border-t-0 xl:px-0 xl:py-0">
          {requested && <span className="font-mono text-[10px] font-black uppercase tracking-[0.08em] text-volt xl:hidden">sent</span>}
          <span className="grid size-9 place-items-center rounded-full text-ink transition-transform group-hover:translate-x-0.5 xl:mx-auto">
            <ArrowRight size={18} weight="bold" />
          </span>
        </div>
      </button>
    </motion.article>
  );
}

function SkeletonRow() {
  return (
    <div className="shimmer relative mb-3 overflow-hidden rounded-[24px] border border-line bg-paper-2 px-5 py-7" aria-hidden="true">
      <div className="grid gap-4 xl:grid-cols-[330px_minmax(380px,1fr)_270px_64px]">
        <div className="h-16 bg-paper-3" />
        <div className="h-16 bg-paper-3" />
        <div className="h-16 bg-paper-3" />
        <div className="h-16 bg-paper-3" />
      </div>
    </div>
  );
}

export default function CrewFinder({ crews, onOpen, requests, onCreate }) {
  const reduce = useReducedMotion();
  const [query, setQuery] = useState("");
  const [style, setStyle] = useState(ANY);
  const [picks, setPicks] = useState({ cap: ANY, lang: ANY, hours: ANY, voice: ANY });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), 260);
    return () => clearTimeout(t);
  }, [query, style, picks]);

  const active =
    (query.trim() ? 1 : 0) +
    (style !== ANY ? 1 : 0) +
    Object.values(picks).filter((v) => v !== ANY).length;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return crews.filter((c) => {
      if (style !== ANY && c.style !== style) return false;
      for (const [k, v] of Object.entries(picks)) if (v !== ANY && c[k] !== v) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.thesis.toLowerCase().includes(q) ||
        c.style.toLowerCase().includes(q)
      );
    });
  }, [crews, query, style, picks]);

  const reset = () => {
    setQuery("");
    setStyle(ANY);
    setPicks({ cap: ANY, lang: ANY, hours: ANY, voice: ANY });
  };

  const floorStats = [
    ["crews", crews.length],
    ["open", crews.filter((c) => c.members < c.seats).length],
    ["requests", requests.size],
  ];

  return (
    <section id="find" className="relative isolate overflow-hidden py-28 md:py-44">
      <div className="soft-field opacity-80" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-24 h-[680px] opacity-25 mix-blend-multiply" aria-hidden="true">
        <AmbientVideo src={VIDEO.floor} className="scale-105" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--paper)_0%,transparent_22%,var(--paper)_92%)]" />
      </div>
      <div className="shell">
        <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="utility mb-4 text-volt">live rooms with open seats</p>
            <h2 className="display max-w-[12ch] text-[clamp(3rem,7.2vw,6.35rem)]">
              Crew floor
            </h2>
            <p className="mt-5 max-w-[48ch] text-[15.5px] leading-relaxed text-ink-2">
              Browse tiny rooms by rhythm, hours, cap size and how loud the voice chat gets.
            </p>
          </div>
          <p className="max-w-[34ch] text-[15px] leading-relaxed text-ink-2 xl:text-right">
            One board. Twelve crews. Filter the noise without leaving the floor.
          </p>
        </div>

        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="relative mt-12 overflow-hidden rounded-[34px] border border-line bg-paper-2/82 p-3 shadow-[0_26px_90px_-66px_rgba(28,45,58,.66)] backdrop-blur-xl"
        >
          <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
            <AmbientVideo src={VIDEO.floor} className="scale-110" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_248_238/.88),rgb(255_248_238/.97))]" />
          </div>

          <div className="relative rounded-[28px] border border-line bg-paper-2/88 p-4 md:p-5">
            <div className="grid gap-3 xl:grid-cols-[1.3fr_1fr]">
              <div className="relative">
                <MagnifyingGlass
                  size={18}
                  weight="bold"
                  className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-ink-3"
                  aria-hidden="true"
                />
                <label htmlFor="crew-search" className="sr-only">
                  Search crews
                </label>
                <input
                  id="crew-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="search room, thesis, meta, language"
                  className={`${inputClass} h-14 rounded-full bg-paper pl-14 text-[15px]`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {floorStats.map(([k, v], index) => (
                  <motion.div
                    key={k}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.5 }}
                    transition={{ duration: 0.4, delay: index * 0.04, ease: EASE }}
                    className="rounded-[22px] border border-line bg-paper/74 px-4 py-3"
                  >
                    <span className="utility block text-ink-3">{STAT_LABELS[k]}</span>
                    <span className="nums mt-1 block text-[28px] font-black leading-none tracking-[-0.08em] text-ink">
                      {v}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_1.25fr_auto] xl:items-center">
              <div className="no-scrollbar flex gap-2 overflow-x-auto">
                <Chip active={style === ANY} onClick={() => setStyle(ANY)} className="px-4">
                  All
                </Chip>
                {STYLES.map((s) => (
                  <Chip key={s} active={style === s} onClick={() => setStyle(s)} className="px-4">
                    {s}
                  </Chip>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {SELECT_FILTERS.map((f) => (
                  <div key={f.id} className="relative">
                    <label htmlFor={`f-${f.id}`} className="sr-only">
                      {f.name}
                    </label>
                    <select
                      id={`f-${f.id}`}
                      value={picks[f.id]}
                      onChange={(e) => setPicks((p) => ({ ...p, [f.id]: e.target.value }))}
                      className="h-11 w-full rounded-full border border-line bg-paper px-3 text-[12px] font-extrabold text-ink outline-none transition-colors focus:border-volt"
                    >
                      <option value={ANY}>{f.id === "voice" ? "room" : f.name.toLowerCase()}</option>
                      {f.options.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 xl:justify-end">
                <span className="utility rounded-full border border-line bg-paper-3 px-3 py-2 text-ink-2">
                  {loading ? "syncing" : `${results.length} visible`}
                </span>
                {active > 0 && (
                  <button type="button" onClick={reset} className="utility rounded-full bg-ink px-4 py-2.5 text-paper">
                    clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="relative mt-4 rounded-[28px]">
            <div className="hidden grid-cols-[330px_minmax(380px,1fr)_270px_64px] gap-0 px-2 pb-3 xl:grid">
              {["crew", "thesis", "signal"].map((h) => (
                <div key={h} className="font-mono px-5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-3">
                  {h}
                </div>
              ))}
            </div>

            {loading ? (
              [0, 1, 2, 3].map((i) => <SkeletonRow key={i} />)
            ) : results.length === 0 ? (
              <div className="p-8 md:p-12">
                <RadioButton size={34} weight="fill" className="text-volt" />
                <h3 className="display mt-5 max-w-[12ch] text-[clamp(2rem,5vw,3.5rem)]">
                  No crew on that frequency
                </h3>
                <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-ink-2">
                  Widen the filter or create the room. New rooms get pushed to the top for their first week.
                </p>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Button variant="ghost" onClick={reset}>
                    Reset filters
                  </Button>
                  <Button variant="volt" onClick={onCreate}>
                    <Plus size={16} weight="bold" />
                    Start one
                  </Button>
                </div>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {results.map((crew, i) => (
                  <CrewRow
                    key={crew.id}
                    crew={crew}
                    index={i}
                    requested={requests.has(crew.id)}
                    onOpen={onOpen}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
