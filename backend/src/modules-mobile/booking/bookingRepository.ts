import { prisma } from "../../lib/prisma"

// ดึงข้อมูลสำหรับหน้าจอง
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

// สร้าง booking
export const createBooking = async (data: {
  propertyId: string
  roomTypeId: string
  userId: string
  moveInDate: Date
  bookingFee: number
  slipUrl: string
}) => {
  return prisma.booking.create({
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
}

// ดึง booking พร้อม property และ roomType
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

// ยกเลิก booking
export const cancelBooking = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })
}

// คืน room status → AVAILABLE ถ้ามีการ assign แล้ว
export const releaseRoom = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "AVAILABLE" },
  })
}

// ดึงการจองทั้งหมดของ user
export const getMyBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: { userId },
    include: {
      property: { select: { name: true } },
      roomType: { select: { id: true, name: true, roomPrice: true } },
      room: { select: { roomNumber: true } },
      user: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}
