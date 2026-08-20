import { CREWS } from "../data.js";

/* The one marquee on the page. Reason: open seats are the only thing
   here that changes hour to hour, so it is the only content that earns
   motion before the user has done anything. */
export default function LiveStrip() {
  const open = CREWS.filter((c) => c.seats - c.members > 0);
  const items = [...open, ...open];

  return (
    <section
      aria-label="Crews with a seat open"
      className="relative z-10 overflow-hidden border-y border-line bg-paper-2/80 backdrop-blur-xl"
    >
      <div className="marquee-track flex w-max items-center [&:hover]:[animation-play-state:paused]">
        {items.map((c, i) => (
          <div key={`${c.id}-${i}`} className="flex items-center gap-4 border-r border-line px-8 py-4">
            <span className="display text-[18px] leading-none text-ink">
              {c.name}
            </span>
            <span className="nums bg-volt px-2.5 py-1 text-[11.5px] font-black text-on-volt">
              {c.seats - c.members} open
            </span>
            <span className="utility text-ink-3">{c.hours}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
