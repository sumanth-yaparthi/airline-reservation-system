import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import Seat from "../components/Seat";

export default function FlightDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [flight, setFlight] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [flightRes, seatsRes] = await Promise.all([
        axiosInstance.get(`/flights/${id}`),
        axiosInstance.get(`/flights/${id}/seats`),
      ]);
      setFlight(flightRes.data);
      setSeats(seatsRes.data);
    } catch (err) {
      setError("Could not load flight details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSeat = (seat) => {
    setSelectedSeats((prev) =>
      prev.some((s) => s.id === seat.id)
        ? prev.filter((s) => s.id !== seat.id)
        : [...prev, seat]
    );
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    setBooking(true);
    setError("");
    try {
      await axiosInstance.post("/reservations", {
        flightId: Number(id),
        seatIds: selectedSeats.map((s) => s.id),
      });
      navigate("/my-reservations");
    } catch (err) {
      setError(err.response?.data?.message || "Could not complete booking.");
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <div className="page"><div className="container"><p className="text-muted">Loading...</p></div></div>;
  if (error && !flight) return <div className="page"><div className="container"><p className="form-error">{error}</p></div></div>;
  if (!flight) return null;

  const businessSeats = seats.filter((s) => s.seatClass === "Business");
  const economySeats = seats.filter((s) => s.seatClass === "Economy");
  const totalPrice = flight.price * selectedSeats.length;

  return (
    <div className="page">
      <div className="container">
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          ← Back
        </button>

        <div className="grid" style={{ gridTemplateColumns: "1fr 340px", gap: 32, alignItems: "start" }}>
          <div className="card">
            <div className="flex-between">
              <div>
                <span className="flight-code" style={{ fontSize: "1.1rem" }}>{flight.flightNumber}</span>
                <h2 style={{ marginTop: 8 }}>{flight.origin} → {flight.destination}</h2>
                <div className="flex gap-16 mt-16" style={{ flexWrap: "wrap" }}>
                  <span className="reservation-meta-item">
                    Departs <strong>{new Date(flight.departureTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                  </span>
                  <span className="reservation-meta-item">
                    Arrives <strong>{new Date(flight.arrivalTime).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</strong>
                  </span>
                </div>
              </div>
              <span style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--color-amber-dark)" }}>
                ${flight.price.toFixed(2)} <span className="text-muted" style={{ fontSize: "0.8rem", fontWeight: 400 }}>/ seat</span>
              </span>
            </div>

            <hr style={{ margin: "24px 0", border: "none", borderTop: "1px solid var(--color-border)" }} />

            <h3>Select your seats</h3>

            {businessSeats.length > 0 && (
              <>
                <p className="text-muted mt-16" style={{ fontSize: "0.85rem", fontWeight: 600 }}>BUSINESS</p>
                <div className="seat-map">
                  {businessSeats.map((seat) => (
                    <Seat
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.some((s) => s.id === seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                </div>
              </>
            )}

            {economySeats.length > 0 && (
              <>
                <p className="text-muted mt-16" style={{ fontSize: "0.85rem", fontWeight: 600 }}>ECONOMY</p>
                <div className="seat-map">
                  {economySeats.map((seat) => (
                    <Seat
                      key={seat.id}
                      seat={seat}
                      isSelected={selectedSeats.some((s) => s.id === seat.id)}
                      onToggle={toggleSeat}
                    />
                  ))}
                </div>
              </>
            )}

            <div className="seat-legend">
              <div className="seat-legend-item">
                <span className="seat-legend-swatch" style={{ background: "var(--color-paper-alt)" }}></span> Available
              </div>
              <div className="seat-legend-item">
                <span className="seat-legend-swatch" style={{ background: "var(--color-amber)", borderColor: "var(--color-amber)" }}></span> Selected
              </div>
              <div className="seat-legend-item">
                <span className="seat-legend-swatch" style={{ background: "var(--color-border)" }}></span> Taken
              </div>
            </div>
          </div>

          <div className="card" style={{ position: "sticky", top: 88 }}>
            <h3>Booking summary</h3>

            {selectedSeats.length === 0 ? (
              <p className="text-muted mt-16">Select at least one seat to continue.</p>
            ) : (
              <div className="mt-16">
                {selectedSeats.map((s) => (
                  <div key={s.id} className="flex-between" style={{ marginBottom: 8 }}>
                    <span className="text-mono">{s.seatNumber}</span>
                    <span className="text-muted">{s.seatClass}</span>
                  </div>
                ))}
              </div>
            )}

            <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid var(--color-border)" }} />

            <div className="flex-between">
              <span style={{ fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--color-amber-dark)" }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button
              className="btn btn-primary btn-block mt-24"
              disabled={selectedSeats.length === 0 || booking}
              onClick={handleBook}
            >
              {booking ? "Booking..." : isAuthenticated ? "Confirm booking" : "Log in to book"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}