import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type {
  Property,
  RoomType,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  CreateRoomTypePayload,
  UpdateRoomTypePayload,
} from "../../types/property.types"

export const propertyApi = {
  // ── Property ──────────────────────────────────────────────────────────────

  getList: async (): Promise<Property[]> => {
    const { data } = await api.get<Property[]>(ENDPOINTS.properties.list)
    return data
  },

  create: async (payload: CreatePropertyPayload): Promise<Property> => {
    const { data } = await api.post<Property>(ENDPOINTS.properties.create, payload)
    return data
  },

  getDetail: async (propertyId: string): Promise<Property> => {
    const { data } = await api.get<Property>(ENDPOINTS.properties.detail(propertyId))
    return data
  },

  update: async (propertyId: string, payload: UpdatePropertyPayload): Promise<Property> => {
    const { data } = await api.put<Property>(ENDPOINTS.properties.update(propertyId), payload)
    return data
  },

  // ── Property Images ───────────────────────────────────────────────────────

  addImages: async (propertyId: string, urls: string[]): Promise<void> => {
    await api.post(ENDPOINTS.properties.images(propertyId), { urls })
  },

  deleteImage: async (propertyId: string, imageId: string): Promise<void> => {
    await api.delete(ENDPOINTS.properties.deleteImage(propertyId, imageId))
  },

  setCover: async (propertyId: string, imageId: string): Promise<void> => {
    await api.patch(ENDPOINTS.properties.setCover(propertyId, imageId))
  },

  // ── Room Types ────────────────────────────────────────────────────────────

  createRoomType: async (propertyId: string, payload: CreateRoomTypePayload): Promise<RoomType> => {
    const { data } = await api.post<RoomType>(ENDPOINTS.properties.roomTypes(propertyId), payload)
    return data
  },

  getRoomTypeDetail: async (propertyId: string, roomTypeId: string): Promise<RoomType> => {
    const { data } = await api.get<RoomType>(ENDPOINTS.properties.roomType(propertyId, roomTypeId))
    return data
  },

  updateRoomType: async (propertyId: string, roomTypeId: string, payload: UpdateRoomTypePayload): Promise<RoomType> => {
    const { data } = await api.put<RoomType>(ENDPOINTS.properties.roomType(propertyId, roomTypeId), payload)
    return data
  },

  addRoomTypeImages: async (propertyId: string, roomTypeId: string, urls: string[]): Promise<void> => {
    await api.post(ENDPOINTS.properties.roomTypeImages(propertyId, roomTypeId), { urls })
  },

  deleteRoomTypeImage: async (propertyId: string, roomTypeId: string, imageId: string): Promise<void> => {
    await api.delete(`/admin/properties/${propertyId}/room-types/${roomTypeId}/images/${imageId}`)
  },
}