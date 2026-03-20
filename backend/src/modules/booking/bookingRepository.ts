import { prisma } from "../../lib/prisma"

export const getBookingsByProperty = async (propertyId: string) => {
  return prisma.booking.findMany({
    where: { propertyId },
    include: { user: true, roomType: true, room: true },
    orderBy: { createdAt: "desc" },
  })
}

export const getBookingDetail = async (bookingId: string, propertyId: string) => {
  return prisma.booking.findFirst({
    where: { id: bookingId, propertyId },
    include: { user: true, roomType: true, room: true },
  })
}

export const getBookingForContract = async (bookingId: string, propertyId: string) => {
  return prisma.booking.findFirst({
    where: { id: bookingId, propertyId, status: "CONFIRMED" },
    include: {
      user: { include: { vehicles: true } },
      roomType: true,
      room: true,
    },
  })
}

// ดึงห้องที่ว่างได้ ณ วันที่ moveInDate
// Priority: PREPARING ที่พร้อมก่อน moveInDate → AVAILABLE
export const getAvailableRoomsForDate = async (
  propertyId: string,
  roomTypeId: string,
  moveInDate: Date,
  preparingDays: number
) => {
  const availableRooms = await prisma.room.findMany({
    where: { propertyId, roomTypeId, status: "AVAILABLE" },
  })

  const preparingRooms = await prisma.room.findMany({
    where: { propertyId, roomTypeId, status: "PREPARING" },
    include: {
      moveOutBills: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  const readyPreparingRooms = preparingRooms.filter((room) => {
    const latestMoveOut = room.moveOutBills[0]
    if (!latestMoveOut) return false
    const readyDate = new Date(latestMoveOut.moveOutDate)
    readyDate.setDate(readyDate.getDate() + preparingDays)
    return readyDate <= moveInDate
  })

  return { availableRooms, preparingRooms: readyPreparingRooms }
}

export const assignRoomToBooking = async (bookingId: string, roomId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { roomId, assignedAt: new Date(), status: "CONFIRMED" },
  })
}

export const reserveRoom = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "RESERVED" },
  })
}

export const getPropertyPreparingDays = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { preparingDays: true },
  })
  return property?.preparingDays ?? 3
}

export const confirmBooking = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  })
}

export const cancelBooking = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })
}

export const releaseRoom = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "AVAILABLE" },
  })
}
