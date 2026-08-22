import { motion, useReducedMotion } from "motion/react";
import { Check, ShieldWarning, X } from "@phosphor-icons/react";
import { UI_ART, UI_VIDEO } from "../data.js";
import { AmbientVideo, EASE } from "./ui.jsx";

const NEVER = ["Paid signal tiers", "Affiliate links to launchpads", "A cut of anything you lose"];

export default function Safety() {
  const reduce = useReducedMotion();
  return (
    <section id="rules" className="rules-section relative overflow-hidden py-28 md:py-44">
      <div className="rules-noise" aria-hidden="true" />
      <div className="shell relative">
        <header className="rules-head">
          <span className="utility">Trust boundary / read twice</span>
          <h2>REAL PEOPLE.<br />UNSAFE COINS.</h2>
        </header>

        <div className="rules-grid">
          <motion.article
            initial={reduce ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: EASE }}
            className="wallet-card"
          >
            <div className="wallet-card__art">
              <AmbientVideo
                src={UI_VIDEO.walletProof}
                poster={UI_ART.wallet}
                alt="Two traders linking their wallet identity across a table."
              />
              <div className="wallet-shield"><ShieldWarning size={28} weight="fill" /></div>
            </div>
            <div className="wallet-card__copy">
              <span className="utility">Proof of person</span>
              <h3>A linked wallet proves a person. It never proves a token.</h3>
              <p>FNF checks that the trader across from you is one wallet with one history and one account. That is the entire claim. Nobody here audits a contract for you.</p>
            </div>
          </motion.article>

          <motion.article
            initial={reduce ? false : { opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
            className="cap-card"
          >
            <AmbientVideo src={UI_VIDEO.hardCap} poster={UI_ART.world} className="rules-card__motion" />
            <div className="cap-card__wash" aria-hidden="true" />
            <span className="cap-card__ghost" aria-hidden="true">8</span>
            <strong>8</strong>
            <h3>The hard cap.</h3>
            <p>Past eight people, a room stops being a room and starts being a broadcast.</p>
            <div className="seat-grid" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} />)}</div>
          </motion.article>

          <motion.article
            initial={reduce ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="never-card"
          >
            <AmbientVideo src={UI_VIDEO.neverShip} poster={UI_ART.wallet} className="rules-card__motion" />
            <div className="never-card__wash" aria-hidden="true" />
            <div className="never-card__head"><span className="utility">Things FNF will never ship</span><X size={24} weight="bold" /></div>
            <ul>{NEVER.map((item) => <li key={item}><X size={16} weight="bold" /><span>{item}</span></li>)}</ul>
            <div className="never-card__report"><Check size={16} weight="bold" /><p>One report freezes a room for everybody in it while a human reads the log.</p></div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}
