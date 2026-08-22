import { ArrowUpRight } from "@phosphor-icons/react";
import { UI_ART } from "../data.js";
import { Button } from "./ui.jsx";

const GROUPS = [
  ["Product", [["The board", "#find"], ["How it works", "#how"], ["House rules", "#rules"]]],
  ["Company", [["About", "#top"], ["Contact", "mailto:hello@fnf.club"], ["Press kit", "#top"]]],
  ["Legal", [["Terms", "#top"], ["Privacy", "#top"], ["Risk notice", "#rules"]]],
];

export default function CtaFooter({ onCreate }) {
  return (
    <section className="closing-section">
      <div className="closing-bridge" aria-hidden="true" />
      <div className="shell">
        <div className="closing-poster">
          <img src={UI_ART.world} alt="Private trading rooms connected around the world." width="1254" height="1254" loading="lazy" />
          <div className="closing-poster__shade" aria-hidden="true" />
          <div className="closing-poster__copy">
            <span className="utility">One seat is enough</span>
            <h2>YOUR PEOPLE<br />ARE ONLINE.</h2>
            <p>Find the room where names matter more than follower counts.</p>
            <div className="flex flex-wrap gap-2"><Button as="a" href="#find" variant="pink" size="lg">Find a crew <ArrowUpRight size={17} weight="bold" /></Button><Button variant="dark" size="lg" onClick={onCreate}>Start a crew</Button></div>
          </div>
        </div>

        <footer className="site-footer">
          <div className="footer-brand">
            <a href="#top" aria-label="FNF home">FNF</a>
            <p>Friends not followers. A private way to find people who trade Solana the way you do.</p>
            <div className="footer-registration" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="footer-links">
            {GROUPS.map(([title, links]) => (
              <div key={title}><h3>{title}</h3>{links.map(([label, href]) => <a key={label} href={href}>{label}</a>)}</div>
            ))}
          </div>
          <div className="footer-bottom">
            <p>Nothing on FNF is financial advice. Memecoins go to zero regularly.</p>
            <p>2026 FNF Labs</p>
          </div>
        </footer>
      </div>
    </section>
  );
}
