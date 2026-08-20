import { IMG } from "../data.js";
import { Reveal } from "./ui.jsx";

const QUOTES = [
  {
    body: "Rasmr says you need to be in a good group chat if you’re gonna trade memes.",
    who: "Rasmr",
    where: "On trading memes",
  },
  {
    body: "Most successful traders are in private FNF’s.",
    who: "Trencher",
    where: "Private rooms",
  },
];

export default function Voices() {
  return (
    <section className="relative isolate overflow-hidden border-t border-line py-28 md:py-40">
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <img
          src={IMG.ledger.src}
          alt=""
          className="h-full w-full object-cover opacity-[0.14] grayscale contrast-150"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[radial-gradient(75%_60%_at_50%_50%,transparent,var(--paper)_80%)]" />
      </div>

      <div className="shell grid grid-cols-1 gap-14 md:grid-cols-2 md:gap-20">
        {QUOTES.map((q, i) => (
          <Reveal key={q.who} delay={i * 0.1}>
            <figure>
              <span className="display block text-[52px] leading-[0.6] text-volt" aria-hidden="true">
                &ldquo;
              </span>
              <blockquote className="display mt-5 text-[clamp(1.5rem,3.2vw,2.4rem)]">
                {q.body}
              </blockquote>
              <figcaption className="mt-7 text-[13.5px] text-ink-3">
                <span className="font-bold text-ink">{q.who}</span>
                <br />
                {q.where}
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
