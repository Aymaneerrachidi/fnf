import { CREWS } from "../data.js";

export default function LiveStrip() {
  const open = CREWS.filter((crew) => crew.members < crew.seats);
  const items = [...open, ...open];

  return (
    <div className="live-strip" aria-label="Live open rooms">
      <div className="ticker-track flex w-max items-center">
        {items.map((crew, index) => (
          <div className="live-slip" key={`${crew.id}-${index}`}>
            <span className="live-dot" aria-hidden="true" />
            <strong>{crew.name}</strong>
            <span>{crew.trading}</span>
            <b>{crew.seats - crew.members} seat{crew.seats - crew.members === 1 ? "" : "s"}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
