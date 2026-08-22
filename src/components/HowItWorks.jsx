import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { STEPS } from "../data.js";
import { AmbientVideo } from "./ui.jsx";

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const root = useRef(null);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const media = gsap.matchMedia();
    media.add("(min-width: 900px)", () => {
      const cards = gsap.utils.toArray(".ritual-scene");
      cards.forEach((card, index) => {
        if (index === cards.length - 1) return;
        gsap.to(card, {
          scale: 0.94 - index * 0.01,
          opacity: 0.5,
          filter: "blur(2px)",
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top top+=104",
            endTrigger: cards[index + 1],
            end: "top top+=104",
            scrub: true,
          },
        });
      });
    });
    return () => media.revert();
  }, { scope: root });

  return (
    <section id="how" ref={root} className="ritual-section relative py-28 md:py-44">
      <div className="shell">
        <header className="ritual-head">
          <p className="utility text-pink">The matching ritual</p>
          <h2>THREE MOVES.<br /><span>SEVEN NIGHTS.</span></h2>
          <p>Enough structure to find your people. Not enough ceremony to make it weird.</p>
        </header>

        <div className="ritual-stack">
          {STEPS.map((step, index) => (
            <article key={step.title} className={`ritual-scene ritual-scene--${index + 1}`}>
              <div className="ritual-scene__art">
                <AmbientVideo src={step.video} poster={step.image} />
                <span className="ritual-scene__number nums">0{index + 1}</span>
              </div>
              <div className="ritual-scene__copy">
                <span className="utility">{index === 0 ? "Your settings" : index === 1 ? "The shortlist" : "The trial"}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <div className="ritual-signal" aria-hidden="true"><i /><i /><i /><i /></div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
