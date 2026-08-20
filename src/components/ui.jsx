import { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1];

/* Radius rule for the whole product: surfaces 3px, anything you can
   click and that reads as a control is a full pill. */

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold " +
  "transition-[transform,background-color,color,border-color,box-shadow] duration-250 ease-out " +
  "active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none";

const VARIANTS = {
  // Light chip on the void. 16:1.
  primary: "bg-ink text-paper hover:-translate-y-px",
  volt: "bg-volt text-on-volt hover:-translate-y-px hover:brightness-105",
  ghost:
    "border border-line bg-paper-2 text-ink hover:border-volt/50 hover:text-volt hover:-translate-y-px",
  quiet: "text-ink-2 hover:text-ink",
};

const SIZES = {
  sm: "h-9 px-4 text-[13px]",
  md: "h-11 px-5 text-[14px]",
  lg: "h-[52px] px-7 text-[15px]",
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
        "h-8 shrink-0 rounded-full border px-3 text-[12px] font-semibold transition-colors duration-150 " +
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
        "grid shrink-0 place-items-center rounded-full font-mono font-black " +
        (tone === "volt" ? "bg-volt text-on-volt" : "bg-paper-3 text-ink border border-line")
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

export function AmbientVideo({ src, poster, className = "", priority = false }) {
  return (
    <video
      className={`h-full w-full object-cover ${className}`}
      poster={poster?.src}
      preload={priority ? "auto" : "metadata"}
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
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
  "h-11 w-full rounded-[16px] border border-ink/15 bg-paper-2 px-4 text-[13.5px] font-semibold text-ink shadow-[inset_0_1px_0_rgb(255_255_255/.5)] " +
  "placeholder:text-ink-3 transition-colors focus:border-volt focus:bg-paper-3 focus:outline-none " +
  "aria-invalid:border-danger";

export { EASE };
