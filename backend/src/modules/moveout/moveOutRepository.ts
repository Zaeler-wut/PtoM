// moveOutRepository.ts — query database สำหรับ move-out module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก moveOutService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงสัญญาที่อยู่ในสถานะ MOVE_OUT_NOTICE — แสดงในรายการ pending
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

// ดึงบิลย้ายออกที่สร้างแล้วทั้งหมดของที่พัก — แสดงในรายการ completed
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

// ดึงสัญญาเฉพาะ MOVE_OUT_NOTICE พร้อม roomType + fees — ใช้คำนวณบิลย้ายออก
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

// ดึงมิเตอร์เดือนปัจจุบัน — ใช้ pre-fill ค่า end ในฟอร์ม
export const getMeterReading = async (
  roomId: string,
  month: number,
  year: number
) => {
  return prisma.meterReading.findUnique({
    where: { roomId_month_year: { roomId, month, year } },
  })
}

// ดึงมิเตอร์เดือนก่อนหน้า — ใช้ pre-fill ค่า start ในฟอร์ม
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

// ดึงบิลรายเดือนล่าสุด — ใช้ดึงค่ามิเตอร์เดิม (fallback กรณีไม่มี meterReading)
export const getLatestBill = async (contractId: string) => {
  return prisma.bill.findFirst({
    where: { contractId },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    include: { items: true },
  })
}

// สร้าง MoveOutBill พร้อม items — status เริ่มต้นเป็น CONFIRMED เสมอ
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

// ดึงรายละเอียด MoveOutBill เดี่ยว — include property เพื่อแสดงในใบสรุปย้ายออก
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

// เปลี่ยนสถานะสัญญาเป็น ENDED หลังออกบิลย้ายออกสำเร็จ
export const endContract = async (contractId: string) => {
  return prisma.contract.update({
    where: { id: contractId },
    data: { status: "ENDED" },
  })
}

// เปลี่ยนสถานะห้องเป็น PREPARING หลังผู้เช่าย้ายออก — รอทำความสะอาด
export const setRoomPreparing = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "PREPARING" },
  })
}
