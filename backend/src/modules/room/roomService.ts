import * as repo from "./roomRepository"

export const getRooms = async (propertyId: string) => {
  const rooms = await repo.getRoomsByProperty(propertyId)
  return rooms.map((room) => {
    const activeContract = room.contracts[0]
    return {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomType: room.roomType.name,
      price: room.roomType.roomPrice,
      status: room.status,
      tenant: activeContract
        ? `${activeContract.user.firstName} ${activeContract.user.lastName}`
        : null,
    }
  })
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
