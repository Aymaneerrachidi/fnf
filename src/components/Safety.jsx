import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ShieldCheck, UsersThree } from "@phosphor-icons/react";

gsap.registerPlugin(ScrollTrigger);

const NEVER = [
  "Paid signal tiers",
  "Affiliate links to launchpads",
  "A cut of anything you lose",
];

export default function Safety() {
  const root = useRef(null);
  const media = useRef(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !root.current || !media.current) return undefined;

    const context = gsap.context(() => {
      gsap
        .timeline({
          scrollTrigger: {
            trigger: media.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        })
        .fromTo(media.current, { scale: 0.88, opacity: 0.28 }, { scale: 1, opacity: 1, ease: "none" })
        .to(media.current, { scale: 0.96, opacity: 0.35, ease: "none" });
    }, root);

    return () => context.revert();
  }, [reduce]);

  return (
    <section id="rules" ref={root} className="safety-section section-space">
      <div className="shell">
        <header className="section-heading safety-heading">
          <h2>Small rooms. Clear boundaries.</h2>
          <p>
            A linked wallet can prove one account belongs to one person. It never proves a token is safe.
          </p>
        </header>

        <div className="trust-bento">
          <figure ref={media} className="trust-bento__image">
            <img
              src="/assets/fnf-glass-eight.webp"
              alt="Eight glass keys arranged around an open center."
              loading="lazy"
            />
          </figure>

          <article className="trust-bento__cap">
            <UsersThree size={30} weight="duotone" />
            <div>
              <h3>Eight is the hard cap.</h3>
              <p>Past eight people, a room becomes a broadcast. FNF keeps it a conversation.</p>
            </div>
          </article>

          <article className="trust-bento__fact">
            <strong>7 days</strong>
            <span>Trial week</span>
          </article>
          <article className="trust-bento__fact">
            <strong>0 tiers</strong>
            <span>No paid signals</span>
          </article>
          <article className="trust-bento__fact">
            <strong>1 review</strong>
            <span>Human, not automated</span>
          </article>
        </div>

        <div className="safety-contract">
          <div className="safety-contract__copy">
            <ShieldCheck size={32} weight="duotone" />
            <h3>FNF verifies people, not trades.</h3>
            <p>
              You decide what to buy, what to size, and when to leave. A report pauses a room while a person reads the log.
            </p>
          </div>
          <div className="never-list">
            <h3>What FNF will never ship</h3>
            {NEVER.map((item) => (
              <div key={item}>
                <Check size={17} weight="bold" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
