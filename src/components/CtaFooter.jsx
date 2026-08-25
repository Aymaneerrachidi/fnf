import { ArrowDownRight, Plus } from "@phosphor-icons/react";
import { Button, Reveal } from "./ui.jsx";

const COLUMNS = [
  ["Product", [["Browse crews", "#find"], ["How it works", "#how"], ["Safety", "#rules"]]],
  ["Company", [["About", "#top"], ["Contact", "mailto:hello@fnf.trade"], ["Press kit", "#top"]]],
  ["Legal", [["Terms", "#top"], ["Privacy", "#top"], ["Risk notice", "#rules"]]],
];

export default function CtaFooter({ onCreate }) {
  const browse = () => document.getElementById("find")?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer className="site-footer">
      <section className="footer-cta shell">
        <Reveal>
          <h2>
            Find people
            <span className="inline-heading-image" aria-hidden="true" />
            worth trading with.
          </h2>
          <p>Start with a room thesis. Stay for the people who can argue it with you.</p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={browse}>
              Browse crews
              <ArrowDownRight size={18} weight="bold" />
            </Button>
            <Button size="lg" variant="secondary" onClick={onCreate}>
              <Plus size={18} weight="bold" />
              Start a crew
            </Button>
          </div>
        </Reveal>
      </section>

      <div className="footer-grid shell">
        <div className="footer-brand">
          <a href="#top" aria-label="FNF home">FNF</a>
          <p>Friends not followers. Private rooms for people who would rather trade together.</p>
        </div>

        {COLUMNS.map(([heading, links]) => (
          <nav key={heading} aria-label={heading}>
            <h3>{heading}</h3>
            {links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}
          </nav>
        ))}
      </div>

      <div className="footer-base shell">
        <p>Nothing on FNF is financial advice. Memecoins go to zero regularly.</p>
        <span>2026 FNF Labs</span>
      </div>
    </footer>
  );
}
