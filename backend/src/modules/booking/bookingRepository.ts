// bookingRepository.ts — query database สำหรับ booking module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก bookingService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงรายการจองทั้งหมดของที่พัก พร้อม user, roomType, room และ contract ที่ผูกอยู่
// include contracts ของ user เพื่อคำนวณสถานะ CHECKED_IN ใน service
export const getBookingsByProperty = async (propertyId: string) => {
  return prisma.booking.findMany({
    where: { propertyId },
    include: {
      user: {
        include: {
          // ดึง contract ของ user ที่อยู่ใน property นี้ เพื่อเช็คว่าเข้าอยู่แล้วหรือไม่
          contracts: { where: { room: { propertyId } }, select: { id: true, roomId: true, bookingId: true } },
        },
      },
      roomType: true,
      room: true,
      // contract ที่ผูกตรงกับ booking นี้
      contract: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ดึงรายละเอียด booking เดี่ยว — ตรวจสอบว่าอยู่ใน property นี้ด้วย
export const getBookingDetail = async (bookingId: string, propertyId: string) => {
  return prisma.booking.findFirst({
    where: { id: bookingId, propertyId },
    include: { user: true, roomType: true, room: true },
  })
}

// ดึง booking ที่ CONFIRMED แล้ว พร้อมข้อมูลครบสำหรับสร้างสัญญา
// include vehicles ของ user เพื่อแสดงในฟอร์มสัญญา
export const getBookingForContract = async (bookingId: string, propertyId: string) => {
  return prisma.booking.findFirst({
    where: { id: bookingId, propertyId, status: "CONFIRMED" },
    include: {
      user: { include: { vehicles: true } },
      roomType: true,
      room: true,
    },
  })
}

// ดึงห้องที่ว่างได้ ณ วันที่ moveInDate โดยแบ่งเป็น 3 กลุ่ม
// 1. AVAILABLE — ว่างพร้อมเช่าทันที
// 2. PREPARING — กำลังทำความสะอาด พร้อมก่อน moveInDate
// 3. OCCUPIED ที่แจ้งออก (MOVE_OUT_NOTICE) — พร้อมหลัง moveOutNoticeDate + preparingDays
export const getAvailableRoomsForDate = async (
  propertyId: string,
  roomTypeId: string,
  moveInDate: Date,
  preparingDays: number
) => {
  // กลุ่ม 1: AVAILABLE
  const availableRooms = await prisma.room.findMany({
    where: { propertyId, roomTypeId, status: "AVAILABLE" },
  })

  // กลุ่ม 2: PREPARING — ต้องกรองเฉพาะที่พร้อมก่อนหรือตรงวัน moveInDate
  const preparingRooms = await prisma.room.findMany({
    where: { propertyId, roomTypeId, status: "PREPARING" },
    include: {
      moveOutBills: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  })

  const readyPreparingRooms = preparingRooms.filter((room) => {
    const latestMoveOut = room.moveOutBills[0]
    // ไม่มี moveOutBill = admin ตั้งสถานะเองว่าเตรียมว่าง → พร้อมจองได้เลย
    if (!latestMoveOut) return true
    const readyDate = new Date(latestMoveOut.moveOutDate)
    readyDate.setDate(readyDate.getDate() + preparingDays)
    return readyDate <= moveInDate
  })

  // กลุ่ม 3: OCCUPIED ที่แจ้งออกแล้ว (MOVE_OUT_NOTICE) — พร้อมหลัง moveOutNoticeDate + preparingDays
  const occupiedWithNotice = await prisma.room.findMany({
    where: { propertyId, roomTypeId, status: "OCCUPIED" },
    include: {
      contracts: {
        where: { status: "MOVE_OUT_NOTICE" },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { moveOutNoticeDate: true },
      },
    },
  })

  const readyNoticeRooms = occupiedWithNotice.filter((room) => {
    const contract = room.contracts[0]
    if (!contract?.moveOutNoticeDate) return false
    const readyDate = new Date(contract.moveOutNoticeDate)
    readyDate.setDate(readyDate.getDate() + preparingDays)
    return readyDate <= moveInDate
  })

  return {
    availableRooms,
    preparingRooms: [...readyPreparingRooms, ...readyNoticeRooms],
  }
}

// ผูกห้องเข้ากับ booking และเปลี่ยนสถานะ booking เป็น CONFIRMED
export const assignRoomToBooking = async (bookingId: string, roomId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { roomId, assignedAt: new Date(), status: "CONFIRMED" },
  })
}

// เปลี่ยนสถานะห้องเป็น RESERVED เพื่อจองไว้สำหรับ booking นี้
export const reserveRoom = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "RESERVED" },
  })
}

// ดึงจำนวนวันเตรียมห้องของที่พัก — ใช้คำนวณวันที่ห้องพร้อมรับผู้เช่าใหม่
export const getPropertyPreparingDays = async (propertyId: string) => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    select: { preparingDays: true },
  })
  return property?.preparingDays ?? 3
}

// เปลี่ยนสถานะ booking เป็น CONFIRMED (กรณีมีห้องแล้ว)
export const confirmBooking = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED" },
  })
}

// เปลี่ยนสถานะ booking เป็น CANCELLED
export const cancelBooking = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  })
}

// คืนสถานะห้องเป็น AVAILABLE เมื่อ booking ถูกยกเลิก
export const releaseRoom = async (roomId: string) => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: "AVAILABLE" },
  })
}
