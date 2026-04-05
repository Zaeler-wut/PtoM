import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./profileService"

const router = express.Router()

// 1. ดึงข้อมูลโปรไฟล์
// GET /profile
router.get("/profile", authenticate, async (req: any, res) => {
  try {
    const data = await service.getProfile(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// 2. แก้ไขข้อมูลส่วนตัว
// PUT /profile
// body: { firstName, lastName, phone? }
router.put("/profile", authenticate, async (req: any, res) => {
  try {
    const data = await service.updateProfile(req.user.id, req.body)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
