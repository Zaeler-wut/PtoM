// tenantRepository.ts — query database สำหรับ tenant module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก tenantService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงผู้เช่าที่มีสัญญา ACTIVE หรือ MOVE_OUT_NOTICE ของที่พัก
// เรียงจากวันที่เริ่มสัญญาล่าสุดก่อน
export const getTenantsByProperty = async (propertyId: string) => {
  return prisma.contract.findMany({
    where: {
      room: { propertyId },
      status: { in: ["ACTIVE", "MOVE_OUT_NOTICE"] },
    },
    include: {
      user: true,
      room: { include: { roomType: true } },
    },
    orderBy: { startDate: "desc" },
  })
}

// ดึงสัญญาเดี่ยวพร้อมข้อมูลผู้เช่าและยานพาหนะ — ใช้แสดงรายละเอียดและตรวจสอบก่อนอัปเดต
export const getTenantDetail = async (contractId: string, propertyId: string) => {
  return prisma.contract.findFirst({
    where: { id: contractId, room: { propertyId } },
    include: {
      user: { include: { vehicles: true } },
      room: { include: { roomType: true } },
    },
  })
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

// อัปเดตข้อมูลส่วนตัว user — ใช้เมื่อ admin แก้ไขข้อมูลผู้เช่า
export const updateUserInfo = async (
  userId: string,
  data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    lineId?: string
  }
) => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone ?? null,
      lineId: data.lineId ?? null,
    },
  })
}
