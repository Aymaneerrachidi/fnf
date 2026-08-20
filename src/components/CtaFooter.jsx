import { motion, useReducedMotion } from "motion/react";
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
  const reduce = useReducedMotion();

  return (
    <>
      <section className="relative isolate overflow-hidden border-t border-line pb-24 md:pb-32">
        <div className="absolute inset-0 -z-10">
          <AmbientVideo src={VIDEO.footerRoom || VIDEO.quoteRoom || VIDEO.hero} poster={IMG.walk} className="photo-grain opacity-38" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,rgb(255_248_238/.22),var(--paper)_82%)]" />
          <div className="absolute inset-0 bg-paper/66" />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(180deg,transparent,rgb(244_234_219/.76)_34%,rgb(49_95_118/.92)_100%)]" />
        </div>
        <div className="shell flex min-h-[72dvh] flex-col justify-end py-24 md:py-36">
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
        </div>
        <div className="footer-handoff pointer-events-none absolute inset-x-4 bottom-10 mx-auto h-24 max-w-[1180px] overflow-hidden rounded-t-[48px] border border-white/12 bg-volt/76 backdrop-blur-md md:bottom-12" aria-hidden="true">
          <div className="absolute inset-0 opacity-35 mix-blend-screen">
            <AmbientVideo src={VIDEO.footerRoom || VIDEO.quoteRoom || VIDEO.hero} poster={IMG.walk} className="scale-110" />
          </div>
          <div className="footer-route absolute inset-x-0 top-0 h-px bg-sky/70" />
        </div>
      </section>

      <footer className="relative isolate -mt-28 overflow-hidden rounded-t-[46px] border-t border-white/12 bg-volt pt-28 pb-16 text-on-volt md:-mt-32">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <AmbientVideo
            src={VIDEO.footerRoom || VIDEO.quoteRoom || VIDEO.hero}
            poster={IMG.walk}
            className="scale-110 opacity-40 mix-blend-screen"
          />
          <div className="absolute inset-0 bg-[radial-gradient(70%_42%_at_50%_0%,rgb(255_248_238/.18),transparent_64%),radial-gradient(65%_85%_at_74%_40%,rgb(143_204_230/.22),transparent_62%),linear-gradient(180deg,rgb(49_95_118/.72),rgb(28_45_58/.78))]" />
          <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgb(244_234_219/.16),transparent)]" />
          <div className="footer-glow absolute -bottom-24 left-[18%] h-48 w-[46%] rounded-full bg-sky/20 blur-3xl" />
        </div>

        <div className="shell grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-5">
          <motion.div
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="footer-panel col-span-2 rounded-[32px] border border-white/12 bg-paper-2/10 p-7 backdrop-blur-xl md:col-span-5 md:p-8"
          >
            <span className="nav-type text-[38px] leading-none text-sky">FNF</span>
            <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-on-volt/76">
              Friends not followers. A quieter way to find people who trade Solana the way you do.
            </p>
            <div className="money-tape mt-8 overflow-hidden rounded-full border border-white/10 bg-paper-2/10 py-2">
              <div className="money-tape-track flex min-w-max gap-7 px-4">
                {["one open seat", "private room", "no signal tiers", "trade together", "one open seat", "private room"].map((item, index) => (
                  <span key={`${item}-${index}`} className="utility text-on-volt/56">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {COLUMNS.map((c, index) => (
            <motion.nav
              key={c.head}
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: 0.05 + index * 0.04, ease: EASE }}
              className="footer-panel rounded-[32px] border border-white/12 bg-paper-2/10 p-7 backdrop-blur-xl md:col-span-2 md:col-start-auto"
              aria-label={c.head}
            >
              <h3 className="nav-type text-[17px] text-on-volt">{c.head}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="font-sans text-[14px] font-semibold tracking-[-0.02em] text-on-volt/64 transition-colors hover:text-sky"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.nav>
          ))}
        </div>
        <div className="shell mt-5 flex flex-col gap-3 rounded-[28px] border border-white/10 bg-paper-2/8 px-6 py-5 text-[12.5px] text-on-volt/58 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <p>Nothing on FNF is financial advice. Memecoins go to zero regularly.</p>
          <p>2026 FNF Labs</p>
        </div>
      </footer>
    </>
  );
}
