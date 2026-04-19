// dashboardApi.ts (web) — API calls สำหรับ Dashboard ฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก dashboardSlice.ts และ DashboardPage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { DashboardSummary, RevenueResponse } from "../../types/dashboard.types"

export const dashboardApi = {
  // GET /api/admin/properties/:propertyId/dashboard — ดึงสรุปสถานะห้องและ booking ปัจจุบัน
  getSummary: async (propertyId: string): Promise<DashboardSummary> => {
    const res = await api.get(ENDPOINTS.dashboard.summary(propertyId))
    return res.data
  },

  // GET /api/admin/properties/:propertyId/revenue?months= — ดึงรายรับย้อนหลัง N เดือน
  getRevenue: async (propertyId: string, months: number = 6): Promise<RevenueResponse> => {
    const res = await api.get(ENDPOINTS.dashboard.revenue(propertyId), {
      params: { months },
    })
    return res.data
  },
}
