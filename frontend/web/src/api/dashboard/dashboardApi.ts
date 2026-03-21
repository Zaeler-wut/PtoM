import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { DashboardSummary, RevenueResponse } from "../../types/dashboard.types"

export const dashboardApi = {
  getSummary: async (propertyId: string): Promise<DashboardSummary> => {
    const res = await api.get(ENDPOINTS.dashboard.summary(propertyId))
    return res.data
  },

  getRevenue: async (propertyId: string, months: number = 6): Promise<RevenueResponse> => {
    const res = await api.get(ENDPOINTS.dashboard.revenue(propertyId), {
      params: { months },
    })
    return res.data
  },
}