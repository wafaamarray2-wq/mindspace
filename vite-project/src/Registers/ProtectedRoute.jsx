import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    // امسح أي بيانات ناقصة أو فاسدة
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    return <Navigate to="/login" replace />;
  }

  return children;
}