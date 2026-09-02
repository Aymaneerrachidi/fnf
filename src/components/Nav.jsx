import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, List, SpeakerHigh, SpeakerSlash, X } from "@phosphor-icons/react";
import { Button, EASE } from "./ui.jsx";

const LINKS = [
  { href: "#find", label: "Browse crews" },
  { href: "#how", label: "How it works" },
  { href: "#rules", label: "Safety" },
];

export default function Nav({ onCreate, soundEnabled, onToggleSound }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting));
    const sentinel = document.getElementById("top-sentinel");
    if (sentinel) observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <div id="top-sentinel" className="absolute top-0 h-px w-full" aria-hidden="true" />
      <motion.header
        className={`site-nav fixed inset-x-0 top-0 ${compact ? "is-compact" : ""}`}
        initial={reduce ? false : { y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: EASE }}
      >
        <div className="nav-inner shell">
          <a href="#top" className="nav-logo" aria-label="FNF home">
            FNF
          </a>

          <nav className="nav-links" aria-label="Primary">
            {LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-sound hidden sm:inline-grid"
              onClick={onToggleSound}
              aria-label={`${soundEnabled ? "Turn off" : "Turn on"} interface sounds`}
              aria-pressed={soundEnabled}
              title={`${soundEnabled ? "Mute" : "Enable"} interface sounds`}
            >
              {soundEnabled ? <SpeakerHigh size={17} weight="bold" /> : <SpeakerSlash size={17} weight="bold" />}
            </button>
            <Button size="sm" onClick={onCreate} className="hidden sm:inline-flex">
              Start a crew
            </Button>
            <button
              type="button"
              className="nav-menu md:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <List size={21} weight="bold" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu fixed inset-0"
            initial={reduce ? false : { opacity: 0, clipPath: "inset(0 0 100% 0 round 0 0 24px 24px)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0 round 0 0 24px 24px)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0 round 0 0 24px 24px)" }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="flex h-[72px] items-center justify-between px-5">
              <a href="#top" onClick={close} className="font-display text-[26px] font-bold">
                FNF
              </a>
              <button type="button" className="nav-menu" onClick={close} aria-label="Close menu">
                <X size={20} weight="bold" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col justify-center px-5" aria-label="Mobile primary">
              {LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={close}
                  className="mobile-menu__link"
                  initial={reduce ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + index * 0.07, ease: EASE }}
                >
                  {link.label}
                  <ArrowUpRight size={22} />
                </motion.a>
              ))}
            </nav>
            <div className="p-5">
              <button type="button" className="mobile-sound" onClick={onToggleSound} aria-pressed={soundEnabled}>
                {soundEnabled ? <SpeakerHigh size={18} /> : <SpeakerSlash size={18} />}
                Interface sounds {soundEnabled ? "on" : "off"}
              </button>
              <Button className="w-full" size="lg" onClick={() => { close(); onCreate(); }}>
                Start a crew
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
