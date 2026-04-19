// superadminRepository.ts — query database สำหรับ superadmin module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก superadminService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึงสถิติภาพรวมทั้งระบบ — นับด้วย Promise.all เพื่อประสิทธิภาพ
export const getDashboardStats = async () => {
  const [totalAdmins, activeAdmins, totalUsers, totalProperties, totalRooms] =
    await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "ADMIN", isActive: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.property.count(),
      prisma.room.count(),
    ])

  // นับ admin ที่สมัครในเดือนปัจจุบัน (ตั้งแต่วันที่ 1 ของเดือน)
  const newThisMonth = await prisma.user.count({
    where: {
      role: "ADMIN",
      createdAt: { gte: new Date(new Date().setDate(1)) },
    },
  })

  return { totalAdmins, activeAdmins, totalUsers, totalProperties, totalRooms, newThisMonth }
}

// ดึง admin ทั้งหมด พร้อม propertyLimit และที่พักที่ดูแลอยู่
export const getAllAdmins = async () => {
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      adminLimit: { select: { propertyLimit: true } },
      managedProperties: {
        select: { property: { select: { id: true, name: true } } },
      },
    },
  })
}

// สร้าง admin ใหม่พร้อม adminLimit — ใช้ nested create
export const createAdmin = async (data: {
  firstName: string
  lastName: string
  email: string
  password: string
  propertyLimit: number
}) => {
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: "ADMIN",
      adminLimit: {
        create: { propertyLimit: data.propertyLimit },
      },
    },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, isActive: true, createdAt: true,
      adminLimit: { select: { propertyLimit: true } },
    },
  })
}

// แก้ไข propertyLimit ของ admin — upsert เผื่อกรณียังไม่มี adminLimit record
export const updateAdminLimit = async (userId: string, propertyLimit: number) => {
  return prisma.adminLimit.upsert({
    where: { userId },
    update: { propertyLimit },
    create: { userId, propertyLimit },
  })
}

// เปิด/ปิดการใช้งาน user — ใช้ได้ทั้ง admin และ user ทั่วไป
export const setUserStatus = async (userId: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, isActive: true },
  })
}

// อัปเดต password ที่ hash แล้ว — เรียกหลัง superadminService hash เสร็จ
export const resetPassword = async (userId: string, hashedPassword: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
}

// ดึง user ด้วย id — ใช้ตรวจสอบว่ามีอยู่ก่อนดำเนินการ (ไม่รวม password)
export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true, email: true },
  })
}

// ดึง user พร้อม password hash — ใช้ตรวจสอบ password ของ SUPERADMIN ก่อนลบ
export const findUserPasswordById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, password: true },
  })
}

// ลบ user และข้อมูลที่เกี่ยวข้องทั้งหมดใน transaction เดียว
// ลบตามลำดับ FK: payment → billItem → bill → moveOutBillItem → moveOutBill →
//               contract → booking → vehicle → refreshToken → adminLimit → propertyAdmin → user
export const deleteUser = async (id: string) => {
  return prisma.$transaction(async (tx) => {
    const bills = await tx.bill.findMany({ where: { userId: id }, select: { id: true } })
    const billIds = bills.map(b => b.id)

    const moveOutBills = await tx.moveOutBill.findMany({ where: { userId: id }, select: { id: true } })
    const moveOutBillIds = moveOutBills.map(b => b.id)

    await tx.payment.deleteMany({ where: { userId: id } })
    await tx.billItem.deleteMany({ where: { billId: { in: billIds } } })
    await tx.bill.deleteMany({ where: { userId: id } })
    await tx.moveOutBillItem.deleteMany({ where: { moveOutBillId: { in: moveOutBillIds } } })
    await tx.moveOutBill.deleteMany({ where: { userId: id } })
    await tx.contract.deleteMany({ where: { userId: id } })
    await tx.booking.deleteMany({ where: { userId: id } })
    await tx.vehicle.deleteMany({ where: { userId: id } })
    await tx.refreshToken.deleteMany({ where: { userId: id } })
    await tx.adminLimit.deleteMany({ where: { userId: id } })
    await tx.propertyAdmin.deleteMany({ where: { userId: id } })
    await tx.user.delete({ where: { id } })
  })
}

// ดึงที่พักทั้งหมด พร้อมจำนวนห้องและ admin ที่ดูแล
export const getAllProperties = async () => {
  return prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      address: true,
      createdAt: true,
      rooms: { select: { id: true } },
      admins: {
        select: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  })
}

// ค้นหา user (role=USER) จาก email, ชื่อ หรือนามสกุล — case insensitive, จำกัด 30 รายการ
export const searchUsers = async (q: string) => {
  return prisma.user.findMany({
    where: {
      role: "USER",
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, isActive: true, createdAt: true, lastLogin: true,
    },
    take: 30,
  })
}
