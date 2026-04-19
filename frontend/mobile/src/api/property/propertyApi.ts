import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { Property } from "../../types/property.types"

export interface CreatePropertyInput {
  name: string
  address: string
  priceMin: number
  priceMax: number
  bankName: string
  bankAccount: string
  bankHolder: string
  googleMap?: string
  description?: string
}

export const propertyApi = {
  getList: async (): Promise<Property[]> => {
    const res = await api.get(ENDPOINTS.properties.list)
    return res.data
  },

  getDetail: async (propertyId: string): Promise<Property> => {
    const res = await api.get(ENDPOINTS.properties.detail(propertyId))
    return res.data
  },

  create: async (data: CreatePropertyInput): Promise<Property> => {
    const res = await api.post(ENDPOINTS.properties.create, data)
    return res.data
  },
}
