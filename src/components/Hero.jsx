import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Plus, UsersFour } from "@phosphor-icons/react";
import { IMG, VIDEO } from "../data.js";
import { AmbientVideo, Button, EASE } from "./ui.jsx";

const passes = [
  ["Night Shift", "momentum", "1 seat"],
  ["Paper Route", "beginner", "4 seats"],
  ["Nine Lives", "snipe", "2 seats"],
];

export default function Hero({ onCreate }) {
  const reduce = useReducedMotion();

  const browse = () => {
    document.getElementById("find")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="top" className="relative isolate min-h-[100dvh] overflow-hidden pt-28 pb-14 md:pt-28">
      <div className="soft-field" aria-hidden="true" />
      <div className="shell grid min-h-[calc(100dvh-9rem)] grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_470px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.58, ease: EASE }}
          className="pb-2"
        >
          <motion.h1
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.62, delay: 0.04, ease: EASE }}
            className="display max-w-[980px] text-[clamp(3.3rem,8vw,7.8rem)] text-ink"
          >
            Find your people before the next trade.
          </motion.h1>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: EASE }}
            className="mt-7 max-w-[50ch] text-[17px] leading-relaxed text-ink-2 md:text-[19px]"
          >
            Small Solana rooms matched by style, hours and risk. Less public chat, more people who actually show up.
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

        <motion.aside
          initial={reduce ? false : { opacity: 0, y: 26, rotate: -1.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.62, delay: 0.1, ease: EASE }}
          className="relative rounded-[38px] border border-line bg-paper-2/86 p-3 shadow-[0_30px_90px_-62px_rgba(38,53,68,.55)] backdrop-blur-xl"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[32px] border border-line bg-paper-3">
            <AmbientVideo
              src={VIDEO.hero}
              poster={IMG.hero}
              priority
              className="photo-grain"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_36%,rgb(28_45_58/.84))]" />

            <div className="absolute left-4 top-4 rounded-full border border-white/30 bg-paper-2/84 px-4 py-2 backdrop-blur">
              <span className="font-mono text-[10px] font-black uppercase tracking-[0.08em] text-ink">
                crew pull
              </span>
            </div>

            <div className="absolute bottom-4 left-4 right-4 overflow-hidden rounded-[22px] border border-white/24 bg-paper-2/92 text-ink backdrop-blur-xl">
              {passes.map(([name, style, seats], index) => (
                <motion.button
                  key={name}
                  type="button"
                  onClick={browse}
                  className="group grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-paper-3/70"
                  initial={reduce ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38, delay: 0.22 + index * 0.05, ease: EASE }}
                >
                  <span>
                    <span className="block font-sans text-[15.5px] font-extrabold tracking-[-0.02em]">{name}</span>
                    <span className="mt-1 block font-mono text-[10.5px] font-bold uppercase tracking-[0.04em] text-ink-2">
                      {style} / {seats}
                    </span>
                  </span>
                  <span className="grid size-9 place-items-center rounded-full bg-ink text-paper transition-transform group-hover:translate-x-0.5">
                    <ArrowRight size={16} weight="bold" />
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
