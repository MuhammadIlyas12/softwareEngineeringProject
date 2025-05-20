import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [access, setAccess] = useState(null);
  const [refresh, setRefresh] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const a = localStorage.getItem("accessToken");
    const r = localStorage.getItem("refreshToken");
    const u = localStorage.getItem("user");
    if (a) setAccess(a);
    if (r) setRefresh(r);
    if (u && u !== "undefined") {
      try {
        setUser(JSON.parse(u));
      } catch {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = (u, a, r) => {
    setUser(u);
    setAccess(a);
    setRefresh(r);
    localStorage.setItem("user", JSON.stringify(u));
    localStorage.setItem("accessToken", a);
    localStorage.setItem("refreshToken", r);
  };

  const logout = () => {
    setUser(null);
    setAccess(null);
    setRefresh(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider
      value={{ user, access, refresh, loading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
