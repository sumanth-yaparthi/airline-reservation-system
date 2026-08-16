import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="accent">✈</span> SkyBook
        </Link>

        <div className="navbar-links">
          <Link to="/">Flights</Link>
          {isAuthenticated && <Link to="/my-reservations">My Trips</Link>}
          {isAuthenticated && <Link to="/profile">{user.fullName}</Link>}
          {user?.role === "Admin" && <Link to="/admin/flights">Manage Flights</Link>}

          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link to="/login" className="btn btn-primary">
              Log in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}