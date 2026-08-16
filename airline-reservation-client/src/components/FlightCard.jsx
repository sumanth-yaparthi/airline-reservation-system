import { useNavigate } from "react-router-dom";

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

function isNextDay(departureStr, arrivalStr) {
  const dep = new Date(departureStr);
  const arr = new Date(arrivalStr);
  return dep.toDateString() !== arr.toDateString();
}

export default function FlightCard({ flight }) {
  const navigate = useNavigate();
  const isFull = flight.availableSeatsCount === 0;
  const overnight = isNextDay(flight.departureTime, flight.arrivalTime);

  return (
    <div className="boarding-pass" onClick={() => navigate(`/flights/${flight.id}`)} style={{ cursor: "pointer" }}>
      <div className="boarding-pass-main">
        <div className="flight-card-header">
          <span className="flight-code">{flight.flightNumber}</span>
          {isFull ? (
            <span className="badge badge-cancelled">Fully booked</span>
          ) : (
            <span className="badge badge-success">{flight.availableSeatsCount} seats left</span>
          )}
        </div>

        <div className="flight-route-row">
          <div className="flight-route-point">
            <span className="flight-route-time-value">{formatTime(flight.departureTime)}</span>
            <div className="text-muted flight-route-city">{flight.origin}</div>
            <div className="text-muted flight-route-date">{formatDate(flight.departureTime)}</div>
          </div>

          <div className="flight-route-plane">✈</div>

          <div className="flight-route-point flight-route-point-end">
            <span className="flight-route-time-value">
              {formatTime(flight.arrivalTime)}
              {overnight && <span className="badge badge-amber flight-plusday">+1</span>}
            </span>
            <div className="text-muted flight-route-city">{flight.destination}</div>
            <div className="text-muted flight-route-date">{formatDate(flight.arrivalTime)}</div>
          </div>
        </div>

        <div className="mt-24 flex-between">
          <span className="text-muted" style={{ fontSize: "0.85rem" }}>Starting from</span>
          <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--color-amber-dark)" }}>
            ${flight.price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="boarding-pass-stub">
        <span className="text-mono" style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
          {flight.origin.slice(0, 3).toUpperCase()}→{flight.destination.slice(0, 3).toUpperCase()}
        </span>
        <div className="stub-barcode">
          {Array.from({ length: 12 }).map((_, i) => <span key={i}></span>)}
        </div>
      </div>
    </div>
  );
}