import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { LoginPayload, LoginResponse, AuthUser } from "../../types/auth.types"

export const authApi = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post(ENDPOINTS.auth.login, data)
    return res.data
  },

  logout: async (): Promise<void> => {
    await api.post(ENDPOINTS.auth.logout)
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get(ENDPOINTS.auth.me)
    return res.data
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    const res = await api.post(ENDPOINTS.auth.refresh, { refreshToken })
    return res.data
  },
}
