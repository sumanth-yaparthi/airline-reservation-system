export default function Seat({ seat, isSelected, onToggle }) {
  const getSeatClass = () => {
    if (!seat.isAvailable) return "seat seat-taken";
    if (isSelected) return "seat seat-selected";
    return "seat seat-available";
  };

  return (
    <button
      type="button"
      className={getSeatClass()}
      disabled={!seat.isAvailable}
      onClick={() => onToggle(seat)}
      title={`${seat.seatNumber} — ${seat.seatClass}${!seat.isAvailable ? " (taken)" : ""}`}
    >
      {seat.seatNumber}
    </button>
  );
}