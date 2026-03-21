export interface RoomListItem {
  id: string
  roomNumber: string
  floor: number | null
  roomType: string
  price: number
  status: RoomStatus
  tenant: string | null
}

export type RoomStatus = "AVAILABLE" | "RESERVED" | "OCCUPIED" | "PREPARING" | "MAINTENANCE"

export interface CreateRoomInput {
  roomTypeId: string
  roomNumber: string
  floor?: number
}
