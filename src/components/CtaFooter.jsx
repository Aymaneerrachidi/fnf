import { motion } from "motion/react";
import { IMG, VIDEO } from "../data.js";
import { AmbientVideo, Button, EASE } from "./ui.jsx";

const COLUMNS = [
  {
    head: "Product",
    links: [
      ["The board", "#find"],
      ["How it works", "#how"],
      ["House rules", "#rules"],
    ],
  },
  {
    head: "Company",
    links: [
      ["About", "#top"],
      ["Contact", "#top"],
      ["Press kit", "#top"],
    ],
  },
  {
    head: "Legal",
    links: [
      ["Terms", "#top"],
      ["Privacy", "#top"],
      ["Risk notice", "#top"],
    ],
  },
];

export default function CtaFooter({ onCreate }) {
  return (
    <section className="closing-room relative isolate overflow-hidden border-t border-line text-on-volt">
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <AmbientVideo
          src={VIDEO.footerRoom || VIDEO.quoteRoom || VIDEO.hero}
          poster={IMG.walk}
          className="photo-grain scale-105 opacity-42 mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(244_234_219/.88)_0%,rgb(244_234_219/.82)_38%,rgb(49_95_118/.72)_74%,rgb(28_45_58/.88)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_48%_at_28%_40%,rgb(255_248_238/.56),transparent_68%),radial-gradient(58%_44%_at_72%_72%,rgb(143_204_230/.24),transparent_72%)]" />
        <div className="closing-blue-mist absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(180deg,transparent,rgb(49_95_118/.36)_38%,rgb(28_45_58/.64))]" />
        <div className="footer-glow absolute bottom-28 left-[16%] h-52 w-[52%] rounded-full bg-sky/20 blur-3xl" />
      </div>

      <div className="shell flex min-h-[78dvh] flex-col justify-end pt-28 pb-20 md:pt-40 md:pb-24">
        <motion.div
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="relative max-w-[760px]"
        >
          <h2 className="display max-w-[15ch] text-[clamp(2.2rem,5.6vw,4.8rem)] text-ink">
            Eight seats. One of them is open.
          </h2>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button as="a" href="#find" variant="volt" size="lg">
              Find a crew
            </Button>
            <Button size="lg" variant="ghost" onClick={onCreate}>
              Start a crew
            </Button>
          </div>
        </motion.div>
      </div>

      <footer className="relative pb-16">
        <div className="closing-bridge pointer-events-none absolute inset-x-0 -top-40 h-48" aria-hidden="true">
          <div className="absolute inset-x-[5%] bottom-0 h-24 rounded-[999px] bg-volt/26 blur-3xl" />
          <div className="footer-route absolute inset-x-[7%] bottom-16 h-px bg-sky/60" />
        </div>

        <div className="shell">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="footer-minimal grid gap-10 border-t border-white/12 pt-10 md:grid-cols-[1.28fr_0.72fr_0.72fr_0.72fr] md:gap-14"
          >
            <div>
              <span className="nav-type text-[38px] leading-none text-sky">FNF</span>
              <p className="mt-4 max-w-[31ch] text-[14px] leading-relaxed text-on-volt/72">
                Friends not followers. A quieter way to find people who trade Solana the way you do.
              </p>
            </div>

            {COLUMNS.map((c) => (
              <nav key={c.head} aria-label={c.head}>
                <h3 className="nav-type text-[17px] text-on-volt">{c.head}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {c.links.map(([label, href]) => (
                    <li key={label}>
                      <a
                        href={href}
                        className="font-sans text-[14px] font-semibold tracking-[-0.02em] text-on-volt/58 transition-colors hover:text-sky"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </motion.div>
        </div>
        <div className="shell mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-[12.5px] text-on-volt/50 sm:flex-row sm:items-center sm:justify-between">
          <p>Nothing on FNF is financial advice. Memecoins go to zero regularly.</p>
          <p>2026 FNF Labs</p>
        </div>
      </footer>
    </section>
  );
}
