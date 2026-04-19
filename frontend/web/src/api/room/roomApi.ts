// roomApi.ts (web) — API calls สำหรับจัดการห้องพักและมิเตอร์ฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก roomSlice.ts และ RoomPage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"

// สถานะห้องพักที่เป็นไปได้ทั้งหมด
export type RoomStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "PREPARING" | "MAINTENANCE"

// ข้อมูลห้องพักสำหรับแสดงในตาราง
export interface Room {
  id: string
  roomNumber: string
  floor: number | null
  roomTypeId: string
  roomType: string
  price: number
  status: RoomStatus
  contractStatus: string | null
  moveOutNoticeDate: string | null
  availableFromDate: string | null
  tenant: string | null
}

// GET /api/admin/properties/:propertyId/rooms — ดึงห้องทั้งหมดของ property
export const getRooms = (propertyId: string) =>
  api.get<Room[]>(ENDPOINTS.rooms.list(propertyId)).then((r) => r.data)

// POST /api/admin/properties/:propertyId/rooms — สร้างห้องใหม่
export const createRoom = (
  propertyId: string,
  data: { roomNumber: string; roomTypeId: string; floor?: number }
) =>
  api.post<Room>(ENDPOINTS.rooms.create(propertyId), data).then((r) => r.data)

// DELETE /api/admin/properties/:propertyId/rooms/:roomId — ลบห้อง
export const deleteRoom = (propertyId: string, roomId: string) =>
  api.delete(ENDPOINTS.rooms.delete(propertyId, roomId))

// PUT /api/admin/properties/:propertyId/rooms/:roomId — แก้ไขข้อมูลห้อง (roomNumber, roomType, floor, status)
export const updateRoom = (
  propertyId: string,
  roomId: string,
  data: { roomNumber?: string; roomTypeId?: string; floor?: number | null; status?: RoomStatus }
) =>
  api.put<Room>(ENDPOINTS.rooms.update(propertyId, roomId), data).then((r) => r.data)

// ข้อมูลประวัติมิเตอร์รายเดือนของห้อง
export interface MeterReading {
  id: string
  month: number
  year: number
  waterMeter: number
  electricMeter: number
  createdAt: string
}

// GET /api/admin/properties/:propertyId/rooms/:roomId/meters — ดึงประวัติมิเตอร์ทั้งหมดของห้อง
export const getMeterHistory = (propertyId: string, roomId: string) =>
  api.get<MeterReading[]>(ENDPOINTS.rooms.meterHistory(propertyId, roomId)).then((r) => r.data)
