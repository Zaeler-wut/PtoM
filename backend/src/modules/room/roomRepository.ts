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
