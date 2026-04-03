import { prisma } from "../../lib/prisma"

export const getTenantsByProperty = async (propertyId: string) => {
  return prisma.contract.findMany({
    where: {
      room: { propertyId },
      status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] },
    },
    include: {
      user: true,
      room: { include: { roomType: true } },
    },
    orderBy: { startDate: "desc" },
  })
}

export const getTenantDetail = async (contractId: string, propertyId: string) => {
  return prisma.contract.findFirst({
    where: { id: contractId, room: { propertyId } },
    include: {
      user: { include: { vehicles: true } },
      room: { include: { roomType: true } },
    },
  })
}

export const replaceVehicles = async (
  userId: string,
  vehicles: { plateNumber: string; type: string }[]
) => {
  await prisma.vehicle.deleteMany({ where: { userId } })
  if (vehicles.length === 0) return
  await prisma.vehicle.createMany({
    data: vehicles.map((v) => ({ userId, plateNumber: v.plateNumber, type: v.type })),
  })
}

export const updateUserInfo = async (
  userId: string,
  data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    lineId?: string
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      lineId: data.lineId ?? null,
    },
  })
}
