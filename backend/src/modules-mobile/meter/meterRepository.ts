import { prisma } from "../../lib/prisma"

// ดึง properties ที่ admin คนนี้ดูแล
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

// บันทึกมิเตอร์
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

// ดึงมิเตอร์ของห้องในเดือนนั้น (ถ้ามี)
export const getMeterReading = async (roomId: string, month: number, year: number) => {
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month, year } },
  })
}

// ดึงห้องทั้งหมดใน property พร้อมมิเตอร์เดือนล่าสุด
export const getRoomsWithMeter = async (propertyId: string, month: number, year: number) => {
  return prisma.room.findMany({
    where: { propertyId },
    include: {
      roomType: true,
      meters: {
        where: { month, year },
        take: 1,
      },
    },
    orderBy: [{ floor: "asc" }, { roomNumber: "asc" }],
  })
}
