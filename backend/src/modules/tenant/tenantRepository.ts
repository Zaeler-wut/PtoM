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
