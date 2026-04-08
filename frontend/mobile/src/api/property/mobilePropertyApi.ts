import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { MobilePropertyCard, PropertySearchParams } from "../../types/mobileProperty.types"

export const mobilePropertyApi = {
  getFeatured: async (): Promise<MobilePropertyCard[]> => {
    const res = await api.get(ENDPOINTS.mobileProperties.featured)
    return res.data
  },

  search: async (params: PropertySearchParams): Promise<MobilePropertyCard[]> => {
    const res = await api.get(ENDPOINTS.mobileProperties.search, { params })
    return res.data
  },
}
