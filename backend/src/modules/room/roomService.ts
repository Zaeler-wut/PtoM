import * as repo from "./roomRepository"

export const getRooms = async (propertyId: string) => {
  const { rooms, preparingDays } = await repo.getRoomsByProperty(propertyId)

  return rooms.map((room) => {
    const contract = room.contracts[0]

    // คำนวณวันที่ห้องพร้อมจอง
    let availableFromDate: string | null = null
    if (room.status === "PREPARING") {
      const latestMoveOut = room.moveOutBills[0]
      if (latestMoveOut) {
        const d = new Date(latestMoveOut.moveOutDate)
        d.setDate(d.getDate() + preparingDays)
        availableFromDate = d.toISOString().split("T")[0]
      }
      // ไม่มี moveOutBill = admin ตั้งเอง → พร้อมแล้ว ไม่แสดงวัน
    } else if (contract?.status === "MOVE_OUT_NOTICE" && contract.moveOutNoticeDate) {
      const d = new Date(contract.moveOutNoticeDate)
      d.setDate(d.getDate() + preparingDays)
      availableFromDate = d.toISOString().split("T")[0]
    }

    return {
      id: room.id,
      roomNumber: room.roomNumber,
      floor: room.floor,
      roomTypeId: room.roomType.id,
      roomType: room.roomType.name,
      price: room.roomType.roomPrice + (room.roomType.furniturePrice ?? 0),
      securityDeposit: room.roomType.securityDeposit,
      advanceRent: room.roomType.advanceRent,
      status: room.status,
      contractStatus: contract?.status ?? null,
      moveOutNoticeDate: contract?.moveOutNoticeDate
        ? contract.moveOutNoticeDate.toISOString().split("T")[0]
        : null,
      availableFromDate,
      tenant: contract
        ? `${contract.user.firstName} ${contract.user.lastName}`
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
