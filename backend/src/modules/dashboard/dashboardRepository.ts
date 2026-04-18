import { prisma } from "../../lib/prisma"

export const getDashboardData = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { rooms: true, bookings: true },
  })
  const now = new Date()
  const bills = await prisma.bill.findMany({
    where: { room: { propertyId }, month: now.getMonth() + 1, year: now.getFullYear() },
  })
  return { property, bills }
}

// ดึง Bill PAID ย้อนหลัง 
export const getPaidBillsByMonths = async (
  propertyId: string,
  monthsBack: number
) => {
  // คำนวณช่วงเดือนย้อนหลัง
  const now = new Date()
  const ranges: { month: number; year: number }[] = []

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