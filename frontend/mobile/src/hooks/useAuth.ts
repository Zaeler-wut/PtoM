import { useAppDispatch, useAppSelector } from "../store/hooks"
import { loginThunk, logoutThunk, restoreAuthThunk, clearError } from "../store/slices/authSlice"
import type { LoginPayload } from "../types/auth.types"

export function useAuth() {
  const dispatch = useAppDispatch()
  const { user, isLoading, error } = useAppSelector((s) => s.auth)

  const login = (data: LoginPayload) => dispatch(loginThunk(data))
  const logout = () => dispatch(logoutThunk())
  const restore = () => dispatch(restoreAuthThunk())
  const clear = () => dispatch(clearError())

  return { user, isLoading, error, login, logout, restore, clear, isLoggedIn: !!user }
}
