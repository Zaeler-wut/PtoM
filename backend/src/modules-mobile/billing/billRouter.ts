// billRouter.ts (mobile) — route สำหรับดูบิลและชำระเงิน
// ทุก route ต้องผ่าน authenticate — ใช้โดย tenant ผ่าน mobile app
// รับ request จาก mobile app ส่งต่อไปยัง billService

import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./billService"

const router = express.Router()

// GET /api/mobile/bills — ดึงรายการบิลทั้งหมดของ tenant ที่ login อยู่
// เรียก: billService.getBills()
// ส่งกลับ: BillListResponse (totalUnpaid + bills[])
router.get("/bills", authenticate, async (req: any, res) => {
  try {
    const data = await service.getBills(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/mobile/bills/:billId/detail — ดึงข้อมูลครบสำหรับ generate PDF invoice
// เรียก: billService.getBillDetail()
// ส่งกลับ: object พร้อม property, meter readings, items, issuerName
router.get("/bills/:billId/detail", authenticate, async (req: any, res) => {
  try {
    const data = await service.getBillDetail(req.params.billId, req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// GET /api/mobile/bills/:billId/payment-info — ดึงข้อมูลสำหรับหน้าชำระเงิน
// เรียก: billService.getBillPaymentInfo()
// ส่งกลับ: BillPaymentInfoResponse (ราคา รายละเอียด ช่องทางชำระ)
router.get("/bills/:billId/payment-info", authenticate, async (req: any, res) => {
  try {
    const data = await service.getBillPaymentInfo(req.params.billId, req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// POST /api/mobile/bills/:billId/payments — ส่งหลักฐานชำระเงิน
// รับ: { slipUrl, amount } จาก body
// เรียก: billService.submitPayment()
// ส่งกลับ: SubmitPaymentResponse (201, status = "VERIFYING")
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
