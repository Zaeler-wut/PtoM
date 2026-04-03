export interface LoginPayload {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: "USER" | "ADMIN"
}

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  isLoading: boolean
  error: string | null
}
