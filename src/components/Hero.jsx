import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, Plus } from "@phosphor-icons/react";
import { UI_ART, UI_VIDEO } from "../data.js";
import { AmbientVideo, Button, EASE } from "./ui.jsx";

export default function Hero({ onCreate }) {
  const reduce = useReducedMotion();
  const browse = () => document.getElementById("find")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="top" className="hero-section relative isolate overflow-hidden">
      <div className="hero-registration" aria-hidden="true"><span /><span /></div>
      <div className="hero-poster">
          <motion.div
            className="hero-poster__image"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.05, ease: EASE }}
          >
            <AmbientVideo
              src={UI_VIDEO.hero}
              poster={UI_ART.hero}
              alt="A six-person trading crew celebrating around glowing charts."
              priority
            />
          </motion.div>
          <div className="hero-poster__veil" aria-hidden="true" />

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: EASE }}
            className="hero-kicker"
          >Friends not followers / Solana private rooms</motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12, ease: EASE }}
            className="hero-title"
          >
            WIN TOGETHER.<br /><span>LOSE SMALLER.</span>
          </motion.h1>

          <div className="hero-lower">
            <motion.div
              initial={reduce ? false : { opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.32, ease: EASE }}
              className="hero-copy"
            >
              <p>Find the seven people who trade memes at your speed. No broadcast rooms. No paid signal tier. One trial week.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button variant="pink" size="lg" onClick={browse}>Find your room <ArrowDownRight size={17} weight="bold" /></Button>
                <Button variant="paper" size="lg" onClick={onCreate}><Plus size={17} weight="bold" />Start one</Button>
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
              className="hero-ticket"
            >
              <span className="utility">Room protocol</span>
              <strong>08</strong>
              <p>humans max</p>
              <i aria-hidden="true" />
            </motion.div>
          </div>
      </div>
    </section>
  );
}
