import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle, Info, SpinnerGap, X } from "@phosphor-icons/react";
import { Button, Mark } from "./ui.jsx";

function useIsDesktop() {
  const [big, setBig] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 640px)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const on = (e) => setBig(e.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return big;
}

function Stat({ k, v }) {
  return (
    <div>
      <div className="text-[12px] font-medium text-ink-3">{k}</div>
      <div className="nums mt-1 text-[15px] font-bold text-ink">{v}</div>
    </div>
  );
}

export default function CrewDrawer({ crew, onClose, requested, onRequest }) {
  const reduce = useReducedMotion();
  const desktop = useIsDesktop();
  const [state, setState] = useState("idle"); // idle | sending | sent
  const closeRef = useRef(null);

  useEffect(() => {
    setState(requested ? "sent" : "idle");
  }, [crew, requested]);

  useEffect(() => {
    if (!crew) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [crew, onClose]);

  const send = () => {
    setState("sending");
    setTimeout(() => {
      setState("sent");
      onRequest(crew.id);
    }, 900);
  };

  return (
    <AnimatePresence>
      {crew && (
        <>
          <motion.button
            aria-label="Close crew details"
            onClick={onClose}
            className="fixed inset-0 z-[70] bg-ink/72 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={`${crew.name} details`}
            className="fixed inset-x-0 bottom-0 z-[71] flex max-h-[92dvh] flex-col rounded-t-[22px] border-t border-line-strong bg-paper-2 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[min(520px,100vw)] sm:max-h-none sm:rounded-none sm:border-t-0 sm:border-l"
            initial={reduce ? false : desktop ? { x: "100%" } : { y: "100%" }}
            animate={{ x: 0, y: 0 }}
            exit={reduce ? { opacity: 0 } : desktop ? { x: "100%" } : { y: "100%" }}
            transition={{ type: "spring", stiffness: 240, damping: 30 }}
          >
            <header className="flex items-start justify-between gap-4 border-b border-line bg-paper-3 p-6 text-ink">
              <div className="flex items-center gap-4">
                <Mark name={crew.name} tone="volt" size={48} />
                <div>
                  <h2 className="display text-[46px] leading-[.76]">{crew.name}</h2>
                  <p className="mt-2 text-[13px] text-ink-2">
                    {crew.trading}
                  </p>
                </div>
              </div>
              <button
                ref={closeRef}
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-10 shrink-0 place-items-center rounded-full border border-line-strong bg-paper-2 text-ink"
              >
                <X size={16} weight="bold" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <p className="text-[16px] leading-relaxed text-ink">{crew.thesis}</p>

                <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
                  <Stat k="Seats" v={`${crew.members} of ${crew.seats}`} />
                  <Stat k="In the room" v={crew.live} />
                  <Stat k="Language" v={crew.lang} />
                  <Stat k="Hours" v={crew.hours} />
                </div>
              </div>

              <div className="border-t border-line p-6">
                <h3 className="text-[13px] font-bold text-ink">What the room runs on</h3>
                <dl className="mt-4 divide-y divide-line">
                  {[
                    ["Room", crew.voice],
                    ["Receipts", crew.track],
                    ["Getting in", crew.access],
                    ["Running since", crew.age],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline justify-between gap-6 py-3">
                      <dt className="text-[13px] text-ink-3">{k}</dt>
                      <dd className="text-right text-[14px] font-medium text-ink">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border-t border-line p-6">
                <h3 className="text-[13px] font-bold text-ink">Who runs it</h3>
                <div className="mt-4 flex items-center gap-3">
                  <Mark name={crew.lead.name} size={40} />
                  <div>
                    <div className="text-[14px] font-bold text-ink">{crew.lead.name}</div>
                    <div className="text-[13px] text-ink-2">{crew.lead.handle}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 border-t border-line bg-paper-3 p-6">
                <Info size={18} weight="bold" className="mt-0.5 shrink-0 text-ink-2" />
                <p className="text-[13px] leading-relaxed text-ink-2">
                  A linked wallet tells you a person is real. It tells you nothing
                  about whether a token is safe. Size your first week accordingly.
                </p>
              </div>
            </div>

            <footer className="border-t border-line p-6">
              {state === "sent" ? (
                <div className="flex items-center gap-3 rounded-[14px] border border-line px-4 py-3.5">
                  <CheckCircle size={20} weight="fill" className="shrink-0 text-volt" />
                  <p className="text-[13.5px] font-medium text-ink">
                    Request sent. {crew.lead.name.split(" ")[0]} usually answers within a day.
                  </p>
                </div>
              ) : (
                <Button
                  variant="volt"
                  size="lg"
                  className="w-full"
                  onClick={send}
                  disabled={state === "sending"}
                >
                  {state === "sending" ? (
                    <>
                      <SpinnerGap size={17} weight="bold" className="animate-spin" />
                      Sending
                    </>
                  ) : (
                    "Request a seat"
                  )}
                </Button>
              )}
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
