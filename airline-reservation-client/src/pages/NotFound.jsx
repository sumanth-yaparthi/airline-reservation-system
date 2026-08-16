import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="page">
      <div className="container" style={{ textAlign: "center", paddingTop: 60 }}>
        <h1 className="page-title">✈ Flight not found</h1>
        <p className="page-subtitle">This route doesn't exist. Let's get you back on course.</p>
        <Link to="/" className="btn btn-primary">Back to flight search</Link>
      </div>
    </div>
  );
}