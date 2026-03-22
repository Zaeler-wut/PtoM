import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { Property, PropertyListItem } from "../../types/property.types"

export const propertyApi = {
  getList: async (): Promise<PropertyListItem[]> => {
    const { data } = await api.get<PropertyListItem[]>(ENDPOINTS.properties.list)
    return data
  },

  getDetail: async (propertyId: string): Promise<Property> => {
    const { data } = await api.get<Property>(ENDPOINTS.properties.detail(propertyId))
    return data
  },

  update: async (propertyId: string, payload: any): Promise<Property> => {
    const { data } = await api.put<Property>(ENDPOINTS.properties.update(propertyId), payload)
    return data
  },

  addImages: async (propertyId: string, urls: string[]): Promise<void> => {
    await api.post(ENDPOINTS.properties.images(propertyId), { urls })
  },

  deleteImage: async (propertyId: string, imageId: string): Promise<void> => {
    await api.delete(ENDPOINTS.properties.deleteImage(propertyId, imageId))
  },

  setCover: async (propertyId: string, imageId: string): Promise<void> => {
    await api.patch(ENDPOINTS.properties.setCover(propertyId, imageId))
  },
}