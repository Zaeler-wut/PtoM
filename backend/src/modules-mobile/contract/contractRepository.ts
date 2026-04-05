import { prisma } from "../../lib/prisma"

export const getMyContracts = async (userId: string) => {
  return prisma.contract.findMany({
    where: { userId },
    include: {
      room: {
        include: {
          property: { select: { name: true } },
        },
      },
    },
    orderBy: { startDate: "desc" },
  })
}
