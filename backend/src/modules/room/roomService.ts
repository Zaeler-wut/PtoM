// roomService.ts — business logic สำหรับ room module
// รับข้อมูลจาก roomRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ roomRepository สำหรับ query database

import * as repo from "./roomRepository"

// ดึงรายการห้องทั้งหมดของที่พัก พร้อมคำนวณวันที่ห้องพร้อมเช่าใหม่
// เรียก: roomRepository.getRoomsByProperty()
// ส่งกลับ: array ของ room พร้อมข้อมูล tenant ปัจจุบันและ availableFromDate
export const getRooms = async (propertyId: string) => {
  const { rooms, preparingDays } = await repo.getRoomsByProperty(propertyId)

  return rooms.map((room) => {
    const contract = room.contracts[0]

    // คำนวณวันที่ห้องพร้อมจองใหม่ตาม preparingDays ของที่พัก
    let availableFromDate: string | null = null
    if (room.status === "PREPARING") {
      const latestMoveOut = room.moveOutBills[0]
      if (latestMoveOut) {
        const d = new Date(latestMoveOut.moveOutDate)
        d.setDate(d.getDate() + preparingDays)
        availableFromDate = d.toISOString().split("T")[0]
      }
      // ถ้าไม่มี moveOutBill แสดงว่า admin ตั้งสถานะเอง ไม่แสดงวัน
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
      // ชื่อผู้เช่าปัจจุบัน ถ้าไม่มีสัญญา active ส่ง null
      tenant: contract
        ? `${contract.user.firstName} ${contract.user.lastName}`
        : null,
    }
  })
}

// อัปเดตข้อมูลห้อง
// ตรวจสอบ: ห้องมีอยู่จริง, ไม่เปลี่ยน status ถ้ามีผู้เช่า, ไม่ให้เลขห้องซ้ำ
// เรียก: roomRepository.updateRoom()
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

// ดึงประวัติมิเตอร์น้ำ-ไฟของห้อง
// เรียก: roomRepository.getMeterHistory()
// ส่งกลับ: array ของ MeterReading เรียงจากล่าสุด
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

// ลบห้อง — ตรวจสอบ status ก่อนลบ
// ไม่อนุญาต: OCCUPIED (มีผู้เช่า) และ PREPARING (กำลังเตรียมห้อง)
// เรียก: roomRepository.deleteRoom()
export const deleteRoom = async (roomId: string) => {
  const room = await repo.getRoomById(roomId)
  if (!room) throw new Error("Room not found")
  if (room.status === "OCCUPIED") throw new Error("ห้องมีผู้เช่าอยู่ ไม่สามารถลบได้")
  if (room.status === "PREPARING") throw new Error("ห้องอยู่ในสถานะเตรียมว่าง ไม่สามารถลบได้")
  return repo.deleteRoom(roomId)
}

// สร้างห้องใหม่ — ตรวจสอบ required fields
// เรียก: roomRepository.createRoom()
// ส่งกลับ: ข้อมูลห้องที่เพิ่งสร้าง
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
