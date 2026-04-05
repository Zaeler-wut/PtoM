import { prisma } from "../../lib/prisma"

// ดึงบิลทั้งหมดของ user
export const getBillsByUser = async (userId: string) => {
  return prisma.bill.findMany({
    where: {
      userId,
      status: { in: ["PENDING", "VERIFYING", "PAID"] },
    },
    include: {
      items: true,
      user: { select: { firstName: true, lastName: true } },
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      room: {
        include: { roomType: true },
      },
      contract: {
        include: {
          room: {
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
          },
        },
      },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })
}

// ดึงบิลเดียวสำหรับหน้าชำระเงิน
export const getBillById = async (billId: string, userId: string) => {
  return prisma.bill.findFirst({
    where: { id: billId, userId },
    include: {
      items: true,
      room: true,
      contract: {
        include: {
          room: {
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
          },
        },
      },
    },
  })
}

// สร้าง payment
export const createPayment = async (data: {
  userId: string
  billId: string
  amount: number
  slipUrl: string
}) => {
  return prisma.payment.create({
    data: {
      userId: data.userId,
      billId: data.billId,
      amount: data.amount,
      slipUrl: data.slipUrl,
      status: "VERIFYING",
    },
  })
}

// อัพเดท bill status  VERIFYING
export const updateBillStatus = async (billId: string, status: string) => {
  return prisma.bill.update({
    where: { id: billId },
    data: { status: status as any },
  })
}
