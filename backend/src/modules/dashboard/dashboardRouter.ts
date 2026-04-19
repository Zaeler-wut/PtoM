// dashboardRouter.ts — กำหนด route สำหรับหน้า Dashboard ของ admin
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin()
// รับ request จาก web frontend ส่งต่อไปยัง dashboardService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น ADMIN
import { authorize } from "../../middlewares/authorize"
// authorizePropertyAdmin — ตรวจสอบว่า admin นี้ดูแลที่พักนี้จริง
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
// dashboardService — business logic ทั้งหมดของ dashboard
import * as service from "./dashboardService"

const router = express.Router()

// GET /api/admin/properties/:propertyId/dashboard — ข้อมูล summary ของที่พัก
// เรียก: dashboardService.getDashboard()
// ส่งกลับ: จำนวนห้องแต่ละสถานะ, bookings รอยืนยัน, บิลรอตรวจ, รายได้เดือนนี้
router.get(
  "/properties/:propertyId/dashboard",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.getDashboard(req.params.propertyId))
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

// GET /api/admin/properties/:propertyId/revenue?months=6 — รายได้ย้อนหลัง N เดือน
// รับ: months (query) — จำนวนเดือนย้อนหลัง (1-24, default 6)
// เรียก: dashboardService.getRevenue()
// ส่งกลับ: array ของรายได้รายเดือน พร้อม label ภาษาไทย และ totalRevenue
router.get(
  "/properties/:propertyId/revenue",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6
      const data = await service.getRevenue(req.params.propertyId, months)
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

export default router
