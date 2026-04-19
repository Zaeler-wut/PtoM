import { prisma } from "../../lib/prisma"

export const getRoomsByProperty = async (propertyId: string) => {
  const [rooms, property] = await Promise.all([
    prisma.room.findMany({
      where: { propertyId },
      include: {
        roomType: true,
        contracts: {
          where: { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] } },
          include: { user: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        moveOutBills: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { moveOutDate: true },
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

export const getRoomById = async (roomId: string) => {
  return prisma.room.findUnique({ where: { id: roomId } })
}

export const getRoomByNumberInProperty = async (propertyId: string, roomNumber: string) => {
  return prisma.room.findFirst({ where: { propertyId, roomNumber } })
}

export const updateRoom = async (roomId: string, data: {
  roomNumber?: string
  roomTypeId?: string
  floor?: number | null
  status?: string
}) => {
  return prisma.room.update({
    where: { id: roomId },
    data: {
      roomNumber: data.roomNumber,
      roomTypeId: data.roomTypeId,
      floor: data.floor,
      status: data.status as any,
    },
  })
}

export const getMeterHistory = async (roomId: string, propertyId: string) => {
  // ตรวจสอบว่า room อยู่ใน property นี้
  const room = await prisma.room.findFirst({ where: { id: roomId, propertyId } })
  if (!room) return null
  return prisma.meterReading.findMany({
    where: { roomId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })
}

export const deleteRoom = async (roomId: string) => {
  return prisma.room.delete({ where: { id: roomId } })
}

export const createRoom = async (data: {
  propertyId: string
  roomTypeId: string
  roomNumber: string
  floor?: number
}) => {
  return prisma.room.create({
    data: {
      propertyId: data.propertyId,
      roomTypeId: data.roomTypeId,
      roomNumber: data.roomNumber,
      floor: data.floor ?? null,
      status: "AVAILABLE",
    },
  })
}
