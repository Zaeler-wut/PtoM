// contractService.ts — business logic สำหรับ contract module
// รับข้อมูลจาก contractRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ contractRepository สำหรับ query database

import * as repo from "./contractRepository"

// รวมที่อยู่จากหลาย field เป็น string เดียว — ส่งผลลัพธ์ไปยัง resolveUser
function buildAddress(data: {
  houseNumber?: string
  soi?: string
  road?: string
  subDistrict?: string
  district?: string
  province?: string
}): string {
  return [
    data.houseNumber,
    data.soi ? `ซ.${data.soi}` : null,
    data.road ? `ถ.${data.road}` : null,
    data.subDistrict,
    data.district,
    data.province,
  ]
    .filter(Boolean)
    .join(" ")
}

// ตรวจสอบ required fields และ validate วันที่ก่อนสร้างสัญญา
// ส่งกลับ: startDate, endDate เป็น Date object
function validateContractData(data: any) {
  if (!data.firstName?.trim()) throw new Error("firstName is required")
  if (!data.lastName?.trim()) throw new Error("lastName is required")
  if (!data.email?.trim()) throw new Error("email is required")
  if (!data.roomId) throw new Error("roomId is required")
  if (!data.startDate) throw new Error("startDate is required")
  if (!data.endDate) throw new Error("endDate is required")
  if (data.securityDeposit === undefined) throw new Error("securityDeposit is required")
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  if (isNaN(startDate.getTime())) throw new Error("startDate is invalid")
  if (isNaN(endDate.getTime())) throw new Error("endDate is invalid")
  if (endDate <= startDate) throw new Error("endDate must be after startDate")
  return { startDate, endDate }
}

// หา user จาก email — ถ้ามีแล้วให้อัปเดตข้อมูล, ถ้าไม่มีให้สร้างใหม่
// ใช้ในขั้นตอนสร้างสัญญา เพื่อ link สัญญากับ user account
// เรียก: contractRepository.findUserByEmail(), updateUserInfo(), createTenantUser()
async function resolveUser(data: {
  email: string
  firstName: string
  lastName: string
  phone?: string
  lineId?: string
  address?: string
}) {
  const email = data.email.trim().toLowerCase()
  let user = await repo.findUserByEmail(email)
  if (user) {
    // อัปเดตข้อมูลผู้เช่าที่มีอยู่แล้ว
    await repo.updateUserInfo(user.id, {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
      email,
      lineId: data.lineId,
      address: data.address,
    })
  } else {
    // สร้าง user ใหม่ด้วย temp password (ผู้เช่า walk-in ยังไม่มี account)
    user = await repo.createTenantUser({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      phone: data.phone,
      lineId: data.lineId,
      address: data.address,
    })
  }
  return user
}

