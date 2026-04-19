// profileRouter.ts (mobile) — route สำหรับดูและแก้ไขโปรไฟล์ tenant
// ทุก route ต้องผ่าน authenticate — ใช้โดย tenant ผ่าน mobile app
// รับ request จาก mobile app ส่งต่อไปยัง profileService

import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./profileService"

const router = express.Router()

// GET /api/mobile/profile — ดึงข้อมูลโปรไฟล์ tenant ที่ login อยู่
// เรียก: profileService.getProfile()
// ส่งกลับ: ProfileResponse (ข้อมูลส่วนตัว + ห้องปัจจุบัน + สรุปบิล)
router.get("/profile", authenticate, async (req: any, res) => {
  try {
    const data = await service.getProfile(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// PUT /api/mobile/profile — แก้ไขข้อมูลส่วนตัว tenant
// รับ: { firstName, lastName, phone? } จาก body
// เรียก: profileService.updateProfile()
// ส่งกลับ: UpdateProfileResponse (id, firstName, lastName, phone)
router.put("/profile", authenticate, async (req: any, res) => {
  try {
    const data = await service.updateProfile(req.user.id, req.body)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
