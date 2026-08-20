import { motion, useReducedMotion } from "motion/react";
import { IMG, VIDEO } from "../data.js";
import { AmbientVideo, EASE, Reveal } from "./ui.jsx";

const QUOTES = [
  {
    body: "Rasmr says you need to be in a good group chat if you're gonna trade memes.",
    who: "Rasmr",
    where: "On trading memes",
  },
  {
    body: "Most successful traders are in private FNF's.",
    who: "Trencher",
    where: "Private rooms",
  },
];

const QUOTE_VIDEO = ["quoteRasmr", "quoteTrencher"];

export default function Voices() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden border-t border-line py-28 md:py-40">
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <AmbientVideo
          src={VIDEO.quoteRoom || VIDEO.moneyRoom || VIDEO.hero}
          poster={IMG.ledger}
          className="opacity-[0.22] grayscale-[0.25] contrast-125 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,transparent,var(--paper)_78%),linear-gradient(180deg,var(--paper),rgb(244_234_219/.62),var(--paper))]" />
      </div>

      <div className="shell grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
        {QUOTES.map((q, i) => (
          <Reveal key={q.who} delay={i * 0.1}>
            <motion.figure
              whileHover={reduce ? undefined : { y: -5 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="quote-card relative overflow-hidden rounded-[34px] border border-volt/20 bg-volt p-8 text-on-volt backdrop-blur-xl md:p-10"
            >
              <div className="pointer-events-none absolute inset-0 opacity-34 mix-blend-screen" aria-hidden="true">
                <AmbientVideo
                  src={VIDEO[QUOTE_VIDEO[i]] || VIDEO.quoteRoom || VIDEO.moneyRoom || VIDEO.hero}
                  poster={IMG.ledger}
                  className="scale-110"
                />
                <div className="absolute inset-0 bg-volt/62" />
              </div>
              <div className="row-light pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden="true" />
              <span className="display relative block text-[52px] leading-[0.6] text-sky" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="display relative mt-5 text-[clamp(1.5rem,3.2vw,2.4rem)] text-on-volt">
                {q.body}
              </blockquote>
              <figcaption className="relative mt-7 text-[13.5px] text-on-volt/60">
                <span className="font-bold text-on-volt">{q.who}</span>
                <br />
                {q.where}
              </figcaption>
            </motion.figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
