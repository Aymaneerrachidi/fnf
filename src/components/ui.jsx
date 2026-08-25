import { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";

export const EASE = [0.16, 1, 0.3, 1];

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold " +
  "transition-[transform,background-color,color,border-color,box-shadow] duration-300 ease-out " +
  "active:scale-[.98] disabled:pointer-events-none disabled:opacity-40";

const VARIANTS = {
  primary: "border border-accent bg-accent text-accent-ink hover:-translate-y-0.5 hover:bg-accent-strong",
  pink: "border border-accent bg-accent text-accent-ink hover:-translate-y-0.5 hover:bg-accent-strong",
  volt: "border border-accent bg-accent text-accent-ink hover:-translate-y-0.5 hover:bg-accent-strong",
  paper: "border border-line bg-surface text-text hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2",
  secondary: "border border-line bg-surface/80 text-text hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-2",
  dark: "border border-line bg-surface text-text hover:-translate-y-0.5 hover:border-line-strong",
  ghost: "border border-transparent bg-transparent text-muted hover:bg-surface hover:text-text",
  quiet: "text-muted hover:text-text",
};

const SIZES = {
  sm: "h-10 px-4 text-[13px]",
  md: "h-12 px-5 text-[14px]",
  lg: "h-14 px-7 text-[15px]",
};

export const Button = forwardRef(function Button(
  { as: As = "button", variant = "primary", size = "md", className = "", ...rest },
  ref,
) {
  return (
    <As
      ref={ref}
      className={`${BASE} ${VARIANTS[variant] || VARIANTS.primary} ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
});

export function Chip({ active = false, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`h-10 shrink-0 rounded-full border px-4 text-[13px] font-medium transition-colors duration-200 ${
        active
          ? "border-accent bg-accent text-accent-ink"
          : "border-line bg-surface text-muted hover:border-line-strong hover:text-text"
      } ${className}`}
      {...rest}
    />
  );
}

export function Mark({ name, tone = "ink", size = 44 }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.3 }}
      className={`grid shrink-0 place-items-center rounded-[14px] border font-display font-bold ${
        tone === "volt"
          ? "border-accent/50 bg-accent text-accent-ink"
          : "border-line bg-surface-2 text-text"
      }`}
    >
      {initials}
    </span>
  );
}

export function Img({ slot, className = "", priority = false, sizes }) {
  return (
    <img
      src={slot.src}
      alt={slot.alt}
      width={slot.w}
      height={slot.h}
      sizes={sizes}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export function Reveal({ children, delay = 0, y = 20, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const MotionElement = motion[as] || motion.div;

  return (
    <MotionElement
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </MotionElement>
  );
}

export function Field({ label, hint, error, children, id }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[13px] font-semibold text-text">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] font-medium text-accent" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-12 w-full rounded-[14px] border border-line bg-surface px-4 text-[14px] font-medium text-text " +
  "placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 " +
  "aria-invalid:border-accent";
