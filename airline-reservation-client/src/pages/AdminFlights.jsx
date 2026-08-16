import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

const emptyForm = {
  flightNumber: "",
  origin: "",
  destination: "",
  departureTime: "",
  arrivalTime: "",
  price: "",
  economySeats: "",
  businessSeats: "",
};

export default function AdminFlights() {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadFlights = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/flights");
      setFlights(response.data);
    } catch (err) {
      setError("Could not load flights.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFlights();
  }, [loadFlights]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const economySeats = Number(form.economySeats);
    const businessSeats = Number(form.businessSeats);
    const totalSeats = economySeats + businessSeats;

    setSubmitting(true);
    try {
      await axiosInstance.post("/flights", {
        flightNumber: form.flightNumber,
        origin: form.origin,
        destination: form.destination,
        departureTime: form.departureTime,
        arrivalTime: form.arrivalTime,
        totalSeats,
        price: Number(form.price),
        economySeats,
        businessSeats,
      });
      setForm(emptyForm);
      setShowForm(false);
      loadFlights();
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not create flight.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this flight? This can't be undone.")) return;

    setDeletingId(id);
    try {
      await axiosInstance.delete(`/flights/${id}`);
      setFlights((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete flight.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between">
          <div>
            <h1 className="page-title">Manage flights</h1>
            <p className="page-subtitle">Add new routes or remove existing ones.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm((prev) => !prev)}>
            {showForm ? "Cancel" : "+ Add flight"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 32 }}>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Flight number</label>
                <input name="flightNumber" className="form-input" value={form.flightNumber} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price per seat</label>
                <input name="price" type="number" step="0.01" className="form-input" value={form.price} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Origin</label>
                <input name="origin" className="form-input" value={form.origin} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Destination</label>
                <input name="destination" className="form-input" value={form.destination} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Departure time</label>
                <input name="departureTime" type="datetime-local" className="form-input" value={form.departureTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Arrival time</label>
                <input name="arrivalTime" type="datetime-local" className="form-input" value={form.arrivalTime} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Economy seats</label>
                <input name="economySeats" type="number" min="0" className="form-input" value={form.economySeats} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Business seats</label>
                <input name="businessSeats" type="number" min="0" className="form-input" value={form.businessSeats} onChange={handleChange} required />
              </div>
            </div>

            {formError && <p className="form-error">{formError}</p>}

            <button type="submit" className="btn btn-primary mt-16" disabled={submitting}>
              {submitting ? "Creating..." : "Create flight"}
            </button>
          </form>
        )}

        {loading && <p className="text-muted">Loading flights...</p>}
        {error && <p className="form-error">{error}</p>}

        <div className="grid" style={{ gap: 12 }}>
          {flights.map((flight) => (
            <div key={flight.id} className="card flex-between">
              <div>
                <span className="flight-code">{flight.flightNumber}</span>
                <span className="text-muted" style={{ marginLeft: 16 }}>
                  {flight.origin} → {flight.destination}
                </span>
                <span className="text-muted" style={{ marginLeft: 16 }}>
                  {flight.availableSeatsCount}/{flight.totalSeats} available
                </span>
                <span style={{ marginLeft: 16, fontWeight: 600, color: "var(--color-amber-dark)" }}>
                  ${flight.price.toFixed(2)}
                </span>
              </div>
              <button
                className="btn btn-danger"
                disabled={deletingId === flight.id}
                onClick={() => handleDelete(flight.id)}
              >
                {deletingId === flight.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}