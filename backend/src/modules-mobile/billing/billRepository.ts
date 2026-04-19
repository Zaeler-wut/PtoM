// billRepository.ts (mobile) — query database สำหรับ billing module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก billService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงบิลทั้งหมดของ user เฉพาะสถานะ PENDING, VERIFYING, PAID
// include: items, user, payment ล่าสุด, ห้อง และ property ผ่าน contract
// เรียงล่าสุดก่อน (year desc → month desc)
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

// ดึงบิลเดียวพร้อมข้อมูล property — ใช้แสดงหน้าชำระเงิน
// กรอง userId ด้วยเพื่อป้องกัน user อื่นเข้าถึงบิลที่ไม่ใช่ของตัวเอง
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

// ดึงบิลพร้อมข้อมูลครบสำหรับ generate PDF
// รวม: property logo, billNote, admin ชื่อแรก, roomType name
export const getBillDetailById = async (billId: string, userId: string) => {
  return prisma.bill.findFirst({
    where: { id: billId, userId },
    include: {
      items: true,
      user: { select: { firstName: true, lastName: true } },
      room: { include: { roomType: { select: { name: true } } } },
      contract: {
        include: {
          room: {
            include: {
              property: {
                select: {
                  name: true, address: true,
                  bankName: true, bankAccount: true, bankHolder: true,
                  paymentQrUrl: true, logoUrl: true, billNote: true,
                  admins: {
                    take: 1,
                    include: { user: { select: { firstName: true, lastName: true } } },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

// ดึงค่ามิเตอร์เดือนปัจจุบัน — ใช้แสดงใน PDF invoice
export const getMeterReading = async (roomId: string, month: number, year: number) => {
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month, year } },
  })
}

// ดึงค่ามิเตอร์เดือนก่อนหน้า — ใช้คำนวณการใช้น้ำ/ไฟในบิล
// handle rollover: มกราคม → ธันวาคมปีก่อน
export const getPreviousMeterReading = async (roomId: string, month: number, year: number) => {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month: prevMonth, year: prevYear } },
  })
}

// สร้าง payment record สถานะ VERIFYING — รอ admin ยืนยัน
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

// อัพเดทสถานะบิล — เรียกหลัง createPayment เพื่อเปลี่ยน PENDING → VERIFYING
export const updateBillStatus = async (billId: string, status: string) => {
  return prisma.bill.update({
    where: { id: billId },
    data: { status: status as any },
  })
}
