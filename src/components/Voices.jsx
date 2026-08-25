import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import { EASE } from "./ui.jsx";

const QUOTES = [
  {
    quote: "You need to be in a good group chat if you're gonna trade memes.",
    name: "Rasmr",
    context: "On trading memes",
    image: "/assets/fnf-glass-quote-room.webp",
  },
  {
    quote: "Most successful traders are in private FNF's.",
    name: "Trencher",
    context: "On private rooms",
    image: "/assets/fnf-glass-private-room.webp",
  },
];

export default function Voices() {
  const [index, setIndex] = useState(0);
  const reduce = useReducedMotion();
  const active = QUOTES[index];
  const move = (direction) => setIndex((current) => (current + direction + QUOTES.length) % QUOTES.length);

  return (
    <section className="voices-section section-space">
      <div className="shell">
        <div className="voices-frame">
          <div className="voices-media" aria-hidden="true">
            <div className="voices-media__back" />
            <AnimatePresence mode="wait">
              <motion.img
                key={active.image}
                src={active.image}
                alt=""
                initial={reduce ? false : { opacity: 0, scale: 0.94, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 1.04, rotate: 2 }}
                transition={{ duration: 0.55, ease: EASE }}
              />
            </AnimatePresence>
          </div>

          <div className="voices-copy" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.blockquote
                key={active.name}
                initial={reduce ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, ease: EASE }}
              >
                “{active.quote}”
              </motion.blockquote>
            </AnimatePresence>
            <div className="voices-meta">
              <div>
                <strong>{active.name}</strong>
                <span>{active.context}</span>
              </div>
              <div className="voices-controls">
                <button type="button" onClick={() => move(-1)} aria-label="Previous quote">
                  <ArrowLeft size={18} weight="bold" />
                </button>
                <button type="button" onClick={() => move(1)} aria-label="Next quote">
                  <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
