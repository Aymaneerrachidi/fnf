import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { EASE } from "./ui.jsx";

const KEY_CELLS = Array.from({ length: 9 }, (_, index) => ({
  index,
  position: `${(index % 3) * 50}% ${Math.floor(index / 3) * 50}%`,
}));

const CLANS = [
  {
    name: "Phantom Troups",
    profit: "+$6M",
    period: "last 30 days",
    image: "/assets/clans images/phantom troups up 6m$ last 30 days.jpg",
    tone: "gold",
  },
  {
    name: "Nobi Ventures",
    profit: "+$4.8M",
    period: "last 30 days",
    image: "/assets/clans images/nobi ventures up 4.8m last 30 days.jpg",
    tone: "pink",
  },
  {
    name: "Dabal",
    profit: "+$4.4M",
    period: "last 30 days",
    image: "/assets/clans images/dabal up 4.4m$ last 30 days.jpg",
    tone: "purple",
  },
  {
    name: "Grand FNF",
    profit: "+$3.6M",
    period: "last 30 days",
    image: "/assets/clans images/grand fnf up 3.6 mil last 30 days.jpg",
    tone: "blue",
  },
];

export default function ClanProof() {
  const reduce = useReducedMotion();
  const [activeClan, setActiveClan] = useState(CLANS[0].name);

  return (
    <section id="clans" className="clan-section section-space" aria-labelledby="clan-title">
      <div className="shell">
        <header className="clan-heading">
          <span className="pixel-kicker">Public clan snapshots</span>
          <h2 id="clan-title">Some circles are already printing.</h2>
          <p>Real clan identities and the 30-day results supplied for this build.</p>
        </header>

        <div className="clan-keyboard">
          {CLANS.map((clan, index) => (
            <motion.button
              key={clan.name}
              type="button"
              className={`clan-key clan-key--${clan.tone}${activeClan === clan.name ? " is-active" : ""}`}
              aria-pressed={activeClan === clan.name}
              aria-label={`Select ${clan.name}, up ${clan.profit.replace("+", "")} in the last 30 days`}
              onClick={() => setActiveClan(clan.name)}
              initial={reduce ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.55, delay: index * 0.07, ease: EASE }}
              whileHover={reduce ? undefined : { y: -7 }}
              whileTap={reduce ? undefined : { y: 5, scale: 0.992 }}
            >
              <div className="clan-key__image" role="img" aria-label={`${clan.name} clan logo split across nine keyboard keys`}>
                <div className="clan-mosaic" aria-hidden="true">
                  {KEY_CELLS.map((cell) => (
                    <span
                      key={cell.index}
                      style={{ backgroundImage: `url("${clan.image}")`, backgroundPosition: cell.position }}
                    />
                  ))}
                </div>
              </div>
              <div className="clan-key__copy">
                <span>{clan.name}</span>
                <strong>{clan.profit}</strong>
                <small>{clan.period}</small>
              </div>
              <ArrowUpRight className="clan-key__arrow" size={20} weight="bold" />
            </motion.button>
          ))}
        </div>

        <p className="clan-disclaimer">
          Performance snapshots are promotional examples, not typical results. Past performance does not predict future returns.
        </p>
      </div>
    </section>
  );
}
