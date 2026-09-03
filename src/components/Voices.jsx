import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { EASE } from "./ui.jsx";

const TRADERS = [
  {
    name: "Rasmr",
    handle: "@rasmr_eth",
    result: "Up $500K on Fomo.",
    image: "/assets/traders/trader-rasmr-key-v2.png",
    source: "https://x.com/LeviGMI/status/2086151812432691591",
  },
  {
    name: "Orangie",
    handle: "@orangie",
    result: "Made $3M on-chain.",
    image: "/assets/traders/trader-orangie-key-v4.png",
    source: "https://www.tiktok.com/@clipsbykes/video/7677238495773068566?is_from_webapp=1&sender_device=pc",
  },
  {
    name: "Requisiem",
    handle: "@requisiem",
    result: "Made $18M.",
    image: "/assets/traders/trader-requisiem-key-v2.png",
    source: "https://x.com/RowdyClips/status/2091729714259845602?s=20",
  },
];

export default function Voices() {
  const reduce = useReducedMotion();

  return (
    <section id="voices" className="voices-section voices-simple section-space" aria-labelledby="voices-title">
      <div className="shell">
        <header className="voices-simple__heading">
          <div>
            <span className="pixel-kicker">People, not follower counts</span>
            <h2 id="voices-title">Trading gets better when the room gets smaller.</h2>
          </div>
          <p>Public wins get attention. The people around the trade are what make the difference.</p>
        </header>

        <div className="trader-proof-grid">
          {TRADERS.map((trader, index) => (
            <motion.article
              className="trader-proof"
              key={trader.name}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.24 }}
              transition={{ duration: 0.55, delay: index * 0.07, ease: EASE }}
            >
              <div className="trader-proof__image">
                <img src={trader.image} alt={`${trader.name} portrait on an FNF keycap`} loading="lazy" decoding="async" />
              </div>
              <div className="trader-proof__body">
                <div className="trader-proof__identity">
                  <strong>{trader.name}</strong>
                  <span>{trader.handle}</span>
                </div>
                <h3>{trader.result}</h3>
                <a className="trader-proof__source" href={trader.source} target="_blank" rel="noreferrer">
                  View public source <ArrowUpRight size={15} weight="bold" />
                </a>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
