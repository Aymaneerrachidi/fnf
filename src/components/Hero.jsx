import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight, Plus } from "@phosphor-icons/react";
import { Button, EASE } from "./ui.jsx";

export default function Hero({ onCreate }) {
  const reduce = useReducedMotion();
  const browse = () => document.getElementById("find")?.scrollIntoView({ behavior: "smooth" });

  return (
    <section id="top" className="hero-section relative isolate min-h-[100dvh] overflow-hidden">
      <motion.img
        src="/assets/fnf-glass-crew-hero.webp"
        alt="Eight glass trading keys connected around a shared market console."
        className="hero-media"
        loading="eager"
        fetchPriority="high"
        initial={reduce ? false : { opacity: 0, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.25, ease: EASE }}
      />
      <div className="hero-wash" aria-hidden="true" />

      <div className="hero-content shell">
        <h1 className="hero-title max-w-6xl">
          Find your trading crew.
        </h1>

        <motion.div
          className="hero-lower"
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.38, ease: EASE }}
        >
          <p>
            FNF matches independent traders with small private crews. Browse theses,
            request a seat, and trial the room for seven days.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={browse}>
              Browse crews
              <ArrowDownRight size={18} weight="bold" />
            </Button>
            <Button size="lg" variant="secondary" onClick={onCreate}>
              <Plus size={18} weight="bold" />
              Start a crew
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
