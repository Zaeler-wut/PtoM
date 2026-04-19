// contractRepository.ts — query database สำหรับ contract module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก contractService.ts (และ bookingService.ts สำหรับ checkExistingContract)

import { prisma } from "../../lib/prisma"

// ดึงสัญญาทั้งหมดของที่พัก — กรองด้วย room.propertyId
export const getContractsByProperty = async (propertyId: string) => {
  return prisma.contract.findMany({
    where: { room: { propertyId } },
    include: {
      user: true,
      room: { include: { roomType: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

// ดึงสัญญาเดี่ยว — ตรวจสอบว่าอยู่ใน property นี้ด้วยผ่าน room.propertyId
export const getContractById = async (contractId: string, propertyId: string) => {
  return prisma.contract.findFirst({
    where: { id: contractId, room: { propertyId } },
    include: {
      user: { include: { vehicles: true } },
      room: { include: { roomType: true } },
    },
  })
}

// ตรวจสอบว่า booking นี้มีสัญญาแล้วหรือไม่ — ใช้ก่อนสร้างสัญญาใหม่
// bookingId เป็น unique field ใน contract table
export const checkExistingContract = async (bookingId: string) => {
  return prisma.contract.findUnique({ where: { bookingId } })
}

// ดึงห้องใน property นี้ พร้อม roomType — ใช้ตรวจสอบก่อนสร้าง/แก้ไขสัญญา
export const findRoomInProperty = async (roomId: string, propertyId: string) => {
  return prisma.room.findFirst({
    where: { id: roomId, propertyId },
    include: { roomType: true },
  })
}

// ดึง user จาก email — ใช้ใน resolveUser เพื่อเช็คว่ามี account แล้วหรือไม่
export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

// สร้าง user ใหม่สำหรับผู้เช่า walk-in ที่ยังไม่มี account
// กำหนด temp password แบบ random — ผู้เช่าต้อง reset ก่อนใช้งาน
export const createTenantUser = async (data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  lineId?: string
  address?: string
}) => {
  const bcrypt = await import("bcrypt")
  const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(2), 12)
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      lineId: data.lineId,
      address: data.address,
      password: tempPassword,
      role: "USER",
    },
  })
}

// อัปเดตข้อมูลส่วนตัวของ user — เรียกทุกครั้งที่แก้ไขสัญญาหรือสร้างสัญญาใหม่
export const updateUserInfo = async (
  userId: string,
  data: {
    firstName: string
    lastName: string
    phone?: string
    email: string
    lineId?: string
    address?: string
  }
) => {
  return prisma.user.update({ where: { id: userId }, data })
}

// แทนที่ยานพาหนะทั้งหมดของ user — ลบของเก่าแล้วสร้างใหม่ทั้งหมด
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

// สร้างสัญญาเช่าใหม่ — status เริ่มต้นเป็น ACTIVE เสมอ
export const createContract = async (data: {
  userId: string
  roomId: string
  bookingId?: string
  startDate: Date
  endDate: Date
  securityDeposit: number
  contractType: "ONLINE" | "OFFLINE"
  pdfUrl?: string
}) => {
  return prisma.contract.create({
    data: {
      userId: data.userId,
      roomId: data.roomId,
      bookingId: data.bookingId,
      startDate: data.startDate,
      endDate: data.endDate,
      securityDeposit: data.securityDeposit,
      contractType: data.contractType,
      pdfUrl: data.pdfUrl,
      status: "ACTIVE",
    },
  })
}

// อัปเดตข้อมูลสัญญา — ใช้หลังตรวจสอบ status transition แล้ว
export const updateContract = async (
  contractId: string,
  data: {
    status?: string
    startDate?: Date
    endDate?: Date
    roomId?: string
    moveOutNoticeDate?: Date
  }
) => {
  return prisma.contract.update({
    where: { id: contractId },
    data: {
      status: data.status as any,
      startDate: data.startDate,
      endDate: data.endDate,
      roomId: data.roomId,
      moveOutNoticeDate: data.moveOutNoticeDate,
    },
  })
}

// อัปเดต URL ไฟล์ PDF สัญญา — เรียกหลัง upload ไปยัง Cloudinary สำเร็จ
export const updateContractPdf = async (contractId: string, pdfUrl: string) => {
  return prisma.contract.update({
    where: { id: contractId },
    data: { pdfUrl },
  })
}

// เปลี่ยนสถานะห้อง — ใช้เมื่อสร้างสัญญา (OCCUPIED), สิ้นสุดสัญญา (AVAILABLE), หรือเปลี่ยนห้อง
export const updateRoomStatus = async (roomId: string, status: string = "OCCUPIED") => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: status as any },
  })
}

// อัปเดตสถานะ booking เป็น CHECKED_IN เมื่อสัญญาถูกสร้างสำเร็จ
export const updateBookingStatus = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CHECKED_IN" },
  })
}
