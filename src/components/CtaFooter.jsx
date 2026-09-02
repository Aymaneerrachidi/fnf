import { ArrowDownRight, ArrowUpRight, Plus } from "@phosphor-icons/react";
import { Button, Reveal } from "./ui.jsx";

const LINKS = [
  ["Browse crews", "#find"],
  ["How it works", "#how"],
  ["Safety", "#rules"],
  ["About", "#top"],
  ["Contact", "mailto:hello@fnf.trade"],
  ["Terms", "#top"],
  ["Privacy", "#top"],
  ["Risk", "#rules"],
];

export default function CtaFooter({ onCreate }) {
  const browse = () => document.getElementById("find")?.scrollIntoView({ behavior: "smooth" });

  return (
    <footer id="footer" className="site-footer footer-simple">
      <div className="shell">
        <section className="footer-simple__cta">
          <Reveal className="footer-simple__copy">
            <span className="pixel-kicker">FNF / Friends, not followers</span>
            <h2>Find people worth trading with.</h2>
          </Reveal>

          <Reveal className="footer-simple__side" delay={0.06}>
            <p>Start with a room thesis. Stay for the people who can challenge it with you.</p>
            <div className="footer-simple__actions">
              <Button size="lg" variant="secondary" onClick={browse}>
                Browse crews <ArrowDownRight size={17} weight="bold" />
              </Button>
              <Button size="lg" onClick={onCreate}>
                Start a crew <Plus size={17} weight="bold" />
              </Button>
            </div>
          </Reveal>
        </section>

        <div className="footer-simple__nav">
          <a className="footer-simple__logo" href="#top" aria-label="FNF home">FNF</a>
          <nav aria-label="Footer navigation">
            {LINKS.map(([label, href]) => (
              <a key={label} href={href}>{label}<ArrowUpRight size={11} weight="bold" /></a>
            ))}
          </nav>
        </div>

        <div className="footer-simple__base">
          <p>Nothing on FNF is financial advice. Memecoins go to zero regularly.</p>
          <span>© 2026 FNF Labs · Solana</span>
        </div>
      </div>
    </footer>
  );
}
