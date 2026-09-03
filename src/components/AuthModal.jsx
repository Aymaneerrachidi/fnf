import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { CheckCircle, SpinnerGap, X } from "@phosphor-icons/react";
import { signIn, signUp } from "../services/auth.js";
import { Button, EASE, Field, inputClass } from "./ui.jsx";

const EMPTY = { displayName: "", email: "", password: "" };

function validate(values, mode) {
  const errors = {};
  if (mode === "signup" && values.displayName.trim().length < 2) {
    errors.displayName = "Enter the name your room will see.";
  }
  if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) errors.email = "Enter a valid email.";
  if (values.password.length < 8) errors.password = "Use at least 8 characters.";
  return errors;
}

export default function AuthModal({ open, onClose, onAuthenticated }) {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("signup");
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle");
  const firstRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setState("idle");
    const onKey = (event) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstRef.current?.focus(), 100);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(timer);
    };
  }, [open, onClose]);

  const set = (key) => (event) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    setErrors((current) => ({ ...current, [key]: undefined, form: undefined }));
  };

  const switchMode = () => {
    setMode((current) => (current === "signup" ? "signin" : "signup"));
    setErrors({});
    setState("idle");
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validate(values, mode);
    setErrors(found);
    if (Object.keys(found).length) return;

    setState("saving");
    try {
      const result = mode === "signup" ? await signUp(values) : await signIn(values);
      if (result.session) {
        setState("idle");
        onAuthenticated(result.session);
      } else {
        setState("verify");
      }
    } catch (error) {
      setState("idle");
      setErrors({ form: error.message || "Account access failed. Try again." });
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            aria-label="Close account dialog"
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-ink/80 backdrop-blur-sm"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
            className="fixed inset-x-0 bottom-0 z-[91] rounded-t-[22px] border-t border-line-strong bg-paper-2 sm:inset-0 sm:m-auto sm:h-fit sm:w-[min(480px,calc(100vw-32px))] sm:rounded-[22px] sm:border"
            initial={reduce ? false : { opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <header className="flex items-start justify-between border-b border-line bg-paper-3 p-6">
              <div>
                <span className="pixel-kicker">FNF account</span>
                <h2 id="auth-title" className="display mt-2 text-[46px] leading-[.8]">
                  {mode === "signup" ? "Enter the circle" : "Welcome back"}
                </h2>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="grid size-10 place-items-center rounded-full border border-line bg-surface">
                <X size={16} weight="bold" />
              </button>
            </header>

            {state === "verify" ? (
              <div className="flex flex-col items-start gap-4 p-6">
                <CheckCircle size={30} weight="fill" className="text-accent" />
                <h3 className="text-[20px] font-bold text-ink">Check your email</h3>
                <p className="text-[14px] leading-relaxed text-ink-2">
                  Open the confirmation link from FNF, then return here to enter your rooms.
                </p>
                <Button className="mt-2" onClick={onClose}>Got it</Button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-5 p-6">
                {errors.form && <p role="alert" className="rounded-[12px] border border-accent px-4 py-3 text-[13px] text-ink">{errors.form}</p>}
                {mode === "signup" && (
                  <Field id="account-name" label="Display name" error={errors.displayName}>
                    <input id="account-name" ref={firstRef} className={inputClass} value={values.displayName} onChange={set("displayName")} autoComplete="name" />
                  </Field>
                )}
                <Field id="account-email" label="Email" error={errors.email}>
                  <input id="account-email" ref={mode === "signin" ? firstRef : undefined} className={inputClass} type="email" value={values.email} onChange={set("email")} autoComplete="email" />
                </Field>
                <Field id="account-password" label="Password" error={errors.password} hint="At least 8 characters.">
                  <input id="account-password" className={inputClass} type="password" value={values.password} onChange={set("password")} autoComplete={mode === "signup" ? "new-password" : "current-password"} />
                </Field>
                <Button type="submit" size="lg" className="mt-1 w-full" disabled={state === "saving"}>
                  {state === "saving" ? <><SpinnerGap size={17} className="animate-spin" />Connecting</> : mode === "signup" ? "Create account" : "Sign in"}
                </Button>
                <button type="button" onClick={switchMode} className="text-[13px] font-semibold text-ink-2 underline underline-offset-4">
                  {mode === "signup" ? "Already have an account? Sign in" : "New to FNF? Create an account"}
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
