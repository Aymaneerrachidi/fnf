import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle, SpinnerGap, X } from "@phosphor-icons/react";
import { FILTERS } from "../data.js";
import { Button, EASE, Field, inputClass } from "./ui.jsx";

const EMPTY = {
  name: "",
  thesis: "",
  trading: "Memecoins",
  lang: "English",
  hours: "Europe",
  voice: "Voice daily",
  seats: "8",
};

const opts = (id) => FILTERS.find((f) => f.id === id).options;

function validate(v) {
  const e = {};
  if (v.name.trim().length < 3) e.name = "Give the crew a name of at least 3 characters.";
  else if (v.name.trim().length > 24) e.name = "Keep it under 24 characters.";
  if (v.thesis.trim().length < 20)
    e.thesis = "Write at least 20 characters so people know what they are joining.";
  else if (v.thesis.trim().length > 200) e.thesis = "Keep it under 200 characters.";
  const seats = Number(v.seats);
  if (!Number.isInteger(seats) || seats < 4 || seats > 8)
    e.seats = "A crew holds between 4 and 8 people.";
  return e;
}

export default function CreateCrew({ open, onClose, onCreated }) {
  const reduce = useReducedMotion();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | saving | done
  const firstRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setValues(EMPTY);
    setErrors({});
    setState("idle");
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => firstRef.current?.focus(), 120);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      clearTimeout(t);
    };
  }, [open, onClose]);

  const set = (k) => (e) => {
    const value = e.target.value;
    setValues((v) => ({ ...v, [k]: value }));
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));
  };

  const submit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = document.querySelector('[aria-invalid="true"]');
      first?.focus();
      return;
    }
    setState("saving");
    setTimeout(() => {
      setState("done");
      onCreated({
        id: `${values.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
        name: values.name.trim(),
        thesis: values.thesis.trim(),
        trading: values.trading,
        lang: values.lang,
        hours: values.hours,
        voice: values.voice,
        members: 1,
        seats: Number(values.seats),
        live: 1,
        age: "Started today",
        track: "No history yet",
        access: "Open",
        lead: { name: "You", handle: "your handle" },
      });
    }, 900);
  };

  const selects = [
    ["trading", "Trading"],
    ["lang", "Language"],
    ["hours", "Hours"],
    ["voice", "Room"],
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close"
            onClick={onClose}
            className="fixed inset-0 z-[80] bg-ink/72 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-title"
            className="fixed inset-x-0 bottom-0 z-[81] max-h-[92dvh] overflow-y-auto rounded-t-[3px] border-t border-ink/35 bg-paper-2 sm:inset-0 sm:m-auto sm:h-fit sm:max-h-[88dvh] sm:w-[min(640px,calc(100vw-32px))] sm:rounded-[3px] sm:border"
            initial={reduce ? false : { opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink/30 bg-paper-3 p-6">
              <div>
                <h2 id="create-title" className="display text-[48px] leading-[.76]">
                  Start a crew
                </h2>
                <p className="mt-2.5 max-w-[42ch] text-[13.5px] text-ink-2">
                  Write the room you would want to join. People read this before
                  they read anything else.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid size-10 shrink-0 place-items-center rounded-[2px] border border-ink bg-volt text-on-volt"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {state === "done" ? (
              <div className="flex flex-col items-start gap-5 p-6">
                <CheckCircle size={34} weight="fill" className="text-volt" />
                <div>
                  <h3 className="display text-[42px] leading-[.8]">{values.name} is live</h3>
                  <p className="mt-2 max-w-[46ch] text-[14px] leading-relaxed text-ink-2">
                    It is at the top of the board with {Number(values.seats) - 1} seats
                    open. Requests land in your inbox.
                  </p>
                </div>
                <Button variant="volt" onClick={onClose}>
                  See it on the board
                </Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-6 p-6">
                <Field id="crew-name" label="Crew name" error={errors.name}>
                  <input
                    id="crew-name"
                    ref={firstRef}
                    className={inputClass}
                    value={values.name}
                    onChange={set("name")}
                    aria-invalid={Boolean(errors.name)}
                    autoComplete="off"
                  />
                </Field>

                <Field
                  id="crew-thesis"
                  label="What the room trades"
                  error={errors.thesis}
                  hint={`${values.thesis.trim().length} of 200 characters`}
                >
                  <textarea
                    id="crew-thesis"
                    rows={3}
                    className={`${inputClass} h-auto resize-none py-3 leading-relaxed`}
                    value={values.thesis}
                    onChange={set("thesis")}
                    aria-invalid={Boolean(errors.thesis)}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  {selects.map(([id, label]) => (
                    <Field key={id} id={`crew-${id}`} label={label}>
                      <select
                        id={`crew-${id}`}
                        className={inputClass}
                        value={values[id]}
                        onChange={set(id)}
                      >
                        {opts(id).map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </Field>
                  ))}

                  <Field
                    id="crew-seats"
                    label="Seats"
                    error={errors.seats}
                    hint="Between 4 and 8."
                  >
                    <input
                      id="crew-seats"
                      className={`${inputClass} nums`}
                      type="number"
                      min="4"
                      max="8"
                      value={values.seats}
                      onChange={set("seats")}
                      aria-invalid={Boolean(errors.seats)}
                    />
                  </Field>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
                  <Button type="button" variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="volt" disabled={state === "saving"}>
                    {state === "saving" ? (
                      <>
                        <SpinnerGap size={16} weight="bold" className="animate-spin" />
                        Creating
                      </>
                    ) : (
                      "Create crew"
                    )}
                  </Button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
