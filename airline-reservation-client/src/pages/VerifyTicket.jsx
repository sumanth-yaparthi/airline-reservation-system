import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export default function VerifyTicket() {
  const { bookingReference } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance.get(`/reservations/verify/${bookingReference}`)
      .then((res) => setReservation(res.data))
      .catch(() => setError("No booking found with this reference."))
      .finally(() => setLoading(false));
  }, [bookingReference]);

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480, textAlign: "center" }}>
        <h1 className="page-title">Booking Verification</h1>

        {loading && <p className="text-muted">Checking booking...</p>}

        {error && (
          <div className="card mt-24">
            <p className="form-error">{error}</p>
          </div>
        )}

        {reservation && (
          <div className="card mt-24" style={{ textAlign: "left" }}>
            <div className="flex-between">
              <span className={`badge ${reservation.status === "Cancelled" ? "badge-cancelled" : "badge-success"}`}>
                {reservation.status === "Cancelled" ? "Cancelled" : "Valid booking ✓"}
              </span>
              <span className="text-mono">{reservation.bookingReference}</span>
            </div>

            <div className="mt-16">
              <p><strong>{reservation.passengerName}</strong></p>
              <p className="text-muted">{reservation.flightNumber} — {reservation.origin} → {reservation.destination}</p>
              <p className="text-muted">
                {new Date(reservation.departureTime).toLocaleString([], {
                  month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                })}
              </p>
              <p className="mt-16">Seat(s): <span className="text-mono">{reservation.seatNumbers.join(", ")}</span></p>
            </div>
          </div>
        )}

        <Link to="/" className="btn btn-outline mt-24">Back to SkyBook</Link>
      </div>
    </div>
  );
}