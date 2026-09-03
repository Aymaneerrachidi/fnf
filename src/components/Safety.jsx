import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Check, ShieldCheck, X } from "@phosphor-icons/react";
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
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.12 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="rules" className="safety-section section-space" aria-labelledby="safety-title">
      <div className="shell">
        <header className="section-heading safety-heading">
          <span>ROOM DESIGN / 01</span>
          <h2 id="safety-title">The product is the room, not the call.</h2>
          <p>FNF is built around repeat conversations between a few traders—not a feed, a guru, or a paid promise.</p>
        </header>

        <motion.article
          className="trust-hero"
          initial={reduce ? false : { opacity: 0, scale: 0.975 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.22 }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          <video
            ref={videoRef}
            className="trust-hero__video"
            src="/assets/eight-keeps-it-personal.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            onCanPlay={(event) => {
              if (event.currentTarget.getBoundingClientRect().top < window.innerHeight) {
                event.currentTarget.play().catch(() => {});
              }
            }}
          />
          <div className="trust-hero__shade" aria-hidden="true" />
          <div className="trust-hero__content">
            <div className="trust-hero__copy">
              <span className="pixel-kicker">THE HARD CAP</span>
              <h3>Eight keeps it personal.</h3>
              <p>Past eight, the room gets noisy. FNF keeps the circle small enough for every trader to have a voice.</p>
            </div>
            <div className="trust-hero__facts">
              <div><strong>8 max</strong><span>Hard room cap</span></div>
              <div><strong>0 tiers</strong><span>No paid signals</span></div>
              <div><strong>1 room</strong><span>One shared thesis</span></div>
            </div>
          </div>
        </motion.article>

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
