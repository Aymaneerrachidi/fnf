import { IMG, VIDEO } from "../data.js";
import { AmbientVideo, Button } from "./ui.jsx";

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
    <>
      <section className="relative isolate overflow-hidden border-t border-line">
        <div className="absolute inset-0 -z-10">
          <AmbientVideo src={VIDEO.footerRoom || VIDEO.quoteRoom || VIDEO.hero} poster={IMG.walk} className="photo-grain opacity-38" />
          <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_50%,rgb(255_248_238/.22),var(--paper)_82%)]" />
          <div className="absolute inset-0 bg-paper/66" />
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
      </section>

      <footer className="relative isolate overflow-hidden border-t border-line bg-paper-2/70 py-16">
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16] mix-blend-multiply" aria-hidden="true">
          <AmbientVideo src={VIDEO.footerRoom || VIDEO.quoteRoom || VIDEO.hero} poster={IMG.walk} className="scale-110" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(255_248_238/.88),rgb(255_248_238/.96))]" />
        </div>
        <div className="shell grid grid-cols-2 gap-10 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5">
            <span className="nav-type text-[34px] leading-none text-volt">FNF</span>
            <p className="mt-4 max-w-[30ch] text-[14px] leading-relaxed text-ink-2">
              Friends not followers. A quieter way to find people who trade Solana the way you do.
            </p>
          </div>
          {COLUMNS.map((c) => (
            <nav key={c.head} className="md:col-span-2 md:col-start-auto" aria-label={c.head}>
              <h3 className="nav-type text-[15px] text-ink">{c.head}</h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {c.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="font-sans text-[14px] font-semibold tracking-[-0.02em] text-ink-2 transition-colors hover:text-ink"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="shell mt-14 flex flex-col gap-3 border-t border-line pt-6 text-[12.5px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>Nothing on FNF is financial advice. Memecoins go to zero regularly.</p>
          <p>2026 FNF Labs</p>
        </div>
      </footer>
    </>
  );
}
