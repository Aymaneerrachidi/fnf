import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, GlobeHemisphereEast } from "@phosphor-icons/react";
import { EASE } from "./ui.jsx";

const ROOMS = [
  { city: "Seoul", language: "한국어", trading: "Perps", hours: "UTC +9", status: "OPEN" },
  { city: "Jakarta", language: "Bahasa", trading: "Memecoins", hours: "UTC +7", status: "2 SEATS" },
  { city: "Istanbul", language: "Türkçe", trading: "Day trading", hours: "UTC +3", status: "OPEN" },
  { city: "Casablanca", language: "العربية / Français", trading: "Memecoins", hours: "UTC +1", status: "1 SEAT" },
  { city: "Madrid", language: "Español", trading: "Perps", hours: "UTC +2", status: "OPEN" },
  { city: "São Paulo", language: "Português", trading: "Day trading", hours: "UTC -3", status: "3 SEATS" },
];

export default function GlobalCrews() {
  const reduce = useReducedMotion();

  return (
    <section id="global" className="global-section section-space" aria-labelledby="global-title">
      <div className="shell">
        <header className="global-heading">
          <div>
            <span className="pixel-kicker"><GlobeHemisphereEast size={18} /> Worldwide rooms</span>
            <h2 id="global-title">Find your market hours. Speak your language.</h2>
          </div>
          <div>
            <p>Crypto trades around the clock. The people worth trading beside you should not be limited to one country, one language, or US waking hours.</p>
            <a className="fnf-key-button" href="#find">Match my hours <ArrowDownRight size={17} weight="bold" /></a>
          </div>
        </header>

        <div className="global-board">
          <motion.figure
            className="global-visual"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.22 }}
            transition={{ duration: 0.72, ease: EASE }}
          >
            <img src="/assets/fnf-world-key-v2.png" alt="A glossy keycap carrying a pixel globe, representing rooms across regions." loading="lazy" />
            <figcaption><b>24H</b><span>the floor never closes</span></figcaption>
          </motion.figure>
          <div className="global-room-grid" aria-label="Example worldwide rooms">
            {ROOMS.map((room, index) => (
              <motion.article
                key={room.city}
                className="global-room"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.45, delay: index * 0.055, ease: EASE }}
              >
                <div><span>{room.hours}</span><b>{room.status}</b></div>
                <h3>{room.city}</h3>
                <p>{room.language}</p>
                <small>{room.trading}</small>
              </motion.article>
            ))}
          </div>
        </div>

        <div className="global-marquee" aria-label="Languages supported in matching">
          <div>English · Español · Français · العربية · Türkçe · Bahasa · Português · 한국어 · English · Español · Français · العربية · Türkçe · Bahasa · Português · 한국어 ·</div>
        </div>
      </div>
    </section>
  );
}
