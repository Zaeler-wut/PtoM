import { prisma } from "../../lib/prisma"

export const getDashboardData = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { rooms: true, bookings: true },
  })
  const bills = await prisma.bill.findMany({
    where: { room: { propertyId } },
  })
  return { property, bills }
}