// ดึงรายการสัญญาทั้งหมดของที่พัก พร้อมคำนวณระยะเวลา
// เรียก: contractRepository.getContractsByProperty()
// ส่งกลับ: array ของสัญญาพร้อม duration เป็น string เช่น "12 เดือน"
export const getContracts = async (propertyId: string) => {
  const contracts = await repo.getContractsByProperty(propertyId)
  return contracts.map((c) => {
    const months = Math.round(
      (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    return {
      contractId: c.id,
      firstName: c.user.firstName,
      lastName: c.user.lastName,
      roomNumber: c.room.roomNumber,
      contractType: c.contractType,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      duration: `${months} เดือน`,
      pdfUrl: c.pdfUrl,
    }
  })
}

// ดึงรายละเอียดสัญญาเดี่ยว — รวมข้อมูลการเงินจาก roomType
// เรียก: contractRepository.getContractById()
// ส่งกลับ: ข้อมูลสัญญาครบถ้วน รวมผู้เช่า ห้อง ยานพาหนะ และอัตราค่าบริการ
export const getContractDetail = async (contractId: string, propertyId: string) => {
  const c = await repo.getContractById(contractId, propertyId)
  if (!c) throw new Error("Contract not found")
  const months = Math.round(
    (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  const rt = c.room.roomType
  return {
    contractId: c.id,
    contractType: c.contractType,
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    createdAt: c.createdAt,
    moveOutNoticeDate: c.moveOutNoticeDate ?? null,
    duration: `${months} เดือน`,
    pdfUrl: c.pdfUrl,
    user: {
      id: c.user.id,
      firstName: c.user.firstName,
      lastName: c.user.lastName,
      email: c.user.email,
      phone: c.user.phone,
      lineId: c.user.lineId,
      address: c.user.address,
    },
    room: {
      roomId: c.room.id,
      roomNumber: c.room.roomNumber,
      roomType: rt.name,
      roomPrice: rt.roomPrice,
    },
    vehicles: c.user.vehicles.map((v) => ({
      plateNumber: v.plateNumber,
      type: v.type,
    })),
    financial: {
      securityDeposit: c.securityDeposit,
      advanceRent: rt.advanceRent,
      waterRate: rt.waterRate,
      electricRate: rt.electricRate,
      furniturePrice: rt.furniturePrice,
    },
  }
}

// บันทึก URL ของไฟล์สัญญา PDF ที่อัปโหลดไปยัง Cloudinary แล้ว
// เรียก: contractRepository.updateContractPdf()
export const uploadContractPdf = async (
  contractId: string,
  propertyId: string,
  pdfUrl: string
) => {
  const c = await repo.getContractById(contractId, propertyId)
  if (!c) throw new Error("Contract not found")
  if (!pdfUrl) throw new Error("pdfUrl is required")
  return repo.updateContractPdf(contractId, pdfUrl)
}

// แก้ไขข้อมูลสัญญา — ตรวจสอบ status transition ก่อนอัปเดต
// Status transitions ที่อนุญาต: ACTIVE→MOVE_OUT_NOTICE/ENDED, MOVE_OUT_NOTICE→ACTIVE/ENDED
// ถ้า roomId เปลี่ยน → คืนห้องเก่า AVAILABLE, ตั้งห้องใหม่เป็น OCCUPIED
// ถ้า status เป็น ENDED → คืนห้องเป็น AVAILABLE
// เรียก: contractRepository หลายฟังก์ชัน
// ส่งกลับ: contractId, status, startDate, endDate, roomId ที่อัปเดต
export const updateContract = async (
  contractId: string,
  propertyId: string,
  data: {
    status?: "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
    moveOutNoticeDate?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    lineId?: string
    address?: string
    roomId?: string
    startDate?: string
    endDate?: string
    vehicles?: { plateNumber: string; type: string }[]
  }
) => {
  const c = await repo.getContractById(contractId, propertyId)
  if (!c) throw new Error("Contract not found")

  // ตรวจสอบว่า status transition ถูกต้องหรือไม่
  if (data.status) {
    const isStatusChanging = data.status !== c.status
    if (isStatusChanging) {
      const allowedTransitions: Record<string, string[]> = {
        ACTIVE: ["MOVE_OUT_NOTICE", "ENDED"],
        MOVE_OUT_NOTICE: ["ACTIVE", "ENDED"],
        ENDED: [],
      }
      if (!allowedTransitions[c.status]?.includes(data.status)) {
        throw new Error(`Cannot change status from ${c.status} to ${data.status}`)
      }
      if (data.status === "MOVE_OUT_NOTICE" && !data.moveOutNoticeDate) {
        throw new Error("moveOutNoticeDate is required when status is MOVE_OUT_NOTICE")
      }
    }
  }

  let startDate: Date | undefined
  let endDate: Date | undefined
  if (data.startDate) {
    startDate = new Date(data.startDate)
    if (isNaN(startDate.getTime())) throw new Error("startDate is invalid")
  }
  if (data.endDate) {
    endDate = new Date(data.endDate)
    if (isNaN(endDate.getTime())) throw new Error("endDate is invalid")
  }
  if (startDate && endDate && endDate <= startDate) {
    throw new Error("endDate must be after startDate")
  }

  // อัปเดตข้อมูลผู้เช่า — ใช้ค่าเดิมถ้าไม่ได้ส่งมา
  await repo.updateUserInfo(c.userId, {
    firstName: data.firstName?.trim() ?? c.user.firstName,
    lastName: data.lastName?.trim() ?? c.user.lastName,
    email: data.email?.trim() ?? c.user.email,
    phone: data.phone?.trim() ?? c.user.phone ?? undefined,
    lineId: data.lineId?.trim() ?? c.user.lineId ?? undefined,
    address: data.address?.trim() ?? c.user.address ?? undefined,
  })

  // อัปเดตยานพาหนะถ้ามีการส่งมา (replace ทั้งหมด)
  if (Array.isArray(data.vehicles)) {
    await repo.replaceVehicles(c.userId, data.vehicles)
  }

  // ถ้าเปลี่ยนห้อง → คืนห้องเก่า, ตั้งห้องใหม่เป็น OCCUPIED
  if (data.roomId && data.roomId !== c.roomId) {
    const newRoom = await repo.findRoomInProperty(data.roomId, propertyId)
    if (!newRoom) throw new Error("New room not found in this property")
    if (newRoom.status === "OCCUPIED") throw new Error("New room is already occupied")
    await repo.updateRoomStatus(c.roomId, "AVAILABLE")
    await repo.updateRoomStatus(data.roomId, "OCCUPIED")
  }

  // ถ้าสัญญาสิ้นสุด → คืนห้องเป็น AVAILABLE
  if (data.status === "ENDED") {
    await repo.updateRoomStatus(c.roomId, "AVAILABLE")
  }

  const moveOutNoticeDate = data.moveOutNoticeDate
    ? new Date(data.moveOutNoticeDate)
    : undefined

  const updated = await repo.updateContract(contractId, {
    status: data.status,
    startDate,
    endDate,
    roomId: data.roomId,
    moveOutNoticeDate,
  })

  return {
    contractId: updated.id,
    status: updated.status,
    startDate: updated.startDate,
    endDate: updated.endDate,
    roomId: updated.roomId,
  }
}

// สร้างสัญญา ONLINE — มาจาก booking ที่ยืนยันแล้ว
// 1. validate ข้อมูล, ตรวจสอบห้อง, ตรวจสอบว่า booking ยังไม่มีสัญญา
// 2. สร้างที่อยู่จากหลาย field, หรือสร้าง user ใหม่
// 3. สร้างสัญญา → เปลี่ยนสถานะห้องเป็น OCCUPIED → อัปเดต booking เป็น CHECKED_IN
// เรียก: contractRepository หลายฟังก์ชัน
// ส่งกลับ: ข้อมูลสัญญาที่สร้างใหม่
export const createOnlineContract = async (propertyId: string, data: any) => {
  const { startDate, endDate } = validateContractData(data)
  const room = await repo.findRoomInProperty(data.roomId, propertyId)
  if (!room) throw new Error("Room not found in this property")
  if (room.status === "OCCUPIED") throw new Error("Room is already occupied")
  if (data.bookingId) {
    const existing = await repo.checkExistingContract(data.bookingId)
    if (existing) throw new Error("Contract already exists for this booking")
  }
  const address = buildAddress(data)
  const user = await resolveUser({ ...data, address })
  if (Array.isArray(data.vehicles)) await repo.replaceVehicles(user.id, data.vehicles)
  const contract = await repo.createContract({
    userId: user.id,
    roomId: data.roomId,
    bookingId: data.bookingId,
    startDate,
    endDate,
    securityDeposit: data.securityDeposit,
    contractType: "ONLINE",
    pdfUrl: data.pdfUrl,
  })
  await repo.updateRoomStatus(data.roomId, "OCCUPIED")
  // อัปเดตสถานะ booking เป็น CHECKED_IN เมื่อมีสัญญาแล้ว
  if (data.bookingId) await repo.updateBookingStatus(data.bookingId)
  return {
    contractId: contract.id,
    contractType: contract.contractType,
    roomNumber: room.roomNumber,
    roomType: room.roomType.name,
    startDate: contract.startDate,
    endDate: contract.endDate,
    securityDeposit: contract.securityDeposit,
    status: contract.status,
  }
}

// สร้างสัญญา OFFLINE — walk-in ไม่ผ่าน booking
// ขั้นตอนเหมือน createOnlineContract แต่ contractType เป็น OFFLINE
// เรียก: contractRepository หลายฟังก์ชัน
// ส่งกลับ: ข้อมูลสัญญาที่สร้างใหม่ รวม pdfUrl
export const createOfflineContract = async (propertyId: string, data: any) => {
  const { startDate, endDate } = validateContractData(data)
  const room = await repo.findRoomInProperty(data.roomId, propertyId)
  if (!room) throw new Error("Room not found in this property")
  if (room.status === "OCCUPIED") throw new Error("Room is already occupied")
  if (data.bookingId) {
    const existing = await repo.checkExistingContract(data.bookingId)
    if (existing) throw new Error("Contract already exists for this booking")
  }
  const address = buildAddress(data)
  const user = await resolveUser({ ...data, address })
  if (Array.isArray(data.vehicles)) await repo.replaceVehicles(user.id, data.vehicles)
  const contract = await repo.createContract({
    userId: user.id,
    roomId: data.roomId,
    bookingId: data.bookingId,
    startDate,
    endDate,
    securityDeposit: data.securityDeposit,
    contractType: "OFFLINE",
    pdfUrl: data.pdfUrl,
  })
  await repo.updateRoomStatus(data.roomId, "OCCUPIED")
  if (data.bookingId) await repo.updateBookingStatus(data.bookingId)
  return {
    contractId: contract.id,
    contractType: contract.contractType,
    roomNumber: room.roomNumber,
    roomType: room.roomType.name,
    startDate: contract.startDate,
    endDate: contract.endDate,
    securityDeposit: contract.securityDeposit,
    pdfUrl: contract.pdfUrl,
    status: contract.status,
  }
}
