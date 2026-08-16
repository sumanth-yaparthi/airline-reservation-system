import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import FlightCard from "../components/FlightCard";

import { FLIGHTS_PAGE_SIZE } from "../constants";

export default function Flights() {
  const [flights, setFlights] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");

  const fetchFlights = useCallback(async (params = {}, page = 1) => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/flights", {
        params: { ...params, pageNumber: page, pageSize: FLIGHTS_PAGE_SIZE },
      });
      setFlights(response.data.items);
      setTotalPages(response.data.totalPages);
      setPageNumber(response.data.pageNumber);
    } catch (err) {
      setError("Could not load flights. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlights();
  }, [fetchFlights]);

  const currentFilters = () => ({
    origin: origin || undefined,
    destination: destination || undefined,
    date: date || undefined,
  });

  const handleSearch = (e) => {
    e.preventDefault();
    fetchFlights(currentFilters(), 1);
  };

  const handleClear = () => {
    setOrigin("");
    setDestination("");
    setDate("");
    fetchFlights({}, 1);
  };

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchFlights(currentFilters(), page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Find your flight</h1>
        <p className="page-subtitle">Search available routes and book your seat.</p>

        <form onSubmit={handleSearch} className="card" style={{ marginBottom: 32 }}>
          <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr auto auto", gap: 16, alignItems: "end" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">From</label>
              <input className="form-input" placeholder="Origin city" value={origin} onChange={(e) => setOrigin(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">To</label>
              <input className="form-input" placeholder="Destination city" value={destination} onChange={(e) => setDestination(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary">Search</button>
            <button type="button" className="btn btn-outline" onClick={handleClear}>Clear</button>
          </div>
        </form>

        {loading && <p className="text-muted">Loading flights...</p>}
        {error && <p className="form-error">{error}</p>}

        {!loading && !error && flights.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <p>No flights match your search.</p>
          </div>
        )}

        <div className="grid grid-cards">
          {flights.map((flight) => (
            <FlightCard key={flight.id} flight={flight} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="btn btn-outline" disabled={pageNumber === 1} onClick={() => goToPage(pageNumber - 1)}>
              ← Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`pagination-page ${p === pageNumber ? "pagination-page-active" : ""}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}

            <button className="btn btn-outline" disabled={pageNumber === totalPages} onClick={() => goToPage(pageNumber + 1)}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}