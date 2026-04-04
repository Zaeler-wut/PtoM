import { prisma } from "../../lib/prisma"

// ดึงข้อมูล user พร้อม contract active และบิล
export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      // สัญญา active ล่าสุด
      contracts: {
        where: { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] } },
        include: {
          room: {
            include: {
              property: { select: { name: true } },
              roomType: {
                select: {
                  name: true,
                  roomPrice: true,
                  furniturePrice: true,
                },
              },
            },
          },
        },
        orderBy: { startDate: "desc" },
        take: 1,
      },
      // สรุปบิล
      bills: {
        where: {
          status: { in: ["PENDING", "VERIFYING", "PAID"] },
        },
        select: { status: true },
      },
    },
  })
}

// อัพเดทข้อมูลส่วนตัว
export const updateUserProfile = async (
  userId: string,
  data: { firstName: string; lastName: string; phone?: string }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
    },
  })
}
