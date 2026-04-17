import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { MobilePropertyCard, MobilePropertyDetail, PropertySearchParams } from "../../types/mobileProperty.types"

export const mobilePropertyApi = {
  getFeatured: async (): Promise<MobilePropertyCard[]> => {
    const res = await api.get(ENDPOINTS.mobileProperties.featured)
    return res.data
  },
  search: async (params: PropertySearchParams): Promise<MobilePropertyCard[]> => {
    const res = await api.get(ENDPOINTS.mobileProperties.search, { params })
    return res.data
  },
  getDetail: async (id: string, maxOccupants?: number): Promise<MobilePropertyDetail> => {
    const res = await api.get(ENDPOINTS.mobileProperties.detail(id), {
      params: maxOccupants ? { maxOccupants } : undefined,
    })
    return res.data
  },
}