// superadminRouter.ts — กำหนด route สำหรับ SUPERADMIN จัดการระบบทั้งหมด
// ทุก route ต้องผ่าน authenticate → authorize("SUPERADMIN")
// รับ request จาก web frontend ส่งต่อไปยัง superadminService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate, AuthenticatedRequest } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น SUPERADMIN
import { authorize } from "../../middlewares/authorize"
// superadminService — business logic ทั้งหมดของ superadmin
import * as service from "./superadminService"
import { Request } from "express"

// helper ดึง userId ของ SUPERADMIN ที่ส่ง request มา — ใช้ตรวจสอบ password ก่อนลบ
const getRequesterId = (req: Request) => (req as AuthenticatedRequest).user.id

const router = express.Router()

// guard middleware ที่ใช้ร่วมกันทุก route — ต้อง login และเป็น SUPERADMIN
const guard = [authenticate, authorize("SUPERADMIN")]

// GET /api/superadmin/dashboard — สถิติภาพรวมทั้งระบบ
// เรียก: superadminService.getDashboard()
// ส่งกลับ: totalAdmins, activeAdmins, totalUsers, totalProperties, totalRooms, newThisMonth
router.get("/dashboard", ...guard, async (_req, res) => {
  try {
    res.json(await service.getDashboard())
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/superadmin/admins — ดึงรายชื่อ admin ทั้งหมด
// เรียก: superadminService.getAdmins()
// ส่งกลับ: array ของ admin พร้อม propertyLimit และที่พักที่ดูแล
router.get("/admins", ...guard, async (_req, res) => {
  try {
    res.json(await service.getAdmins())
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/superadmin/admins — สร้าง admin ใหม่
// รับ: firstName, lastName, email, password, propertyLimit
// เรียก: superadminService.createAdmin()
// ส่งกลับ: ข้อมูล admin ที่สร้าง status 201
router.post("/admins", ...guard, async (req, res) => {
  try {
    const data = await service.createAdmin(req.body)
    res.status(201).json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH /api/superadmin/admins/:id/limit — แก้ไขจำนวนที่พักสูงสุดของ admin
// รับ: propertyLimit จาก body
// เรียก: superadminService.updateLimit()
router.patch("/admins/:id/limit", ...guard, async (req, res) => {
  try {
    const data = await service.updateLimit(req.params.id as string, parseInt(req.body.propertyLimit))
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH /api/superadmin/admins/:id/status — เปิด/ปิดการใช้งาน admin
// รับ: isActive (boolean) จาก body
// เรียก: superadminService.setStatus()
router.patch("/admins/:id/status", ...guard, async (req, res) => {
  try {
    const data = await service.setStatus(req.params.id as string, req.body.isActive)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/superadmin/admins/:id/reset-password — reset password ของ admin
// รับ: password (new password) จาก body
// เรียก: superadminService.resetPassword()
// ส่งกลับ: { message: "Password reset successfully" }
router.post("/admins/:id/reset-password", ...guard, async (req, res) => {
  try {
    await service.resetPassword(req.params.id as string, req.body.password)
    res.json({ message: "Password reset successfully" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/superadmin/admins/:id — ลบ admin account พร้อมข้อมูลทั้งหมด
// ต้องยืนยัน password ของ SUPERADMIN ผู้ส่ง request ก่อน
// เรียก: superadminService.deleteAdmin()
// ส่งกลับ: { message: "Deleted successfully" }
router.delete("/admins/:id", ...guard, async (req, res) => {
  try {
    await service.deleteAdmin(req.params.id as string, getRequesterId(req), req.body.password)
    res.json({ message: "Deleted successfully" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/superadmin/admins/:id/impersonate — เข้าใช้งานในฐานะ admin คนนั้น
// คืน accessToken ของ admin เพื่อให้ SUPERADMIN เข้าดูระบบแทน
// เรียก: superadminService.impersonate()
// ส่งกลับ: { accessToken, userId, role }
router.post("/admins/:id/impersonate", ...guard, async (req, res) => {
  try {
    const data = await service.impersonate(req.params.id as string)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/superadmin/properties — ดูที่พักทั้งหมดในระบบ
// เรียก: superadminService.getProperties()
// ส่งกลับ: array ของที่พักพร้อม admin และจำนวนห้อง
router.get("/properties", ...guard, async (_req, res) => {
  try {
    res.json(await service.getProperties())
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/superadmin/users/search?q=keyword — ค้นหา user (ฝ่าย Support)
// รับ: q (query string) — ค้นหาจาก email, ชื่อ, นามสกุล
// เรียก: superadminService.searchUsers()
// ส่งกลับ: array ของ user ไม่เกิน 30 รายการ
router.get("/users/search", ...guard, async (req, res) => {
  try {
    const data = await service.searchUsers(req.query.q as string)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// PATCH /api/superadmin/users/:id/status — เปิด/ปิดการใช้งาน user
// เรียก: superadminService.setStatus()
router.patch("/users/:id/status", ...guard, async (req, res) => {
  try {
    const data = await service.setStatus(req.params.id as string, req.body.isActive)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/superadmin/users/:id/reset-password — reset password ของ user
// รับ: password จาก body
// เรียก: superadminService.resetPassword()
router.post("/users/:id/reset-password", ...guard, async (req, res) => {
  try {
    await service.resetPassword(req.params.id as string, req.body.password)
    res.json({ message: "Password reset successfully" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/superadmin/users/:id — ลบ user account พร้อมข้อมูลทั้งหมด
// ต้องยืนยัน password ของ SUPERADMIN ผู้ส่ง request ก่อน
// เรียก: superadminService.deleteUserAccount()
router.delete("/users/:id", ...guard, async (req, res) => {
  try {
    await service.deleteUserAccount(req.params.id as string, getRequesterId(req), req.body.password)
    res.json({ message: "Deleted successfully" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
