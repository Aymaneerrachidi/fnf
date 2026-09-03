import { motion, useReducedMotion } from "motion/react";
import { ArrowDownRight } from "@phosphor-icons/react";
import { EASE } from "./ui.jsx";

const STEPS = [
  {
    number: "01",
    label: "Profile",
    title: "Say how you actually trade.",
    body: "Pick memecoins, perps, or day trading. Add your language, market hours, and how social you want the room to be.",
    note: "Five inputs. No résumé.",
    image: "/assets/process-profile-key-chrome-v5.png",
    className: "is-profile",
  },
  {
    number: "02",
    label: "Shortlist",
    title: "Read the room before you enter.",
    body: "See the room thesis, pace, language, live hours, and open seats before anybody asks to see your wallet.",
    note: "Three rooms, not three hundred.",
    image: "/assets/process-shortlist-key-chrome-v5.png",
    className: "is-match",
  },
  {
    number: "03",
    label: "Connect",
    title: "Request the open seat.",
    body: "The room sees the same trading profile you used to match. If the fit works both ways, you are in the circle.",
    note: "No trial-week theatre.",
    image: "/assets/process-connect-key-chrome-v5.png",
    className: "is-enter",
  },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();

  return (
    <section id="how" className="process-section section-space" aria-labelledby="process-title">
      <div className="shell">
        <header className="process-intro">
          <span className="pixel-kicker">How matching works</span>
          <h2 id="process-title">Three moves. Find your room.</h2>
          <p>No endless server list. FNF narrows the floor around how you trade and who you want beside you.</p>
        </header>

        <div className="process-grid">
          {STEPS.map((step, index) => (
            <motion.article
              key={step.number}
              className={`process-card ${step.className}`}
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.22 }}
              transition={{ duration: 0.58, delay: index * 0.08, ease: EASE }}
            >
              <div className="process-card__image" aria-hidden="true">
                <img src={step.image} alt="" decoding="async" loading="lazy" />
              </div>
              <div className="process-card__copy">
                <div className="process-card__eyebrow"><span>{step.number}</span><b>{step.label}</b></div>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
                <small>{step.note} <ArrowDownRight size={15} weight="bold" /></small>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
