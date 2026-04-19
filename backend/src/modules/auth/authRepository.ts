// authRepository.ts — query database สำหรับ auth module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก authService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

export type CreateUserData = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "USER" | "ADMIN"
}

// ค้นหา user จาก email ใน database — ใช้ตอน login และตรวจสอบ email ซ้ำตอน register
export const findByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

// ค้นหา user จาก id — ใช้ตอน refresh token และ GET /auth/me
export const findById = (id: string) => {
  return prisma.user.findUnique({ where: { id } })
}

// สร้าง user ใหม่ในตาราง User — ถูกเรียกตอน register
export const createUser = (data: CreateUserData) => {
  return prisma.user.create({ data })
}

// อัปเดต lastLogin เป็นเวลาปัจจุบัน — ถูกเรียกหลัง login สำเร็จ
export const updateLastLogin = (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() },
  })
}

// บันทึก refresh token ลงตาราง RefreshToken พร้อมกำหนดวันหมดอายุ 7 วัน
// ถูกเรียกหลัง login และ refresh token สำเร็จ
export const saveRefreshToken = (userId: string, token: string) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  })
}

// ค้นหา refresh token จาก database — ใช้ตรวจสอบว่า token ถูก revoke แล้วหรือยัง
export const findRefreshToken = (token: string) => {
  return prisma.refreshToken.findUnique({ where: { token } })
}

// mark refresh token ว่า revoked = true — ใช้ตอน logout และ token rotation
export const revokeRefreshToken = (token: string) => {
  return prisma.refreshToken.update({
    where: { token },
    data: { revoked: true },
  })
}
