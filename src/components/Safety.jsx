import { motion, useReducedMotion } from "motion/react";
import { Check, ShieldCheck, UsersThree, X } from "@phosphor-icons/react";
import { EASE } from "./ui.jsx";

const TOGETHER = [
  "Share a thesis, not a blind call",
  "Trade with people on your hours",
  "Learn names, not follower counts",
];

const NOT_FNF = [
  "Paid signal tiers",
  "One guru and a silent audience",
  "A course disguised as community",
];

export default function Safety() {
  const reduce = useReducedMotion();

  return (
    <section id="rules" className="safety-section section-space" aria-labelledby="safety-title">
      <div className="shell">
        <header className="section-heading safety-heading">
          <span>ROOM DESIGN / 01</span>
          <h2 id="safety-title">The product is the room, not the call.</h2>
          <p>FNF is built around repeat conversations between a few traders—not a feed, a guru, or a paid promise.</p>
        </header>

        <div className="trust-bento">
          <motion.figure
            className="trust-bento__image"
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <img src="/assets/fnf-glass-eight.webp" alt="Eight glass keys arranged around an open center." loading="lazy" />
          </motion.figure>
          <article className="trust-bento__cap">
            <UsersThree size={30} weight="duotone" />
            <div><h3>Eight keeps it personal.</h3><p>Past eight, the room gets noisy. FNF keeps the circle small enough for every trader to have a voice.</p></div>
          </article>
          <article className="trust-bento__fact"><strong>8 max</strong><span>Hard room cap</span></article>
          <article className="trust-bento__fact"><strong>0 tiers</strong><span>No paid signals</span></article>
          <article className="trust-bento__fact"><strong>1 room</strong><span>One shared thesis</span></article>
        </div>

        <div className="safety-contract">
          <motion.article
            className="contract-card contract-card--yes"
            initial={reduce ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.58, ease: EASE }}
          >
            <div className="contract-card__head"><ShieldCheck size={29} weight="duotone" /><span>BUILT FOR</span></div>
            <h3>Trading together.</h3>
            <p>A small, opinionated circle where every call has context and every person can answer back.</p>
            <div className="contract-list">
              {TOGETHER.map((item) => <div key={item}><Check size={17} weight="bold" /><span>{item}</span></div>)}
            </div>
          </motion.article>
          <motion.article
            className="contract-card contract-card--no"
            initial={reduce ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.58, delay: 0.08, ease: EASE }}
          >
            <div className="contract-card__head"><X size={27} weight="bold" /><span>NEVER FNF</span></div>
            <h3>Another signal server.</h3>
            <p>No hierarchy built around one loud account. No monetized access to somebody else’s conviction.</p>
            <div className="never-list">
              {NOT_FNF.map((item) => <div key={item}><X size={16} weight="bold" /><span>{item}</span></div>)}
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
