import * as repo from "./roomRepository"

export const getRooms = async (propertyId: string) => {
  const rooms = await repo.getRoomsByProperty(propertyId)
  return rooms.map((room) => {
    const activeContract = room.contracts[0]
    return {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomTypeId: room.roomType.id,
      roomType: room.roomType.name,
      price: room.roomType.roomPrice,
      securityDeposit: room.roomType.securityDeposit,
      advanceRent: room.roomType.advanceRent,
      status: room.status,
      tenant: activeContract
        ? `${activeContract.user.firstName} ${activeContract.user.lastName}`
        : null,
    }
  })
}

export const updateRoom = async (roomId: string, data: any) => {
  const room = await repo.getRoomById(roomId)
  if (!room) throw new Error("Room not found")
  if (data.status && room.status === "OCCUPIED") throw new Error("ห้องมีผู้เช่าอยู่ ไม่สามารถเปลี่ยนสถานะได้")
  if (data.roomNumber && data.roomNumber !== room.roomNumber) {
    const existing = await repo.getRoomByNumberInProperty(room.propertyId, data.roomNumber)
    if (existing) throw new Error(`เลขห้อง "${data.roomNumber}" มีอยู่แล้วในสถานที่นี้`)
  }
  return repo.updateRoom(roomId, data)
}

export const getMeterHistory = async (roomId: string, propertyId: string) => {
  const readings = await repo.getMeterHistory(roomId, propertyId)
  if (!readings) throw new Error("Room not found")
  return readings.map((r) => ({
    id: r.id,
    month: r.month,
    year: r.year,
    waterMeter: r.waterMeter,
    electricMeter: r.electricMeter,
    createdAt: r.createdAt,
  }))
}

export const createRoom = async (propertyId: string, data: any) => {
  if (!data.roomNumber) throw new Error("roomNumber is required")
  if (!data.roomTypeId) throw new Error("roomTypeId is required")
  return repo.createRoom({
    propertyId,
    roomTypeId: data.roomTypeId,
    roomNumber: data.roomNumber,
    floor: data.floor,
  })
}
