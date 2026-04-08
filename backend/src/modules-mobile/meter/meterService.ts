import * as repo from "./meterRepository"

export interface AdminPropertyCard {
  id: string
  name: string
  coverImage: string | null
  totalRooms: number
  roomTypeNames: string[]
}

export const getAdminProperties = async (userId: string): Promise<AdminPropertyCard[]> => {
  const properties = await repo.getAdminProperties(userId)

  return properties.map((p) => {
    const coverImage =
      p.images.find((img) => img.isCover)?.url || p.images[0]?.url || null

    const roomTypeNames = Array.from(new Set(p.roomTypes.map((rt) => rt.name)))

    return {
      id: p.id,
      name: p.name,
      coverImage,
      totalRooms: p.rooms.length,
      roomTypeNames,
    }
  })
}

export const getRoomsForMeter = async (
  propertyId: string,
  month: number,
  year: number
) => {
  const rooms = await repo.getRoomsWithMeter(propertyId, month, year)

  return rooms.map((r) => ({
    id: r.id,
    roomNumber: r.roomNumber,
    floor: r.floor,
    roomTypeName: r.roomType.name,
    electricMeter: r.meters[0]?.electricMeter ?? null,
    waterMeter: r.meters[0]?.waterMeter ?? null,
  }))
}

export const saveMeterReading = async (data: {
  roomId: string
  month: number
  year: number
  waterMeter: number
  electricMeter: number
}) => {
  return repo.upsertMeterReading(data)
}
