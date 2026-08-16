import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useToast } from "../context/ToastContext";

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

// Converts an ISO datetime string from the API into the format <input type="datetime-local"> expects
function toLocalInputValue(isoString) {
  const d = new Date(isoString);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminFlights() {
  const { showToast } = useToast();
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = creating, otherwise = editing this flight's ID
  const [form, setForm] = useState(emptyForm);

  const loadFlights = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Admin management view: pull a larger page so nothing's hidden behind pagination here
      const response = await axiosInstance.get("/flights", { params: { pageSize: 100 } });
      setFlights(response.data.items);
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

  const openCreateForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setShowForm(true);
  };

  const openEditForm = (flight) => {
    setEditingId(flight.id);
    setForm({
      flightNumber: flight.flightNumber,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: toLocalInputValue(flight.departureTime),
      arrivalTime: toLocalInputValue(flight.arrivalTime),
      price: flight.price,
      economySeats: "",
      businessSeats: "",
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      if (editingId) {
        await axiosInstance.put(`/flights/${editingId}`, {
          flightNumber: form.flightNumber,
          origin: form.origin,
          destination: form.destination,
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
          price: Number(form.price),
        });
        showToast(`Flight ${form.flightNumber} updated.`, "success", 3500);
      } else {
        const economySeats = Number(form.economySeats);
        const businessSeats = Number(form.businessSeats);
        await axiosInstance.post("/flights", {
          flightNumber: form.flightNumber,
          origin: form.origin,
          destination: form.destination,
          departureTime: form.departureTime,
          arrivalTime: form.arrivalTime,
          totalSeats: economySeats + businessSeats,
          price: Number(form.price),
          economySeats,
          businessSeats,
        });
        showToast(`Flight ${form.flightNumber} created.`, "success", 3500);
      }
      closeForm();
      loadFlights();
    } catch (err) {
      // Keep this one inline (formError) since it's tied to a specific form the user is actively filling out
      setFormError(err.response?.data?.message || "Could not save flight.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (flight) => {
    if (!window.confirm(`Delete flight ${flight.flightNumber}? This can't be undone.`)) return;

    setDeletingId(flight.id);
    try {
      await axiosInstance.delete(`/flights/${flight.id}`);
      setFlights((prev) => prev.filter((f) => f.id !== flight.id));
      showToast(`Flight ${flight.flightNumber} deleted.`, "success", 3500);
    } catch (err) {
      showToast(err.response?.data?.message || `Could not delete flight ${flight.flightNumber}.`, "error", 7000);
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
            <p className="page-subtitle">Add, edit, or remove routes.</p>
          </div>
          <button className="btn btn-primary" onClick={showForm ? closeForm : openCreateForm}>
            {showForm ? "Cancel" : "+ Add flight"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 32 }}>
            <h3 style={{ marginBottom: 16 }}>{editingId ? "Edit flight" : "New flight"}</h3>

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

              {!editingId && (
                <>
                  <div className="form-group">
                    <label className="form-label">Economy seats</label>
                    <input name="economySeats" type="number" min="0" className="form-input" value={form.economySeats} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Business seats</label>
                    <input name="businessSeats" type="number" min="0" className="form-input" value={form.businessSeats} onChange={handleChange} required />
                  </div>
                </>
              )}
            </div>

            {editingId && (
              <p className="text-muted" style={{ fontSize: "0.85rem" }}>
                Seat count and class layout can't be changed after a flight is created.
              </p>
            )}

            {formError && <p className="form-error">{formError}</p>}

            <button type="submit" className="btn btn-primary mt-16" disabled={submitting}>
              {submitting ? "Saving..." : editingId ? "Save changes" : "Create flight"}
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
              <div className="flex gap-8">
                <button className="btn btn-outline" onClick={() => openEditForm(flight)}>
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  disabled={deletingId === flight.id}
                  onClick={() => handleDelete(flight)}
                >
                  {deletingId === flight.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}