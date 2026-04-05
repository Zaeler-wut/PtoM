import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./billService"

const router = express.Router()

// 1. ดึงรายการบิลทั้งหมด (แท็บ บิล)
// GET /bills
router.get("/bills", authenticate, async (req: any, res) => {
  try {
    const data = await service.getBills(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// 2. ดึงข้อมูลสำหรับหน้าชำระเงิน
// GET /bills/:billId/payment-info
router.get("/bills/:billId/payment-info", authenticate, async (req: any, res) => {
  try {
    const data = await service.getBillPaymentInfo(req.params.billId, req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// 3. ชำระเงิน + อัพโหลดสลิป
// POST /bills/:billId/payments
// body: { slipUrl, amount }

router.post("/bills/:billId/payments", authenticate, async (req: any, res) => {
  try {
    const data = await service.submitPayment(
      req.params.billId,
      req.user.id,
      req.body
    )
    res.status(201).json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
