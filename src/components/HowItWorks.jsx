import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CARDS = [
  {
    label: "Profile",
    title: "Say how you trade.",
    body: "Choose memecoins, perps, or day trading. Add your language, hours, and how much voice chat you want.",
    image: "/assets/fnf-glass-profile.webp",
    className: "is-profile",
  },
  {
    label: "Match",
    title: "Read the room first.",
    body: "FNF brings you three crews with an open seat. Their thesis is visible before your wallet history is.",
    image: "/assets/fnf-glass-match.webp",
    className: "is-match",
  },
  {
    label: "Trial",
    title: "Trade together for a week.",
    body: "Sit in for seven days. Either side can end the trial without turning it into a performance review.",
    image: "/assets/fnf-glass-trial.webp",
    className: "is-trial",
  },
];

export default function HowItWorks() {
  const root = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !root.current) return undefined;

    const context = gsap.context(() => {
      const cards = gsap.utils.toArray(".stack-card");
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return;

        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cards[cards.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });

        gsap.to(card.querySelector(".stack-card__panel"), {
          scale: 0.93,
          opacity: 0.46,
          ease: "none",
          scrollTrigger: {
            trigger: cards[index + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, root);

    return () => context.revert();
  }, [reduce]);

  return (
    <section id="how" ref={root} className="process-section">
      <div className="process-intro shell">
        <h2>Three moves. One trial week.</h2>
        <p>Enough structure to find a fit, without turning trading into a job application.</p>
      </div>

      <div className="stack-cards">
        {CARDS.map((card) => (
            <div key={card.label} className={`stack-card ${card.className}`}>
              <article className="stack-card__panel shell">
                <div className="stack-card__copy">
                  <span>{card.label}</span>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </div>
                <div className="stack-card__visual" aria-hidden="true">
                  <img src={card.image} alt="" decoding="async" />
                </div>
              </article>
            </div>
        ))}
      </div>
    </section>
  );
}
