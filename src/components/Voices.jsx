import { motion, useReducedMotion } from "motion/react";
import { UI_ART } from "../data.js";
import { EASE } from "./ui.jsx";

export default function Voices() {
  const reduce = useReducedMotion();
  return (
    <section className="voices-section relative overflow-hidden">
      <motion.img
        initial={reduce ? false : { scale: 1.08 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.2, ease: EASE }}
        src={UI_ART.social}
        alt="A late-night crew laughing together after a winning trade."
        width="1456" height="1018" loading="lazy" className="voices-image"
      />
      <div className="voices-wash" aria-hidden="true" />
      <div className="shell voices-content">
        <blockquote className="voice-quote voice-quote--rasmr">
          <p>“Rasmr says you need to be in a good group chat if you’re gonna trade memes.”</p>
          <footer><strong>Rasmr</strong><span>On trading memes</span></footer>
        </blockquote>
        <blockquote className="voice-quote voice-quote--trencher">
          <p>“Most successful traders are in private FNF’s.”</p>
          <footer><strong>Trencher</strong><span>Private rooms</span></footer>
        </blockquote>
      </div>
    </section>
  );
}
