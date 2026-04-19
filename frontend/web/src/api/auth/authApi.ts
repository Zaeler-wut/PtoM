// authApi.ts (web) — API calls สำหรับ Authentication
// เรียกใช้ axiosInstance และ ENDPOINTS สำหรับ login/register/logout
// ถูกเรียกใช้จาก authSlice.ts

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { LoginPayload, LoginResponse, RegisterPayload, RegisterResponse } from "../../types/auth.types"

export const authApi = {
  // POST /api/auth/login — ส่ง credentials รับ accessToken กลับ
  login: async (data: LoginPayload): Promise<LoginResponse> => {
    const res = await api.post(ENDPOINTS.auth.login, data)
    return res.data
  },

  // POST /api/auth/register — สร้าง user ใหม่ (TENANT)
  register: async (data: RegisterPayload): Promise<RegisterResponse> => {
    const res = await api.post(ENDPOINTS.auth.register, data)
    return res.data
  },

  // POST /api/auth/logout — clear refresh token cookie บน server
  logout: async (): Promise<void> => {
    await api.post(ENDPOINTS.auth.logout)
  },
}
