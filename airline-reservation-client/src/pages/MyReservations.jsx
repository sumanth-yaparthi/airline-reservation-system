import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";
import { Link } from "react-router-dom";

function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function hasDeparted(departureTimeStr) {
  return new Date(departureTimeStr) <= new Date();
}

function hasRealTicket(bookingReference) {
  return bookingReference && !bookingReference.startsWith("LEGACY");
}

export default function MyReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const { showToast } = useToast();

  const loadReservations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/reservations/my");
      setReservations(response.data);
    } catch (err) {
      setError("Could not load your reservations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const handleCancel = async (reservation) => {
    if (!window.confirm("Cancel this reservation? This can't be undone."))
      return;

    setCancellingId(reservation.id);
    try {
      await axiosInstance.delete(`/reservations/${reservation.id}`);
      setReservations((prev) =>
        prev.map((r) =>
          r.id === reservation.id ? { ...r, status: "Cancelled" } : r,
        ),
      );
      showToast(
        `Reservation for ${reservation.flightNumber} cancelled.`,
        "success",
        3500,
      );
    } catch (err) {
      showToast(
        err.response?.data?.message || "Could not cancel reservation.",
        "error",
        7000,
      );
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">My trips</h1>
        <p className="page-subtitle">Everything you've booked, in one place.</p>

        {loading && <p className="text-muted">Loading your reservations...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && reservations.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <p>You haven't booked any flights yet.</p>
          </div>
        )}

        <div className="grid" style={{ gap: 16 }}>
          {reservations.map((r) => (
            <div key={r.id} className="card">
              <div className="flex-between">
                <div>
                  <span className="flight-code">{r.flightNumber}</span>
                  <h3 style={{ marginTop: 6 }}>
                    {r.origin} → {r.destination}
                  </h3>
                </div>
                <span
                  className={`badge ${r.status === "Cancelled" ? "badge-cancelled" : "badge-success"}`}
                >
                  {r.status}
                </span>
              </div>

              <div className="reservation-meta">
                <span className="reservation-meta-item">
                  Departs <strong>{formatDateTime(r.departureTime)}</strong>
                </span>
                <span className="reservation-meta-item">
                  Booked on <strong>{formatDateTime(r.bookingDate)}</strong>
                </span>
                <span className="reservation-meta-item">
                  Total <strong>${r.totalPrice.toFixed(2)}</strong>
                </span>
              </div>

              <div className="mt-16">
                {r.seatNumbers.map((seatNum) => (
                  <span key={seatNum} className="seat-chip">
                    {seatNum}
                  </span>
                ))}
              </div>

              <div className="flex gap-8 mt-24">
                {r.status !== "Cancelled" &&
                  hasRealTicket(r.bookingReference) && (
                    <Link
                      to={`/my-reservations/${r.id}/ticket`}
                      className="btn btn-outline"
                    >
                      View E-Ticket
                    </Link>
                  )}

                {r.status !== "Cancelled" && !hasDeparted(r.departureTime) && (
                  <button
                    className="btn btn-danger"
                    disabled={cancellingId === r.id}
                    onClick={() => handleCancel(r)}
                  >
                    {cancellingId === r.id
                      ? "Cancelling..."
                      : "Cancel reservation"}
                  </button>
                )}

                {r.status !== "Cancelled" && hasDeparted(r.departureTime) && (
                  <span
                    className="badge badge-departed"
                    style={{ display: "inline-flex" }}
                  >
                    Flight completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
