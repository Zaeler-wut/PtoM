import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"

export interface RoomTypeImage {
  id: string
  url: string
}

export interface RoomTypeFee {
  id?: string
  name: string
  price: number
}

export interface RoomType {
  id: string
  name: string
  description: string | null
  size: number | null
  maxOccupants: number | null
  roomPrice: number
  furniturePrice: number | null
  waterRate: number
  electricRate: number
  bookingFee: number
  advanceRent: number
  securityDeposit: number
  allowOnlineBooking: boolean
  roomCount: number
  fees: RoomTypeFee[]
  facilities: string[]
  images: RoomTypeImage[]
}

export interface RoomTypePayload {
  name: string
  description?: string
  size?: number
  maxOccupants?: number
  roomPrice?: number
  furniturePrice?: number
  waterRate?: number
  electricRate?: number
  bookingFee?: number
  advanceRent?: number
  securityDeposit?: number
  allowOnlineBooking?: boolean
  fees?: RoomTypeFee[]
  facilities?: string[]
  images?: string[]
}

export const getRoomTypes = (propertyId: string) =>
  api.get<RoomType[]>(ENDPOINTS.properties.roomTypes(propertyId)).then((r) => r.data)

export const createRoomType = (propertyId: string, payload: RoomTypePayload) =>
  api
    .post<RoomType>(ENDPOINTS.properties.roomTypes(propertyId), {
      ...payload,
      fees: payload.fees?.map((f) => ({ title: f.name, amount: f.price })),
    })
    .then((r) => r.data)

export const updateRoomType = (propertyId: string, roomTypeId: string, payload: RoomTypePayload) =>
  api
    .put<RoomType>(ENDPOINTS.properties.roomType(propertyId, roomTypeId), {
      ...payload,
      fees: payload.fees?.map((f) => ({ title: f.name, amount: f.price })),
    })
    .then((r) => r.data)

export const deleteRoomType = (propertyId: string, roomTypeId: string) =>
  api.delete(ENDPOINTS.properties.roomType(propertyId, roomTypeId)).then((r) => r.data)

export const addRoomTypeImages = (propertyId: string, roomTypeId: string, urls: string[]) =>
  api
    .post(ENDPOINTS.properties.roomTypeImages(propertyId, roomTypeId), { urls })
    .then((r) => r.data)

export const deleteRoomTypeImage = (propertyId: string, roomTypeId: string, imageId: string) =>
  api
    .delete(ENDPOINTS.properties.deleteRoomTypeImage(propertyId, roomTypeId, imageId))
    .then((r) => r.data)
