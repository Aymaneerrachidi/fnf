import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { List, X } from "@phosphor-icons/react";
import { VIDEO } from "../data.js";
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
            "nav-shell pointer-events-auto relative mx-auto grid h-[76px] max-w-[1280px] grid-cols-[auto_1fr_auto] items-center gap-2 overflow-hidden rounded-full p-2 transition-all duration-300 md:gap-3 " +
            (lifted
              ? "bg-paper-2/88 shadow-[0_22px_70px_-52px_rgba(28,45,58,.64)] backdrop-blur-2xl"
              : "bg-paper-2/72 shadow-[0_18px_58px_-50px_rgba(28,45,58,.46)] backdrop-blur-xl")
          }
        >
          <div className="nav-motion-field pointer-events-none absolute inset-1 overflow-hidden rounded-full" aria-hidden="true">
            <video
              className="nav-core-video h-full w-full object-cover opacity-55 mix-blend-multiply"
              src={VIDEO.nav}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />
            <div className="nav-aurora absolute inset-y-2 left-[10%] w-[36%] rounded-full bg-sky/42 blur-xl" />
            <div className="nav-aurora nav-aurora-b absolute inset-y-2 right-[8%] w-[30%] rounded-full bg-volt/16 blur-xl" />
            <div className="nav-glint absolute inset-y-0 w-24 rotate-12 bg-white/28 blur-lg" />
          </div>

          <a
            href="#top"
            className="relative grid h-full min-w-[126px] place-items-center rounded-full bg-paper-2/92 px-5 text-volt shadow-[inset_0_0_0_1px_rgb(38_53_68/.08)]"
            aria-label="FNF home"
          >
            <span className="nav-type text-[38px] leading-none">FNF</span>
          </a>

          <div className="relative hidden h-full md:block">
            <nav
              aria-label="Primary"
              className="absolute inset-0 flex items-center justify-center gap-2"
            >
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="nav-type rounded-full bg-paper-2/80 px-5 py-3 text-[18px] text-ink shadow-[inset_0_0_0_1px_rgb(38_53_68/.055)] transition-[transform,background-color,color,box-shadow] hover:-translate-y-px hover:bg-paper-3 hover:text-volt hover:shadow-[inset_0_0_0_1px_rgb(49_95_118/.22)]"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          <div className="flex h-full items-center gap-2 justify-self-end">
            <Button size="sm" variant="volt" className="relative hidden h-full rounded-full px-7 sm:inline-flex" onClick={onCreate}>
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
