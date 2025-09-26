// Simple client-side auth context: stores a minimal user object in localStorage
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
  sub?: string;
  name?: string;
  email?: string;
};

type AuthContextValue = {
  user: User | null;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchMe = async () => {
    try {
      const res = await fetch(`${process.env.VITE_API_BASE || "http://localhost:3000"}/auth/me`, {
        credentials: "include",
      });
      if (res.status === 200) {
        const json = await res.json();
        setUser(json.user || null);
      } else {
        setUser(null);
      }
    } catch (e) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = () => {
    // Redirect the browser to backend OIDC login endpoint
    window.location.href = `${process.env.VITE_API_BASE || "http://localhost:3000"}/auth/login`;
  };

  const logout = async () => {
    await fetch(`${process.env.VITE_API_BASE || "http://localhost:3000"}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refresh: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthProvider;
