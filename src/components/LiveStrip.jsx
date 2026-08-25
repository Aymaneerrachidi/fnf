const ROOMS = [
  ["Night Shift", "Memecoins", "1 seat"],
  ["Frogwater", "Memecoins", "2 seats"],
  ["Paper Route", "Day trading", "4 seats"],
  ["Nine Lives", "Memecoins", "2 seats"],
  ["Kervan", "Perps", "1 seat"],
  ["The Bakery", "Memecoins", "1 seat"],
];

function Track({ hidden = false }) {
  return (
    <div className="room-ticker__track" aria-hidden={hidden || undefined}>
      {ROOMS.map(([name, trading, seats]) => (
        <a key={`${name}-${hidden}`} href="#find" className="room-ticker__item">
          <strong>{name}</strong>
          <span>{trading}</span>
          <span>{seats}</span>
        </a>
      ))}
    </div>
  );
}

export default function LiveStrip() {
  return (
    <section className="room-ticker" aria-label="Open crews">
      <div className="room-ticker__label">Open rooms</div>
      <div className="room-ticker__window">
        <Track />
        <Track hidden />
      </div>
    </section>
  );
}
