// superadminService.ts — business logic สำหรับ superadmin module
// รับข้อมูลจาก superadminRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ superadminRepository สำหรับ query database

import * as repo from "./superadminRepository"
// hashPassword — สำหรับ hash password ใหม่, comparePassword — ตรวจสอบ password เดิม
import { hashPassword, comparePassword } from "../../utils/password"
// generateAccessToken — สร้าง token สำหรับ impersonate
import { generateAccessToken } from "../../utils/jwt"

// ดึงสถิติภาพรวมทั้งระบบ — delegate ไปยัง repository โดยตรง
// เรียก: superadminRepository.getDashboardStats()
export const getDashboard = () => repo.getDashboardStats()

// ดึงรายชื่อ admin ทั้งหมด — delegate ไปยัง repository โดยตรง
// เรียก: superadminRepository.getAllAdmins()
export const getAdmins = () => repo.getAllAdmins()

// สร้าง admin ใหม่ — validate ข้อมูลก่อน hash password แล้วสร้าง
// เรียก: superadminRepository.createAdmin()
// ส่งกลับ: ข้อมูล admin ที่สร้างใหม่
export const createAdmin = async (data: {
  firstName: string
  lastName: string
  email: string
  password: string
  propertyLimit: number
}) => {
  if (!data.firstName?.trim()) throw new Error("firstName required")
  if (!data.lastName?.trim()) throw new Error("lastName required")
  if (!data.email?.trim()) throw new Error("email required")
  if (!data.password || data.password.length < 6)
    throw new Error("password must be at least 6 characters")

  const hashed = await hashPassword(data.password)
  return repo.createAdmin({ ...data, password: hashed })
}

// แก้ไขจำนวนที่พักสูงสุดของ admin — validate ค่าก่อน
// เรียก: superadminRepository.updateAdminLimit()
export const updateLimit = (userId: string, propertyLimit: number) => {
  if (!propertyLimit || propertyLimit < 1) throw new Error("propertyLimit must be >= 1")
  return repo.updateAdminLimit(userId, propertyLimit)
}

// เปิด/ปิดการใช้งาน user หรือ admin — ตรวจสอบว่า user มีอยู่ก่อน
// เรียก: superadminRepository.findUserById(), setUserStatus()
export const setStatus = async (userId: string, isActive: boolean) => {
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  return repo.setUserStatus(userId, isActive)
}

// Reset password ของ user — validate ความยาวก่อน hash แล้วบันทึก
// เรียก: superadminRepository.findUserById(), resetPassword()
export const resetPassword = async (userId: string, newPassword: string) => {
  if (!newPassword || newPassword.length < 6)
    throw new Error("password must be at least 6 characters")
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  const hashed = await hashPassword(newPassword)
  return repo.resetPassword(userId, hashed)
}

// ตรวจสอบ password ของ SUPERADMIN ที่ส่ง request มา — ใช้ก่อนลบ account
// เรียก: superadminRepository.findUserPasswordById()
const verifyRequesterPassword = async (requesterId: string, password: string) => {
  const requester = await repo.findUserPasswordById(requesterId)
  if (!requester) throw new Error("Requester not found")
  const valid = await comparePassword(password, requester.password)
  if (!valid) throw new Error("รหัสผ่านไม่ถูกต้อง")
}

// ลบ admin account พร้อมข้อมูลทั้งหมด — ต้องยืนยัน password ของ SUPERADMIN ก่อน
// เรียก: superadminRepository.deleteUser() ที่ทำ cascade delete ผ่าน transaction
export const deleteAdmin = async (userId: string, requesterId: string, password: string) => {
  await verifyRequesterPassword(requesterId, password)
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  return repo.deleteUser(userId)
}

// ลบ user account พร้อมข้อมูลทั้งหมด — ต้องยืนยัน password ของ SUPERADMIN ก่อน
// เรียก: superadminRepository.deleteUser() ที่ทำ cascade delete ผ่าน transaction
export const deleteUserAccount = async (userId: string, requesterId: string, password: string) => {
  await verifyRequesterPassword(requesterId, password)
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  return repo.deleteUser(userId)
}

// Impersonate — สร้าง accessToken ของ user นั้นให้ SUPERADMIN ใช้เข้าระบบแทน
// token มีอายุ 1h ตาม generateAccessToken
// เรียก: superadminRepository.findUserById(), utils/jwt.generateAccessToken()
// ส่งกลับ: { accessToken, userId, role }
export const impersonate = async (userId: string) => {
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  if (!user.isActive) throw new Error("User is inactive")
  const token = generateAccessToken({ id: user.id, role: user.role, email: user.email, firstName: '', lastName: '' })
  return { accessToken: token, userId: user.id, role: user.role }
}

// ดูที่พักทั้งหมดในระบบ — แสดง admin ที่ดูแลและจำนวนห้อง
// เรียก: superadminRepository.getAllProperties()
// ส่งกลับ: array ของที่พักพร้อม admin คนแรก (ถ้ามี) และ totalRooms
export const getProperties = async () => {
  const rows = await repo.getAllProperties()
  return rows.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    createdAt: p.createdAt,
    totalRooms: p.rooms.length,
    admin: p.admins[0]?.user ?? null,
  }))
}

// ค้นหา user จาก email, ชื่อ หรือนามสกุล — สำหรับฝ่าย Support
// เรียก: superadminRepository.searchUsers()
// ส่งกลับ: array ของ user ไม่เกิน 30 รายการ
export const searchUsers = (q: string) => {
  if (!q?.trim()) throw new Error("query required")
  return repo.searchUsers(q.trim())
}
