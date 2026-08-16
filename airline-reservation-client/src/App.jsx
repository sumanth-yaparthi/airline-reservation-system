import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Flights from "./pages/Flights";
import FlightDetails from "./pages/FlightDetails";
import MyReservations from "./pages/MyReservations";
import AdminFlights from "./pages/AdminFlights";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";
import ETicket from "./pages/ETicket";
import VerifyTicket from "./pages/VerifyTicket";

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Flights />} />
        <Route path="/flights/:id" element={<FlightDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute>
              <MyReservations />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/flights"
          element={
            <AdminRoute>
              <AdminFlights />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/verify/:bookingReference" element={<VerifyTicket />} />
        <Route
          path="/my-reservations/:id/ticket"
          element={
            <ProtectedRoute>
              <ETicket />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
