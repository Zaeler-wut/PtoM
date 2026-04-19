export interface AdminPropertyCard {
  id: string
  name: string
  coverImage: string | null
  totalRooms: number
  roomTypeNames: string[]
}

export interface RoomMeter {
  id: string
  roomNumber: string
  floor: number | null
  roomTypeName: string
  electricMeter: number | null
  waterMeter: number | null
}
