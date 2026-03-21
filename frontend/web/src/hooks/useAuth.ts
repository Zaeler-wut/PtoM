import { useAppSelector, useAppDispatch } from "../store/hooks";
import { logoutThunk } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, accessToken, isLoading, error } = useAppSelector((s) => s.auth);

  const isAuthenticated = !!accessToken;
  const isAdmin = user?.role === "ADMIN";

  const logout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  return { user, isAuthenticated, isAdmin, isLoading, error, logout };
}
