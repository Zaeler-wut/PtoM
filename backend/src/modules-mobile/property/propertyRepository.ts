import { prisma } from "../../lib/prisma"

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
          contracts: {
            where: { status: "MOVE_OUT_NOTICE" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { status: true, moveOutNoticeDate: true },
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
          contracts: {
            where: { status: "MOVE_OUT_NOTICE" },
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { status: true, moveOutNoticeDate: true },
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