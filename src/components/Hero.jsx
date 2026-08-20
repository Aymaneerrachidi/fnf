import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Plus, UsersFour } from "@phosphor-icons/react";
import { IMG, VIDEO } from "../data.js";
import { AmbientVideo, Button, EASE } from "./ui.jsx";

const roomSignals = [
  ["room pnl", "+18.4 SOL", "split after exit"],
  ["voice live", "7 degens", "one entry, one exit"],
  ["next seat", "2 open", "trial starts tonight"],
];

const tape = [
  "Night Shift clipped the exit",
  "Paper Route found the holder spread",
  "Nine Lives sat out after two misses",
  "Frogwater waited for liquidity",
  "Second Wave called the takeover early",
];

export default function Hero({ onCreate }) {
  const reduce = useReducedMotion();

  const browse = () => {
    document.getElementById("find")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="top" className="relative isolate min-h-[112dvh] overflow-hidden pt-28 pb-14 md:pt-30">
      <div className="soft-field" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[72dvh] overflow-hidden" aria-hidden="true">
        <AmbientVideo
          src={VIDEO.moneyRoom || VIDEO.hero}
          poster={IMG.hero}
          priority
          className="scale-[1.04] opacity-40 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_54%_18%,rgb(255_248_238/.12),transparent_28%),linear-gradient(180deg,rgb(244_234_219/.35),var(--paper)_92%)]" />
      </div>

      <div className="shell flex min-h-[calc(112dvh-9rem)] flex-col justify-end">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease: EASE }}
          className="relative z-10 max-w-[1200px] pb-8"
        >
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.04, ease: EASE }}
            className="display max-w-[1180px] text-[clamp(3.8rem,8.6vw,8.85rem)] text-ink"
          >
            Find your people before the next trade.
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="mt-7 max-w-[50ch] text-[17px] leading-relaxed text-ink-2 md:text-[19px]"
          >
            Private Solana rooms matched by rhythm, risk and hours. Trade memes with people who write the entry, share the exit, and remember who was there.
          </motion.p>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: EASE }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button variant="volt" size="lg" onClick={browse}>
              Browse crews
              <UsersFour size={18} weight="bold" />
            </Button>
            <Button variant="ghost" size="lg" onClick={onCreate}>
              <Plus size={18} weight="bold" />
              Start one
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.62, delay: 0.1, ease: EASE }}
          className="hero-terminal relative z-10 overflow-hidden rounded-[34px] border border-line bg-paper-2/80 p-3 shadow-[0_34px_110px_-72px_rgba(28,45,58,.66)] backdrop-blur-2xl"
        >
          <div className="relative min-h-[440px] overflow-hidden rounded-[28px] border border-line bg-paper-3 md:min-h-[520px]">
            <AmbientVideo
              src={VIDEO.moneyRoom || VIDEO.hero}
              poster={IMG.hero}
              priority
              className="photo-grain"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(28_45_58/.76),rgb(28_45_58/.2)_45%,rgb(255_248_238/.08)),linear-gradient(180deg,transparent_35%,rgb(244_234_219/.86))]" />
            <div className="scan-line" aria-hidden="true" />

            <div className="absolute left-4 right-4 top-4 flex flex-wrap items-center justify-between gap-3 md:left-6 md:right-6 md:top-6">
              <div className="rounded-full border border-white/30 bg-paper-2/86 px-4 py-2 backdrop-blur">
                <span className="utility text-ink">live after-close room</span>
              </div>
              <button
                type="button"
                onClick={browse}
                className="group rounded-full border border-white/35 bg-volt px-4 py-2 text-on-volt shadow-[0_14px_34px_-22px_rgba(28,45,58,.75)] backdrop-blur"
              >
                <span className="nav-type inline-flex items-center gap-2 text-[15px]">
                  enter floor
                  <ArrowRight size={15} weight="bold" className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </button>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
              <div className="overflow-hidden rounded-[22px] border border-white/28 bg-paper-2/88 text-ink shadow-[0_24px_70px_-46px_rgba(28,45,58,.72)] backdrop-blur-2xl">
                <div className="money-tape border-b border-line py-3">
                  <div className="money-tape-track flex min-w-max gap-8 px-4">
                    {[...tape, ...tape].map((item, index) => (
                      <span key={`${item}-${index}`} className="utility text-ink-2">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-px bg-line md:grid-cols-3">
                  {roomSignals.map(([label, value, note], index) => (
                    <motion.button
                      key={label}
                      type="button"
                      onClick={browse}
                      className="group relative overflow-hidden bg-paper-2 px-5 py-5 text-left transition-colors hover:bg-paper-3"
                      initial={reduce ? false : { opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.44, delay: 0.2 + index * 0.07, ease: EASE }}
                    >
                      <span className="utility text-ink-3">{label}</span>
                      <span className="nums mt-2 block text-[clamp(1.65rem,3vw,2.75rem)] font-black leading-none tracking-[-0.06em] text-ink">
                        {value}
                      </span>
                      <span className="mt-2 block text-[12.5px] font-bold text-ink-2">{note}</span>
                      <span className="absolute right-4 top-4 grid size-8 place-items-center rounded-full border border-line text-ink transition-transform group-hover:translate-x-0.5">
                        <ArrowRight size={14} weight="bold" />
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
