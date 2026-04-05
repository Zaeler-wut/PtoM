import { prisma } from "../../lib/prisma"

// รายการแจ้งย้ายออก (MOVE_OUT_NOTICE)

export const getMoveOutContracts = async (propertyId: string) => {
  return prisma.contract.findMany({
    where: {
      room: { propertyId },
      status: "MOVE_OUT_NOTICE",
    },
    include: {
      user: true,
      room: { include: { roomType: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// บิลแจ้งออกที่ออกแล้ว

export const getMoveOutBillsByProperty = async (propertyId: string) => {
  return prisma.moveOutBill.findMany({
    where: { room: { propertyId } },
    include: {
      user: true,
      room: { include: { roomType: true } },
      contract: true,
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

// Contract พร้อม roomType สำหรับคำนวณ

export const getContractForMoveOut = async (
  contractId: string,
  propertyId: string
) => {
  return prisma.contract.findFirst({
    where: {
      id: contractId,
      room: { propertyId },
      status: "MOVE_OUT_NOTICE",
    },
    include: {
      user: true,
      room: { include: { roomType: { include: { fees: true } } } },
    },
  })
}

// MeterReading

export const getMeterReading = async (
  roomId: string,
  month: number,
  year: number
) => {
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month, year } },
  })
}

export const getPreviousMeterReading = async (
  roomId: string,
  month: number,
  year: number
) => {
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  return prisma.meterReading.findUnique({
    where: {
      roomId_month_year: { roomId, month: prevMonth, year: prevYear },
    },
  })
}

// บิลรายเดือนล่าสุด (สำหรับดึงมิเตอร์เดิม)

export const getLatestBill = async (contractId: string) => {
  return prisma.bill.findFirst({
    where: { contractId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { items: true },
  })
}

// สร้าง MoveOutBill

export const createMoveOutBill = async (data: {
  contractId: string
  roomId: string
  userId: string
  moveOutDate: Date
  waterStart: number
  waterEnd: number
  electricStart: number
  electricEnd: number
  totalCharge: number
  refundAmount: number
  items: { title: string; amount: number }[]
}) => {
  return prisma.moveOutBill.create({
    data: {
      contractId: data.contractId,
      roomId: data.roomId,
      userId: data.userId,
      moveOutDate: data.moveOutDate,
      waterStart: data.waterStart,
      waterEnd: data.waterEnd,
      electricStart: data.electricStart,
      electricEnd: data.electricEnd,
      totalCharge: data.totalCharge,
      refundAmount: data.refundAmount,
      status: "CONFIRMED",
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

// ดูรายละเอียด MoveOutBill

export const getMoveOutBillById = async (
  moveOutBillId: string,
  propertyId: string
) => {
  return prisma.moveOutBill.findFirst({
    where: { id: moveOutBillId, room: { propertyId } },
    include: {
      user: true,
      room: { include: { roomType: true, property: true } },
      contract: true,
      items: true,
    },
  })
}

// อัพเดท contract และห้องหลังแจ้งออก

export const endContract = async (contractId: string) => {
  return prisma.contract.update({
    where: { id: contractId },
    data: { status: "ENDED" },
  })
}

export const setRoomPreparing = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "PREPARING" },
  })
}
