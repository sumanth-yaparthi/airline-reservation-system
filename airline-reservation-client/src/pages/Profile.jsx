import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";

export default function Profile() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ fullName: "", email: "" });
  const [profileError, setProfileError] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/users/me");
      setProfile(response.data);
      setProfileForm({ fullName: response.data.fullName, email: response.data.email });
    } catch (err) {
      showToast("Could not load your profile.", "error", 7000);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleProfileChange = (e) => {
    setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setSavingProfile(true);

    try {
      const response = await axiosInstance.put("/users/me", profileForm);
      setProfile(response.data);

      // Keep the navbar / AuthContext user object in sync (name shown in nav, etc.)
      const storedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user", JSON.stringify({ ...storedUser, fullName: response.data.fullName, email: response.data.email }));

      showToast("Profile updated.", "success", 3500);
    } catch (err) {
      setProfileError(err.response?.data?.message || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    setSavingPassword(true);
    try {
      await axiosInstance.put("/users/me/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      showToast("Password changed. Please log in again.", "success", 4000);
      setTimeout(() => logout(), 1200); // give the toast a moment to be seen before redirect
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="page"><div className="container"><p className="text-muted">Loading profile...</p></div></div>;
  if (!profile) return null;

  return (
    <div className="page">
      <div className="container">
        <h1 className="page-title">Your account</h1>
        <p className="page-subtitle">Manage your details and password.</p>

        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "start" }}>
          <div className="card">
            <div className="flex-between">
              <h3>Profile details</h3>
              <span className="badge badge-amber">{profile.role}</span>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-24">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  name="fullName"
                  className="form-input"
                  value={profileForm.fullName}
                  onChange={handleProfileChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  type="email"
                  className="form-input"
                  value={profileForm.email}
                  onChange={handleProfileChange}
                  required
                />
              </div>

              <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                Member since {new Date(profile.createdAt).toLocaleDateString([], { month: "long", year: "numeric" })}
              </p>

              {profileError && <p className="form-error">{profileError}</p>}

              <button type="submit" className="btn btn-primary mt-16" disabled={savingProfile}>
                {savingProfile ? "Saving..." : "Save changes"}
              </button>
            </form>
          </div>

          <div className="card">
            <h3>Change password</h3>

            <form onSubmit={handlePasswordSubmit} className="mt-24">
              <div className="form-group">
                <label className="form-label">Current password</label>
                <PasswordInput
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  autoComplete="current-password"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">New password</label>
                <PasswordInput
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm new password</label>
                <PasswordInput
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </div>

              {passwordError && <p className="form-error">{passwordError}</p>}

              <button type="submit" className="btn btn-secondary mt-16" disabled={savingPassword}>
                {savingPassword ? "Changing..." : "Change password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}