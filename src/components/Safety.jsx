import { motion, useReducedMotion } from "motion/react";
import { ShieldWarning } from "@phosphor-icons/react";
import { IMG, VIDEO } from "../data.js";
import { AmbientVideo, EASE, Reveal } from "./ui.jsx";

const NEVER = [
  "Paid signal tiers",
  "Affiliate links to launchpads",
  "A cut of anything you lose",
];

export default function Safety() {
  const reduce = useReducedMotion();

  return (
    <section id="rules" className="relative isolate overflow-hidden border-t border-line py-28 md:py-40">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-full opacity-[0.16] mix-blend-multiply" aria-hidden="true">
        <AmbientVideo src={VIDEO.trust || VIDEO.wallet} poster={IMG.hands} className="scale-110" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_52%_at_50%_42%,transparent,var(--paper)_82%)]" />
      </div>
      <div className="shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h2 className="display max-w-[14ch] text-[clamp(2.4rem,6vw,4.6rem)]">
            Small rooms fail differently.
          </h2>
          <p className="max-w-[36ch] text-[15.5px] leading-relaxed text-ink-2">
            Eight people can be wrong together. They cannot quietly farm each
            other, which is the failure mode of every 4000 person alpha server.
          </p>
        </div>

        <div className="mt-14 grid auto-rows-[minmax(140px,auto)] grid-flow-dense grid-cols-1 gap-3 md:grid-cols-12">
          <Reveal className="md:col-span-7 md:row-span-2">
            <motion.div
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="step-card relative flex h-full flex-col justify-between gap-10 overflow-hidden rounded-[34px] border border-volt/20 bg-volt p-8 text-on-volt md:p-10"
            >
              <div className="pointer-events-none absolute inset-0 opacity-34 mix-blend-screen" aria-hidden="true">
                <AmbientVideo src={VIDEO.walletProof || VIDEO.trust || VIDEO.wallet} poster={IMG.hands} className="scale-110" />
                <div className="absolute inset-0 bg-volt/62" />
              </div>
              <h3 className="display relative max-w-[16ch] text-[clamp(1.6rem,3.2vw,2.6rem)] text-on-volt">
                A linked wallet proves a person. It never proves a token.
              </h3>
              <p className="relative max-w-[50ch] text-[15px] leading-relaxed text-on-volt/78">
                FNF checks that the trader across from you is one wallet with one
                history and one account. That is the entire claim. Nobody here
                audits a contract for you, and any room that says it does is
                selling something.
              </p>
            </motion.div>
          </Reveal>

          <Reveal delay={0.06} className="md:col-span-5">
            <div className="edge relative h-full min-h-[240px] overflow-hidden rounded-[34px] bg-paper-2">
              <AmbientVideo
                src={VIDEO.trust || VIDEO.wallet}
                poster={IMG.hands}
                className="photo-grain absolute inset-0 opacity-70 transition-transform duration-500 ease-out hover:scale-[1.025]"
              />
            </div>
          </Reveal>

          <Reveal delay={0.1} className="md:col-span-5">
            <motion.div
              whileHover={reduce ? undefined : { y: -4, scale: 1.01 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-[34px] bg-volt p-8 text-on-volt md:p-10"
            >
              <div className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen" aria-hidden="true">
                <AmbientVideo src={VIDEO.hardCap || VIDEO.trust || VIDEO.wallet} poster={IMG.hands} className="scale-110" />
                <div className="absolute inset-0 bg-volt/62" />
              </div>
              <div className="floor-orbit pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-paper-3/20 blur-2xl" aria-hidden="true" />
              <span className="nums relative text-[clamp(3.6rem,8vw,5.6rem)] font-black leading-[0.78]">8</span>
              <p className="relative max-w-[26ch] text-[15px] leading-relaxed font-bold">
                The hard cap. Past eight people a room stops being a room and
                starts being a broadcast.
              </p>
            </motion.div>
          </Reveal>

          <Reveal delay={0.14} className="md:col-span-6">
            <motion.div
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="step-card relative flex h-full flex-col justify-center gap-4 overflow-hidden rounded-[34px] border border-volt/20 bg-volt p-8 text-on-volt md:p-10"
            >
              <div className="pointer-events-none absolute inset-0 opacity-34 mix-blend-screen" aria-hidden="true">
                <AmbientVideo src={VIDEO.neverShip || VIDEO.trust || VIDEO.wallet} poster={IMG.ledger} className="scale-110" />
                <div className="absolute inset-0 bg-volt/62" />
              </div>
              <h3 className="utility relative text-on-volt/60">
                things fnf will never ship
              </h3>
              {NEVER.map((line) => (
                <p key={line} className="display relative text-[clamp(1.15rem,2vw,1.6rem)] text-on-volt">
                  {line}
                </p>
              ))}
            </motion.div>
          </Reveal>

          <Reveal delay={0.18} className="md:col-span-6">
            <motion.div
              whileHover={reduce ? undefined : { y: -4 }}
              transition={{ duration: 0.32, ease: EASE }}
              className="relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-[34px] border border-volt/20 bg-volt p-8 text-on-volt md:p-10"
            >
              <div className="pointer-events-none absolute inset-0 opacity-34 mix-blend-screen" aria-hidden="true">
                <AmbientVideo src={VIDEO.reportFreeze || VIDEO.trust || VIDEO.wallet} poster={IMG.hands} className="scale-110" />
                <div className="absolute inset-0 bg-volt/62" />
              </div>
              <div className="row-light pointer-events-none absolute inset-x-0 top-0 h-px" aria-hidden="true" />
              <ShieldWarning size={30} weight="bold" className="relative text-sky" aria-hidden="true" />
              <p className="relative max-w-[34ch] text-[clamp(1.15rem,2vw,1.6rem)] leading-snug font-bold text-on-volt">
                One report freezes a room for everybody in it while a human reads
                the log.
              </p>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
