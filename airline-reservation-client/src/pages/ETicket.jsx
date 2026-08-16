import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axiosInstance from "../api/axiosInstance";
import ETicketCard from "../components/ETicketCard";
import { useToast } from "../context/ToastContext";

export default function ETicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const ticketRef = useRef(null);

  useEffect(() => {
    axiosInstance.get(`/reservations/${id}`)
      .then((res) => setReservation(res.data))
      .catch(() => showToast("Could not load this ticket.", "error", 7000))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, { scale: 2, backgroundColor: "#ffffff" });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${reservation.bookingReference}-eticket.pdf`);
    } catch (err) {
      showToast("Could not generate PDF.", "error", 7000);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="page"><div className="container"><p className="text-muted">Loading ticket...</p></div></div>;
  if (!reservation) return null;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 520 }}>
        <button className="btn btn-outline" onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>
          ← Back
        </button>

        <ETicketCard reservation={reservation} forwardedRef={ticketRef} />

        <button className="btn btn-primary btn-block mt-24" onClick={handleDownload} disabled={downloading}>
          {downloading ? "Generating PDF..." : "Download PDF ticket"}
        </button>
      </div>
    </div>
  );
}