// roomRepository.ts — query database สำหรับ room module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก roomService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงห้องทั้งหมดของที่พัก พร้อม roomType, contract active ล่าสุด และ moveOutBill ล่าสุด
// query พร้อมกันสองอย่างด้วย Promise.all เพื่อประสิทธิภาพ
export const getRoomsByProperty = async (propertyId: string) => {
  const [rooms, property] = await Promise.all([
    prisma.room.findMany({
      where: { propertyId },
      include: {
        roomType: true,
        // ดึงเฉพาะ contract ที่ยังมีผู้เช่าหรืออยู่ระหว่างแจ้งออก
        contracts: {
          where: { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] } },
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        // ดึง moveOutBill ล่าสุดเพื่อคำนวณวันที่ห้องพร้อมเช่าใหม่
        moveOutBills: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { moveOutDate: true },
        },
      },
    }),
    // ดึง preparingDays ของที่พัก เพื่อคำนวณวันที่ห้องพร้อมเช่าใหม่หลังย้ายออก
    prisma.property.findUnique({
      where: { id: propertyId },
      select: { preparingDays: true },
    }),
  ])
  return { rooms, preparingDays: property?.preparingDays ?? 3 }
}

// ดึงห้องเดี่ยวจาก roomId — ใช้ตรวจสอบก่อน update/delete
export const getRoomById = async (roomId: string) => {
  return prisma.room.findUnique({ where: { id: roomId } })
}

// ตรวจสอบว่ามีเลขห้องซ้ำในที่พักเดียวกันหรือไม่ — ใช้ก่อน update roomNumber
export const getRoomByNumberInProperty = async (propertyId: string, roomNumber: string) => {
  return prisma.room.findFirst({ where: { propertyId, roomNumber } })
}

// อัปเดตข้อมูลห้อง (roomNumber, roomTypeId, floor, status)
// ส่งผลลัพธ์กลับไปยัง roomService
export const updateRoom = async (roomId: string, data: {
  roomNumber?: string
  roomTypeId?: string
  floor?: number | null
  status?: string
}) => {
  return prisma.room.update({
    where: { id: roomId },
    data: {
      roomNumber: data.roomNumber,
      roomTypeId: data.roomTypeId,
      floor: data.floor,
      status: data.status as any,
    },
  })
}

// ดึงประวัติมิเตอร์น้ำ-ไฟของห้อง เรียงจากล่าสุด
// ตรวจสอบก่อนว่า room อยู่ใน property นี้จริง เพื่อป้องกัน cross-property access
export const getMeterHistory = async (roomId: string, propertyId: string) => {
  const room = await prisma.room.findFirst({ where: { id: roomId, propertyId } })
  if (!room) return null
  return prisma.meterReading.findMany({
    where: { roomId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })
}

// ลบห้องออกจาก database — ถูกเรียกหลัง roomService ตรวจสอบ status ผ่านแล้ว
export const deleteRoom = async (roomId: string) => {
  return prisma.room.delete({ where: { id: roomId } })
}

// สร้างห้องใหม่ใน database — status เริ่มต้นเป็น AVAILABLE
export const createRoom = async (data: {
  propertyId: string
  roomTypeId: string
  roomNumber: string
  floor?: number
}) => {
  return prisma.room.create({
    data: {
      propertyId: data.propertyId,
      roomTypeId: data.roomTypeId,
      roomNumber: data.roomNumber,
      floor: data.floor ?? null,
      status: "AVAILABLE",
    },
  })
}
