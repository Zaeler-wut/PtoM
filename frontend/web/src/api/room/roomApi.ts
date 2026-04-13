import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"

export type RoomStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "PREPARING" | "MAINTENANCE"

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

export const getRooms = (propertyId: string) =>
  api.get<Room[]>(ENDPOINTS.rooms.list(propertyId)).then((r) => r.data)

export const createRoom = (
  propertyId: string,
  data: { roomNumber: string; roomTypeId: string; floor?: number }
) =>
  api.post<Room>(ENDPOINTS.rooms.create(propertyId), data).then((r) => r.data)

export const updateRoom = (
  propertyId: string,
  roomId: string,
  data: { roomNumber?: string; roomTypeId?: string; floor?: number | null; status?: RoomStatus }
) =>
  api.put<Room>(ENDPOINTS.rooms.update(propertyId, roomId), data).then((r) => r.data)

export interface MeterReading {
  id: string
  month: number
  year: number
  waterMeter: number
  electricMeter: number
  createdAt: string
}

export const getMeterHistory = (propertyId: string, roomId: string) =>
  api.get<MeterReading[]>(ENDPOINTS.rooms.meterHistory(propertyId, roomId)).then((r) => r.data)
