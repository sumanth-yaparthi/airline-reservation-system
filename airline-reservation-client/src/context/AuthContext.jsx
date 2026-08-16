import { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const defaultAuthContext = {
  user: null,
  isAuthenticated: false,
  login: async () => { throw new Error("login() called outside of AuthProvider"); },
  register: async () => { throw new Error("register() called outside of AuthProvider"); },
  logout: () => { throw new Error("logout() called outside of AuthProvider"); },
};

const AuthContext = createContext(defaultAuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const persistSession = (data) => {
    const { token, refreshToken, fullName, email, role } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify({ fullName, email, role }));
    setUser({ fullName, email, role });
  };

  const login = async (email, password) => {
    const response = await axiosInstance.post("/auth/login", { email, password });
    persistSession(response.data);
    return response.data;
  };

  const register = async (fullName, email, password) => {
    const response = await axiosInstance.post("/auth/register", { fullName, email, password });
    persistSession(response.data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
  };

  const value = { user, isAuthenticated: !!user, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}