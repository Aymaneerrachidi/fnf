import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { Button, EASE } from "./ui.jsx";

const LINKS = [
  { href: "#find", label: "Floor" },
  { href: "#how", label: "Ritual" },
  { href: "#rules", label: "Rules" },
];

export default function Nav({ onCreate }) {
  const [open, setOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.25 });

  useEffect(() => {
    const el = document.getElementById("top-sentinel");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setLifted(!e.isIntersecting), {
      rootMargin: "-10px 0px 0px 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div id="top-sentinel" className="absolute top-0 h-px w-full" aria-hidden="true" />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-5">
        <div
          className={
            "pointer-events-auto relative mx-auto grid h-[78px] max-w-[1320px] grid-cols-[auto_1fr_auto] items-center gap-2 rounded-[3px] border p-2 transition-all duration-300 md:gap-3 " +
            (lifted
              ? "border-line bg-paper-2/92 shadow-[0_22px_70px_-52px_rgba(28,45,58,.58)] backdrop-blur-xl"
              : "border-line bg-paper-2/78 backdrop-blur")
          }
        >
          <motion.div
            className="absolute inset-x-2 bottom-1 h-px origin-left rounded-full bg-volt/70"
            style={{ scaleX: reduce ? 0 : progress }}
            aria-hidden="true"
          />
          <a
            href="#top"
            className="receipt-rip grid h-full min-w-[126px] place-items-center border-r border-line px-5 text-volt"
            aria-label="FNF home"
          >
            <span className="nav-type text-[38px] leading-none">FNF</span>
          </a>

          <div className="relative hidden h-full overflow-hidden border-x border-line bg-paper-2 md:block">
            <nav
              aria-label="Primary"
              className="absolute inset-0 flex items-center justify-center gap-2"
            >
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="nav-type rounded-[3px] border border-transparent px-5 py-3 text-[18px] text-ink transition-colors hover:border-line hover:bg-paper-3 hover:text-volt"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex h-full items-center gap-2 justify-self-end">
            <Button size="sm" variant="volt" className="hidden h-full rounded-[3px] px-6 sm:inline-flex" onClick={onCreate}>
              <span className="nav-type text-[17px] tracking-[-0.04em]">Start</span>
            </Button>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="grid size-11 place-items-center rounded-full border border-line bg-paper-2 text-ink md:hidden"
            >
              <List size={18} weight="bold" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[90] bg-paper md:hidden"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div className="soft-field" aria-hidden="true" />
            <div className="receipt-rip relative h-[24dvh] overflow-hidden border-b border-line">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="absolute right-4 top-4 grid size-11 place-items-center rounded-full border border-line bg-paper-2 text-ink"
              >
                <X size={18} weight="bold" />
              </button>
              <span className="nav-type absolute bottom-5 left-5 text-[54px] leading-none text-volt">
                FNF
              </span>
            </div>
            <div className="flex flex-col px-5 pt-8">
              {LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="nav-type border-b border-line py-5 text-[34px]"
                  initial={reduce ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.32, ease: EASE }}
                >
                  {link.label}
                </motion.a>
              ))}
              <Button
                size="lg"
                variant="volt"
                className="mt-9 w-full"
                onClick={() => {
                  setOpen(false);
                  onCreate();
                }}
              >
                Start one
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
