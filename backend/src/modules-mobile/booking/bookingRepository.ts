// bookingRepository.ts (mobile) — query database สำหรับ booking module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก bookingService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึง contract ทั้งหมดของ user — ใช้ตรวจสอบว่า booking ใดมีสัญญาแล้ว (= CHECKED_IN)
export const getContractsByUser = async (userId: string) => {
  return prisma.contract.findMany({
    where: { userId },
    select: { id: true, roomId: true, bookingId: true },
  })
}

// ดึง roomType พร้อมข้อมูลชำระเงินของ property — ใช้แสดงหน้าก่อนจอง
// กรอง allowOnlineBooking=true เพื่อไม่ให้จอง roomType ที่ปิดระบบออนไลน์
export const getBookingInfo = async (propertyId: string, roomTypeId: string) => {
  return prisma.roomType.findFirst({
    where: { id: roomTypeId, propertyId, allowOnlineBooking: true },
    include: {
      property: {
        select: {
          name: true,
          bankName: true,
          bankAccount: true,
          bankHolder: true,
          paymentQrUrl: true,
        },
      },
    },
  })
}

// สร้าง booking ใหม่ด้วยสถานะ PENDING — ยังไม่ assign ห้อง (admin จะ assign ตอน confirm)
export const createBooking = async (data: {
  propertyId: string
  roomTypeId: string
  userId: string
  moveInDate: Date
  bookingFee: number
  slipUrl: string
}) => {
  const booking = await prisma.booking.create({
    data: {
      propertyId: data.propertyId,
      roomTypeId: data.roomTypeId,
      userId: data.userId,
      moveInDate: data.moveInDate,
      bookingFee: data.bookingFee,
      slipUrl: data.slipUrl,
      status: "PENDING",
    },
  })

  return booking
}

// ดึง booking เดียวพร้อม property, roomType และ user — ใช้ใน response หลัง createBooking
export const getBookingById = async (bookingId: string) => {
  return prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      property: { select: { name: true } },
      roomType: { select: { name: true, roomPrice: true, bookingFee: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  })
}

// เปลี่ยนสถานะ booking เป็น CANCELLED
export const cancelBooking = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })
}

// คืนสถานะห้องเป็น AVAILABLE หลังยกเลิก booking ที่ assign ห้องไปแล้ว
export const releaseRoom = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "AVAILABLE" },
  })
}

// ดึงห้องทั้งหมดใน roomType พร้อม moveOutBills และ MOVE_OUT_NOTICE contracts
// ใช้คำนวณ minMoveInDate — ว่าห้องจะพร้อมวันไหนเร็วสุด
export const getRoomsForAvailabilityCheck = async (propertyId: string, roomTypeId: string) => {
  const [rooms, property] = await Promise.all([
    prisma.room.findMany({
      where: { propertyId, roomTypeId },
      include: {
        moveOutBills: { orderBy: { createdAt: "desc" }, take: 1, select: { moveOutDate: true } },
        contracts: {
          where: { status: "MOVE_OUT_NOTICE" },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { moveOutNoticeDate: true },
        },
      },
    }),
    prisma.property.findUnique({
      where: { id: propertyId },
      select: { preparingDays: true },
    }),
  ])
  return { rooms, preparingDays: property?.preparingDays ?? 3 }
}

// ดึงการจองทั้งหมดของ user เรียงล่าสุดก่อน — ใช้แสดงหน้า "การจองของฉัน"
export const getMyBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      property: { select: { name: true } },
      roomType: { select: { id: true, name: true, roomPrice: true } },
      room: { select: { roomNumber: true } },
      user: { select: { firstName: true, lastName: true } },
      contract: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
