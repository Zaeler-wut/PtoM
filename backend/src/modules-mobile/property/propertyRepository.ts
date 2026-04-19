// propertyRepository.ts (mobile) — query database สำหรับ property module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก propertyService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงที่พักทั้งหมดพร้อมข้อมูลที่ใช้กรองและแสดงผล
// include: images, facilities, rooms (พร้อม moveOutBills ล่าสุด และ MOVE_OUT_NOTICE contracts), roomTypes
export const getAllProperties = async () => {
  return prisma.property.findMany({
    include: {
      images: true,
      facilities: { include: { facility: true } },
      rooms: {
        include: {
          roomType: true,
          // moveOutBills ล่าสุด — ใช้คำนวณวันพร้อมของห้อง PREPARING
          moveOutBills: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          // สัญญาที่แจ้งออก — ใช้คำนวณวันพร้อมของห้อง OCCUPIED
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

// ดึงที่พักเดียวสำหรับหน้า detail — รวม roomTypes เฉพาะที่ allowOnlineBooking=true
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
      // เฉพาะ roomType ที่เปิดรับจอง online
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
