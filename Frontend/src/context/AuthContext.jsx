import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/apiClient";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("chumpatin_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem("chumpatin_token");
      const savedUser = localStorage.getItem("chumpatin_user");

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } catch (e) {
          localStorage.removeItem("chumpatin_token");
          localStorage.removeItem("chumpatin_user");
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (name, email, password) => {
    try {
      const res = await api.register({ name, email, password });
      if (res.success) {
        localStorage.setItem("chumpatin_token", res.token);
        localStorage.setItem("chumpatin_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        toast.success(`¡Cuenta creada con éxito! Bienvenido, ${res.user.name}`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message || "Error al crear cuenta");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.login({ email, password });
      if (res.success) {
        localStorage.setItem("chumpatin_token", res.token);
        localStorage.setItem("chumpatin_user", JSON.stringify(res.user));
        setToken(res.token);
        setUser(res.user);
        toast.success(`¡Bienvenido, ${res.user.name}!`);
        return true;
      }
      return false;
    } catch (error) {
      toast.error(error.message || "Error al iniciar sesión");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("chumpatin_token");
    localStorage.removeItem("chumpatin_user");
    setToken(null);
    setUser(null);
    toast.success("Sesión cerrada");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
