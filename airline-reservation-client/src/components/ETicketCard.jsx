import { useEffect, useState } from "react";
import QRCode from "qrcode";

// Purely decorative — there's no real gate-assignment feature in this app.
// Deterministic so the same reservation always shows the same gate.
function pseudoGate(reservationId) {
  const letter = String.fromCharCode(65 + (reservationId % 6)); // A–F
  const number = ((reservationId * 7) % 30) + 1;
  return `${letter}${number}`;
}

export default function ETicketCard({ reservation, forwardedRef }) {
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    const verifyUrl = `${window.location.origin}/verify/${reservation.bookingReference}`;
    QRCode.toDataURL(verifyUrl, { width: 160, margin: 1, color: { dark: "#0F1428", light: "#FFFFFF" } })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [reservation.bookingReference]);

  const departureDate = new Date(reservation.departureTime).toLocaleDateString([], {
    day: "2-digit", month: "short", year: "numeric",
  });
  const departureTime = new Date(reservation.departureTime).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="eticket" ref={forwardedRef}>
      <div className="eticket-header">
        <span className="eticket-brand">✈ SkyBook</span>
        <span className="badge badge-success">Booking Confirmed ✓</span>
      </div>

      <div className="eticket-body">
        <div className="eticket-row">
          <div>
            <div className="eticket-label">Booking ID</div>
            <div className="eticket-value text-mono">{reservation.bookingReference}</div>
          </div>
          <div>
            <div className="eticket-label">Passenger</div>
            <div className="eticket-value">{reservation.passengerName}</div>
          </div>
        </div>

        <div className="eticket-row mt-16">
          <div>
            <div className="eticket-label">Flight</div>
            <div className="eticket-value">{reservation.flightNumber}</div>
          </div>
          <div>
            <div className="eticket-label">Route</div>
            <div className="eticket-value">{reservation.origin} → {reservation.destination}</div>
          </div>
        </div>

        <div className="eticket-row mt-16">
          <div>
            <div className="eticket-label">Date</div>
            <div className="eticket-value">{departureDate}</div>
          </div>
          <div>
            <div className="eticket-label">Departure</div>
            <div className="eticket-value">{departureTime}</div>
          </div>
        </div>

        <div className="eticket-row mt-16">
          <div>
            <div className="eticket-label">Seat(s)</div>
            <div className="eticket-value text-mono">{reservation.seatNumbers.join(", ")}</div>
          </div>
          <div>
            <div className="eticket-label">Gate</div>
            <div className="eticket-value">{pseudoGate(reservation.id)}</div>
          </div>
        </div>
      </div>

      <div className="eticket-stub">
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Booking QR code" className="eticket-qr" />
        ) : (
          <div className="eticket-qr-placeholder">QR</div>
        )}
        <span className="text-mono" style={{ fontSize: "0.7rem" }}>{reservation.bookingReference}</span>
      </div>
    </div>
  );
}