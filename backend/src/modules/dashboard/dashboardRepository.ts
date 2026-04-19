// dashboardRepository.ts — query database สำหรับ dashboard module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก dashboardService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงข้อมูล property พร้อมห้องทุกห้องและ booking ของเดือนนี้
// ใช้คำนวณสถิติ dashboard: จำนวนห้องแต่ละสถานะ, booking รอยืนยัน
export const getDashboardData = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { rooms: true, bookings: true },
  })
  // ดึงบิลเดือนปัจจุบัน — ใช้คำนวณ unpaidBills, verifyingBills, monthlyRevenue
  const now = new Date()
  const bills = await prisma.bill.findMany({
    where: { room: { propertyId }, month: now.getMonth() + 1, year: now.getFullYear() },
  })
  return { property, bills }
}

// ดึงบิล PAID ย้อนหลัง N เดือน — ใช้วาดกราฟรายได้
// สร้าง OR condition จากทุก month/year ในช่วงที่ต้องการ
export const getPaidBillsByMonths = async (
  propertyId: string,
  monthsBack: number
) => {
  const now = new Date()
  const ranges: { month: number; year: number }[] = []

  // สร้างรายการ month/year ย้อนหลัง N เดือน
  for (let i = 0; i < monthsBack; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    ranges.push({ month: d.getMonth() + 1, year: d.getFullYear() })
  }

  return prisma.bill.findMany({
    where: {
      room: { propertyId },
      status: "PAID",
      OR: ranges.map((r) => ({ month: r.month, year: r.year })),
    },
    select: {
      month: true,
      year: true,
      total: true,
    },
  })
}
