// meterRepository.ts (mobile) — query database สำหรับ meter module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก meterService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงที่พักที่ admin คนนี้ดูแล — กรองจาก PropertyAdmin table
export const getAdminProperties = async (userId: string) => {
  return prisma.property.findMany({
    where: {
      admins: { some: { userId } },
    },
    include: {
      images: true,
      rooms: true,
      roomTypes: true,
    },
  })
}

// สร้างหรืออัปเดตมิเตอร์ — upsert ตาม roomId+month+year (unique key)
export const upsertMeterReading = async (data: {
  roomId: string
  month: number
  year: number
  waterMeter: number
  electricMeter: number
}) => {
  return prisma.meterReading.upsert({
    where: {
      roomId_month_year: {
        roomId: data.roomId,
        month: data.month,
        year: data.year,
      },
    },
    update: {
      waterMeter: data.waterMeter,
      electricMeter: data.electricMeter,
    },
    create: data,
  })
}

// ดึงมิเตอร์ของห้องเดือนที่ระบุ — ใช้ตรวจสอบว่ามีข้อมูลแล้วหรือไม่
export const getMeterReading = async (roomId: string, month: number, year: number) => {
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month, year } },
  })
}

// ดึงห้องทั้งหมดใน property พร้อมมิเตอร์เดือนที่ระบุ
// เรียงตาม floor → roomNumber เพื่อแสดงเป็นลำดับชั้น
export const getRoomsWithMeter = async (propertyId: string, month: number, year: number) => {
  return prisma.room.findMany({
    where: { propertyId },
    include: {
      roomType: true,
      // ดึงเฉพาะมิเตอร์เดือนที่ต้องการ (take: 1 เผื่อ index เสีย)
      meters: {
        where: { month, year },
        take: 1,
      },
    },
    orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
  })
}
