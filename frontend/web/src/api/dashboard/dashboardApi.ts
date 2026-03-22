import { axiosInstance } from "../axiosInstance";
import { DASHBOARD_ENDPOINTS } from "../endpoints";
import type { DashboardSummary } from "../../types/dashboard.types";

export const dashboardApi = {
  getSummary: async (propertyId: string): Promise<DashboardSummary> => {
    const { data } = await axiosInstance.get<DashboardSummary>(
      DASHBOARD_ENDPOINTS.SUMMARY(propertyId)
    );
    return data;
  },
};
