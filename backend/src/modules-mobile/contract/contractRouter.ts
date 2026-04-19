// contractRouter.ts (mobile) — route สำหรับดูสัญญาเช่าของ tenant
// ทุก route ต้องผ่าน authenticate — ใช้โดย tenant ผ่าน mobile app
// รับ request จาก mobile app ส่งต่อไปยัง contractService

import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./contractService"

const router = express.Router()

// GET /api/mobile/contracts — ดึงสัญญาทั้งหมดของ tenant ที่ login อยู่
// เรียก: contractService.getMyContracts()
// ส่งกลับ: MyContractItem[] เรียงล่าสุดก่อน
router.get("/contracts", authenticate, async (req: any, res) => {
  try {
    const data = await service.getMyContracts(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
