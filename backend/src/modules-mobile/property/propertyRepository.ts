import { prisma } from "../../../lib/prisma"

// ดึง property ทั้งหมดพร้อมข้อมูลที่ต้องใช้กรอง
export const getAllProperties = async () => {
  return prisma.property.findMany({
    include: {
      images: true,
      facilities: { include: { facility: true } },
      rooms: {
        include: {
          roomType: true,
          moveOutBills: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      roomTypes: {
        include: {
          images: true,
          fees: true,
          facilities: { include: { facility: true } },
        },
      },
    },
  })
}

// ดึง property เดียวสำหรับหน้า detail
export const getPropertyById = async (propertyId: string) => {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      images: true,
      facilities: { include: { facility: true } },
      rooms: {
        include: {
          roomType: true,
          moveOutBills: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      roomTypes: {
        where: { allowOnlineBooking: true },
        include: {
          images: true,
          fees: true,
          facilities: { include: { facility: true } },
        },
      },
    },
  })
}