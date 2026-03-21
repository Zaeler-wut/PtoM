import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function ProtectedRoute() {
  const { accessToken } = useAppSelector((s) => s.auth);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
