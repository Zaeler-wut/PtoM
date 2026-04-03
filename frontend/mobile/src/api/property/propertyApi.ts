import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { Property } from "../../types/property.types"

export const propertyApi = {
  getList: async (): Promise<Property[]> => {
    const res = await api.get(ENDPOINTS.properties.list)
    return res.data
  },

  getDetail: async (propertyId: string): Promise<Property> => {
    const res = await api.get(ENDPOINTS.properties.detail(propertyId))
    return res.data
  },
}
