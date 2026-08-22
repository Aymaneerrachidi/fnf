import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { Button, EASE } from "./ui.jsx";

const LINKS = [
  { href: "#find", label: "Crew floor" },
  { href: "#how", label: "The ritual" },
  { href: "#rules", label: "House rules" },
];

function RegistrationMark() {
  return (
    <span className="reg-mark" aria-hidden="true">
      <span className="reg-mark__blue" />
      <span className="reg-mark__pink" />
      <span className="reg-mark__core" />
    </span>
  );
}

export default function Nav({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting));
    const target = document.getElementById("top-sentinel");
    if (target) observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div id="top-sentinel" className="absolute top-0 h-px w-full" aria-hidden="true" />
      <motion.header
        initial={reduce ? false : { y: -76, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: EASE }}
        className={`site-nav fixed inset-x-0 top-0 z-50 ${compact ? "is-compact" : ""}`}
      >
        <div className="nav-bar">
          <div className="nav-inner shell">
            <a href="#top" className="nav-logo" aria-label="FNF home">FNF</a>

            <nav className="nav-links" aria-label="Primary">
              {LINKS.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
            </nav>

            <div className="nav-right">
              <div className="nav-motion" aria-hidden="true">
                <span className="nav-motion__line" />
                <RegistrationMark />
              </div>
              <Button variant="pink" size="sm" className="hidden sm:inline-flex" onClick={onCreate}>Start a crew</Button>
              <button type="button" className="nav-menu md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
                <List size={20} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu fixed inset-0 z-[90] flex flex-col"
            initial={reduce ? false : { opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            <div className="flex h-[76px] items-center justify-between border-b border-current/25 px-5">
              <span className="display text-[38px] leading-[1.1]">FNF</span>
              <button type="button" onClick={() => setOpen(false)} className="nav-menu" aria-label="Close menu"><X size={20} weight="bold" /></button>
            </div>
            <nav className="flex flex-1 flex-col justify-center px-5" aria-label="Mobile navigation">
              {LINKS.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  initial={reduce ? false : { opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06, duration: 0.35, ease: EASE }}
                  className="display border-b border-current/25 py-6 text-[clamp(2.7rem,14vw,4.5rem)] leading-[1.02]"
                >{link.label}</motion.a>
              ))}
            </nav>
            <div className="p-5"><Button variant="paper" size="lg" className="w-full" onClick={() => { setOpen(false); onCreate(); }}>Start a crew</Button></div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
