import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAuth() {
  const { access, loading } = useAuth();
  if (loading) return null; // or a spinner

  console.log("RequireAuth access:", access); // 🧪 debug

  return access ? <Outlet /> : <Navigate to="/login" replace />;
}
