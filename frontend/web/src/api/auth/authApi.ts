import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "../../types/auth.types"

export const authApi = {
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post(ENDPOINTS.auth.login, data)
    return res.data
  },

  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const res = await api.post(ENDPOINTS.auth.register, data)
    return res.data
  },

  logout: async (): Promise<void> => {
    await api.post(ENDPOINTS.auth.logout)
  },
}