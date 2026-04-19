// roomTypeApi.ts (web) — API calls สำหรับจัดการประเภทห้องพักฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก roomSlice.ts และ RoomTypePage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"

// ข้อมูลรูป room type
export interface RoomTypeImage {
  id: string
  url: string
}

// ค่าธรรมเนียมเพิ่มเติมของ room type
export interface RoomTypeFee {
  id?: string
  name: string
  price: number
}

// ข้อมูล room type ฉบับเต็ม
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

// input สำหรับสร้าง/แก้ไข room type
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

// GET /api/admin/properties/:propertyId/room-types — ดึง room type ทั้งหมดของ property
export const getRoomTypes = (propertyId: string) =>
  api.get<RoomType[]>(ENDPOINTS.properties.roomTypes(propertyId)).then((r) => r.data)

// POST /api/admin/properties/:propertyId/room-types — สร้าง room type ใหม่
// แปลง fees: { name, price } → { title, amount } ก่อนส่งไป backend
export const createRoomType = (propertyId: string, payload: RoomTypePayload) =>
  api
    .post<RoomType>(ENDPOINTS.properties.roomTypes(propertyId), {
      ...payload,
      fees: payload.fees?.map((f) => ({ title: f.name, amount: f.price })),
    })
    .then((r) => r.data)

// PUT /api/admin/properties/:propertyId/room-types/:roomTypeId — แก้ไข room type
// แปลง fees เหมือน createRoomType
export const updateRoomType = (propertyId: string, roomTypeId: string, payload: RoomTypePayload) =>
  api
    .put<RoomType>(ENDPOINTS.properties.roomType(propertyId, roomTypeId), {
      ...payload,
      fees: payload.fees?.map((f) => ({ title: f.name, amount: f.price })),
    })
    .then((r) => r.data)

// DELETE /api/admin/properties/:propertyId/room-types/:roomTypeId — ลบ room type
export const deleteRoomType = (propertyId: string, roomTypeId: string) =>
  api.delete(ENDPOINTS.properties.roomType(propertyId, roomTypeId)).then((r) => r.data)

// POST /api/admin/properties/:propertyId/room-types/:roomTypeId/images — เพิ่มรูป room type
export const addRoomTypeImages = (propertyId: string, roomTypeId: string, urls: string[]) =>
  api
    .post(ENDPOINTS.properties.roomTypeImages(propertyId, roomTypeId), { urls })
    .then((r) => r.data)

// DELETE /api/admin/properties/:propertyId/room-types/:roomTypeId/images/:imageId — ลบรูป room type
export const deleteRoomTypeImage = (propertyId: string, roomTypeId: string, imageId: string) =>
  api
    .delete(ENDPOINTS.properties.deleteRoomTypeImage(propertyId, roomTypeId, imageId))
    .then((r) => r.data)
