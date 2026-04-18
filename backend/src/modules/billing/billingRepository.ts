import { prisma } from "../../lib/prisma"

// ดึงสัญญา active ในเดือนนั้นๆ (สำหรับ sendAll ที่ต้องการเฉพาะปัจจุบัน)
export const getActiveContractsByProperty = async (propertyId: string) => {
  return prisma.contract.findMany({
    where: {
      room: { propertyId },
      status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] },
    },
    include: {
      user: true,
      room: { include: { roomType: { include: { fees: true } } } },
    },
  })
}

// ดึงสัญญาที่ overlap กับเดือน/ปีที่ระบุ
// activeOnly=true  เฉพาะ ACTIVE/MOVE_OUT_NOTICE (ใช้กับเดือนปัจจุบัน)
// activeOnly=false  รวม ENDED ด้วย (ใช้กับเดือนที่ผ่านมา เพื่อแสดงบิลย้อนหลัง)
export const getContractsByPropertyForMonth = async (
  propertyId: string,
  month: number,
  year: number,
  activeOnly: boolean
) => {
  const monthStart = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const monthEnd = new Date(year, month - 1, daysInMonth, 23, 59, 59)
  return prisma.contract.findMany({
    where: {
      room: { propertyId },
      startDate: { lte: monthEnd },
      endDate: { gte: monthStart },
      ...(activeOnly ? { status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] } } : {}),
    },
    include: {
      user: true,
      room: { include: { roomType: { include: { fees: true } } } },
      moveOutBills: { select: { id: true }, orderBy: { createdAt: "desc" }, take: 1 },
    },
  })
}

// ดึงข้อมูล มิเตอร์ที่อ่านได้
export const getMeterReading = async (
  roomId: string,
  month: number,
  year: number
) => {
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month, year } },
    include: { images: true },
  })
}

// มิเตอร์เดือนก่อนหน้า
export const getPreviousMeterReading = async (
  roomId: string,
  month: number,
  year: number
) => {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month: prevMonth, year: prevYear } },
  })
}

export const upsertMeterReading = async (
  roomId: string,
  month: number,
  year: number,
  data: { waterMeter: number; electricMeter: number }
) => {
  return prisma.meterReading.upsert({
    where: { roomId_month_year: { roomId, month, year } },
    update: {
      waterMeter: data.waterMeter,
      electricMeter: data.electricMeter,
    },
    create: {
      roomId,
      month,
      year,
      waterMeter: data.waterMeter,
      electricMeter: data.electricMeter,
    },
  })
}

// บิล
export const getBillByContract = async (
  contractId: string,
  month: number,
  year: number
) => {
  return prisma.bill.findFirst({
    where: { contractId, month, year },
    include: { items: true, payments: true },
  })
}

export const getBillsByProperty = async (
  propertyId: string,
  month: number,
  year: number
) => {
  return prisma.bill.findMany({
    where: {
      month,
      year,
      room: { propertyId },
    },
    include: {
      items: true,
      payments: true,
      user: true,
      room: { include: { roomType: true } },
      contract: true,
    },
  })
}

export const createBill = async (data: {
  contractId: string
  roomId: string
  userId: string
  month: number
  year: number
  roomRent: number
  furnitureRent?: number
  total: number
  items: { title: string; amount: number }[]
}) => {
  return prisma.bill.create({
    data: {
      contractId: data.contractId,
      roomId: data.roomId,
      userId: data.userId,
      month: data.month,
      year: data.year,
      roomRent: data.roomRent,
      furnitureRent: data.furnitureRent,
      total: data.total,
      status: "PENDING",
      items: {
        create: data.items.map((item) => ({
          title: item.title,
          amount: item.amount,
        })),
      },
    },
    include: { items: true },
  })
}

export const createPaymentForBill = async (data: {
  billId: string
  userId: string
  amount: number
  slipUrl?: string
}) => {
  return prisma.payment.create({
    data: {
      billId: data.billId,
      userId: data.userId,
      amount: data.amount,
      slipUrl: data.slipUrl ?? null,
      status: "VERIFYING",
    },
  })
}

export const updateBillStatus = async (billId: string, status: string) => {
  return prisma.bill.update({
    where: { id: billId },
    data: { status: status as any },
  })
}

export const updateBillPdf = async (billId: string, pdfUrl: string) => {
  return prisma.bill.update({
    where: { id: billId },
    data: { pdfUrl },
  })
}

// จ่ายเงิน
export const getPaymentsByProperty = async (
  propertyId: string,
  month: number,
  year: number
) => {
  return prisma.payment.findMany({
    where: {
      bill: {
        month,
        year,
        room: { propertyId },
      },
    },
    include: {
      user: true,
      bill: {
        include: {
          room: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

// บิลที่ส่งแล้ว (PENDING) แต่ยังไม่มีการชำระเงิน
export const getPendingBillsWithoutPayment = async (
  propertyId: string,
  month: number,
  year: number
) => {
  return prisma.bill.findMany({
    where: {
      month,
      year,
      room: { propertyId },
      status: "PENDING",
      payments: { none: {} },
    },
    include: {
      user: true,
      room: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export const getPaymentById = async (paymentId: string) => {
  return prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: true,
      bill: {
        include: { room: { include: { roomType: true } } },
      },
    },
  })
}

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: status as any },
  })
}

export const updatePaymentConfirmed = async (paymentId: string, verifiedBy: string) => {
  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: "CONFIRMED",
      verifiedAt: new Date(),
      verifiedBy,
    },
  })
}

// ใบแจ้งหนี้
export const getPropertyForInvoice = async (propertyId: string) => {
  return prisma.property.findUnique({
    where: { id: propertyId },
    select: {
      name: true,
      address: true,
      bankName: true,
      bankAccount: true,
      bankHolder: true,
      paymentQrUrl: true,
      logoUrl: true,
      billNote: true,
    },
  })
}

export const getAvailableBillingMonths = async (propertyId: string) => {
  const rows = await prisma.bill.findMany({
    where: { room: { propertyId } },
    select: { month: true, year: true },
    distinct: ["month", "year"],
    orderBy: [{ year: "desc" }, { month: "desc" }],
  })
  return rows
}

