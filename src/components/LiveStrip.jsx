function Track({ rooms, hidden = false }) {
  return (
    <div className="room-ticker__track" aria-hidden={hidden || undefined}>
      {rooms.map((room) => (
        <a key={`${room.id}-${hidden}`} href="#find" className="room-ticker__item">
          <strong>{room.name}</strong>
          <span>{room.trading}</span>
          <span>{Math.max(0, room.seats - room.members)} open</span>
        </a>
      ))}
    </div>
  );
}

export default function LiveStrip({ crews = [] }) {
  const rooms = crews.length ? crews : [{ id: "fresh", name: "The board is fresh", trading: "Open the first real room", seats: 8, members: 0 }];
  return (
    <section className="room-ticker" aria-label="Open crews">
      <div className="room-ticker__label">Open rooms</div>
      <div className="room-ticker__window">
        <Track rooms={rooms} />
        <Track rooms={rooms} hidden />
      </div>
    </section>
  );
}
