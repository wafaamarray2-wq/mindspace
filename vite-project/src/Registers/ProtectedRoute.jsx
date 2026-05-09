import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // لو مفيش تسجيل دخول → يروح login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}