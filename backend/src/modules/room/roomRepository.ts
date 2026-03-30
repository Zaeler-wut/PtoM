import { prisma } from "../../lib/prisma"

export const getRoomsByProperty = async (propertyId: string) => {
  return prisma.room.findMany({
    where: { propertyId },
    include: {
      roomType: true,
      contracts: {
        where: { status: "ACTIVE" },
        include: { user: true },
      },
    },
  })
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
