import { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] font-semibold uppercase " +
  "transition-[transform,background-color,color,border-color,box-shadow] duration-250 ease-out " +
  "active:translate-y-px disabled:opacity-40 disabled:pointer-events-none";

const VARIANTS = {
  primary: "border border-ink bg-ink text-paper-2 hover:-translate-y-px hover:bg-pink hover:text-ink",
  pink: "border border-ink bg-pink text-ink shadow-[4px_4px_0_var(--blue)] hover:-translate-y-px hover:shadow-[2px_2px_0_var(--blue)]",
  paper: "border border-ink bg-paper-2 text-ink hover:-translate-y-px hover:bg-blue hover:text-paper-2",
  dark: "border border-paper-2/45 bg-ink text-paper-2 hover:-translate-y-px hover:bg-blue",
  volt: "border border-ink bg-pink text-ink hover:-translate-y-px hover:bg-ink hover:text-paper-2",
  ghost:
    "border border-ink/35 bg-paper-2 text-ink hover:border-volt hover:bg-volt hover:text-on-volt hover:-translate-y-px",
  quiet: "text-ink-2 hover:text-ink",
};

const SIZES = {
  sm: "h-9 px-4 font-nav text-[10px] tracking-[-0.03em]",
  md: "h-11 px-5 font-nav text-[11px] tracking-[-0.03em]",
  lg: "h-[52px] px-7 font-nav text-[12px] tracking-[-0.03em]",
};

export const Button = forwardRef(function Button(
  { as: As = "button", variant = "primary", size = "md", className = "", ...rest },
  ref,
) {
  return (
    <As
      ref={ref}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    />
  );
});

export function Chip({ active = false, className = "", ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={
        "h-9 shrink-0 rounded-[2px] border px-3 font-nav text-[10px] uppercase tracking-[-0.04em] transition-colors duration-150 " +
        (active
          ? "border-volt bg-volt text-on-volt"
          : "border-line text-ink-2 hover:border-ink/40 hover:text-ink") +
        " " +
        className
      }
      {...rest}
    />
  );
}

/* Small block mark standing in for a crew avatar. Two initials, one of
   two fills, so a list of crews reads as distinct objects. */
export function Mark({ name, tone = "ink", size = 44 }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      className={
        "grid shrink-0 place-items-center rounded-[2px] border font-nav font-black " +
        (tone === "volt" ? "border-ink bg-ink text-paper-2" : "border-line bg-paper-3 text-ink")
      }
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
      decoding={priority ? "sync" : "async"}
      className={`h-full w-full object-cover ${className}`}
    />
  );
}

export function AmbientVideo({ src, poster, alt = "", className = "", priority = false }) {
  const reduce = useReducedMotion();
  const posterSrc = typeof poster === "string" ? poster : poster?.src;

  if (reduce) {
    return (
      <img
        src={posterSrc}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        className={`h-full w-full object-cover ${className}`}
      />
    );
  }

  return (
    <video
      className={`h-full w-full object-cover ${className}`}
      poster={posterSrc}
      preload={priority ? "auto" : "metadata"}
      autoPlay
      muted
      loop
      playsInline
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : "true"}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

/* Scroll reveal. One reason: content arrives in reading order rather
   than all at once, so the eye lands on the headline first. */
export function Reveal({ children, delay = 0, y = 16, className = "", as = "div" }) {
  const reduce = useReducedMotion();
  const M = motion[as] || motion.div;
  return (
    <M
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </M>
  );
}

export function Field({ label, hint, error, children, id }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="utility text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-[12.5px] font-medium text-danger" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[12.5px] text-ink-2">{hint}</p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "h-12 w-full rounded-none border border-ink/25 bg-paper-2 px-4 font-sans text-[13px] font-semibold text-ink " +
  "placeholder:text-ink-3 transition-colors focus:border-blue focus:bg-paper-2 focus:outline-none " +
  "aria-invalid:border-danger";

export { EASE };
