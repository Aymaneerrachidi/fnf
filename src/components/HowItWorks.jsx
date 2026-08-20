import { motion, useReducedMotion } from "motion/react";
import { IMG, STEPS, VIDEO } from "../data.js";
import { AmbientVideo, EASE, Reveal } from "./ui.jsx";

const STEP_VIDEO = [
  "stepTrade",
  "stepCrews",
  "stepWeek",
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="how" className="relative isolate overflow-hidden border-t border-line py-28 md:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[62%] opacity-20 mix-blend-multiply" aria-hidden="true">
        <AmbientVideo src={VIDEO.ritual || VIDEO.process} poster={IMG.process} className="scale-110" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--paper),transparent_35%,var(--paper)_92%)]" />
      </div>
      <div className="shell">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <h2 className="display max-w-[12ch] text-[clamp(2.8rem,6vw,5.7rem)]">
              The trial week ritual.
            </h2>
            <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-ink-2">
              Answer, lurk, then prove you are useful before the room lets you stay.
            </p>
          </div>

          <Reveal>
            <div className="edge group overflow-hidden rounded-[34px] bg-paper-2">
              <AmbientVideo
                src={VIDEO.ritual || VIDEO.process}
                poster={IMG.process}
                className="photo-grain aspect-[16/9] transition-transform duration-500 ease-out group-hover:scale-[1.025]"
              />
            </div>
          </Reveal>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06}>
              <motion.article
                whileHover={reduce ? undefined : { y: -5 }}
                transition={{ duration: 0.32, ease: EASE }}
                className="step-card group relative h-full min-h-[290px] overflow-hidden rounded-[30px] border border-volt/20 bg-volt p-6 text-on-volt md:p-7"
              >
                <div className="pointer-events-none absolute inset-0 opacity-34 mix-blend-screen" aria-hidden="true">
                  <AmbientVideo
                    src={VIDEO[STEP_VIDEO[index]] || VIDEO.ritual || VIDEO.process}
                    poster={step.image}
                    className="scale-110"
                  />
                  <div className="absolute inset-0 bg-volt/62" />
                </div>
                <div className="row-light pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true" />
                <div className="nums relative mb-10 text-[12px] font-black text-sky">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="relative font-sans text-[24px] font-black leading-[1] text-on-volt">
                  {step.title}
                </h3>
                <p className="relative mt-4 text-[14px] leading-relaxed text-on-volt/78">{step.body}</p>
              </motion.article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
