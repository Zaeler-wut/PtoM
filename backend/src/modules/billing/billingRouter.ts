import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./billingService"

const router = express.Router()

function parseMonthYear(query: any): { month: number; year: number } {
  const month = parseInt(query.month)
  const year = parseInt(query.year)
  if (!month || month < 1 || month > 12) throw new Error("Invalid month")
  if (!year || year < 2000) throw new Error("Invalid year")
  return { month, year }
}

// 1. Summary cards + ตาราง
// GET /properties/:propertyId/billing/summary?month=3&year=2026
router.get(
  "/properties/:propertyId/billing/summary",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const { month, year } = parseMonthYear(req.query)
      const data = await service.getBillingSummary(
        req.params.propertyId,
        month,
        year
      )
      res.json(data)
    } catch (err: any) {
      console.error(err)
      res.status(400).json({ error: err.message })
    }
  }
)

// 2. ค่าบริการคงที่ของห้อง
// GET /properties/:propertyId/billing/:contractId/fees

router.get(
  "/properties/:propertyId/billing/:contractId/fees",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.getRoomFees(
        req.params.contractId,
        req.params.propertyId
      )
      res.json(data)
    } catch (err: any) {
      res.status(404).json({ error: err.message })
    }
  }
)

// 3. ใบแจ้งหนี้ (realtime)
// GET /properties/:propertyId/billing/:contractId/invoice?month=3&year=2026

router.get(
  "/properties/:propertyId/billing/:contractId/invoice",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const { month, year } = parseMonthYear(req.query)
      const data = await service.getInvoice(
        req.params.contractId,
        req.params.propertyId,
        month,
        year
      )
      res.json(data)
    } catch (err: any) {
      res.status(404).json({ error: err.message })
    }
  }
)

// 4. แก้ไขมิเตอร์ + รายการเพิ่มเติม
// PUT /properties/:propertyId/billing/:contractId/meter?month=3&year=2026
// body: { waterMeter, electricMeter, additionalItems? }
router.put(
  "/properties/:propertyId/billing/:contractId/meter",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const { month, year } = parseMonthYear(req.query)
      const data = await service.updateMeter(
        req.params.contractId,
        req.params.propertyId,
        month,
        year,
        req.body
      )
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// 5. ส่งบิลห้องเดียว
// POST /properties/:propertyId/billing/:contractId/send?month=3&year=2026
router.post(
  "/properties/:propertyId/billing/:contractId/send",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const { month, year } = parseMonthYear(req.query)
      const data = await service.sendBill(
        req.params.contractId,
        req.params.propertyId,
        month,
        year
      )
      res.status(201).json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// 6. ส่งบิลทั้งหมด
// POST /properties/:propertyId/billing/send-all?month=3&year=2026
router.post(
  "/properties/:propertyId/billing/send-all",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const { month, year } = parseMonthYear(req.query)
      const data = await service.sendAllBills(
        req.params.propertyId,
        month,
        year
      )
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// อัพโหลดสลิปแทนผู้เช่า (admin)
// POST /properties/:propertyId/billing/bills/:billId/payment
router.post(
  "/properties/:propertyId/billing/bills/:billId/payment",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.submitPaymentByAdmin(
        req.params.billId,
        req.params.propertyId,
        req.body
      ))
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// ตรวจสอบการชำระเงิน
// GET /properties/:propertyId/billing/payments?month=3&year=2026&status=VERIFYING
router.get(
  "/properties/:propertyId/billing/payments",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const { month, year } = parseMonthYear(req.query)
      const data = await service.getPayments(
        req.params.propertyId,
        month,
        year,
        req.query.status as string | undefined
      )
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// ดูข้อมูล payment
// GET /properties/:propertyId/billing/payments/:paymentId
router.get(
  "/properties/:propertyId/billing/payments/:paymentId",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.getPaymentDetail(
        req.params.paymentId,
        req.params.propertyId
      )
      res.json(data)
    } catch (err: any) {
      res.status(404).json({ error: err.message })
    }
  }
)

// ยืนยันการชำระเงิน → PAID
// PATCH /properties/:propertyId/billing/payments/:paymentId/confirm
router.patch(
  "/properties/:propertyId/billing/payments/:paymentId/confirm",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.confirmPayment(
        req.params.paymentId,
        req.params.propertyId,
        req.user.email
      )
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// ปฏิเสธการชำระเงิน → กลับเป็น PENDING
// PATCH /properties/:propertyId/billing/payments/:paymentId/reject
router.patch(
  "/properties/:propertyId/billing/payments/:paymentId/reject",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.rejectPayment(
        req.params.paymentId,
        req.params.propertyId
      )
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// GET /properties/:propertyId/billing/available-months
router.get(
  "/properties/:propertyId/billing/available-months",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const rows = await service.getAvailableMonths(req.params.propertyId)
      res.json(rows)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

export default router
