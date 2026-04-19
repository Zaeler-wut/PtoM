// billingRouter.ts — กำหนด route สำหรับจัดการบิลและการชำระเงิน
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin()
// รับ request จาก web frontend ส่งต่อไปยัง billingService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น ADMIN
import { authorize } from "../../middlewares/authorize"
// authorizePropertyAdmin — ตรวจสอบว่า admin นี้ดูแลที่พักนี้จริง
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
// billingService — business logic ทั้งหมดของการออกบิลและชำระเงิน
import * as service from "./billingService"

const router = express.Router()

// แปลง query string month/year เป็นตัวเลข และ validate ค่า
function parseMonthYear(query: any): { month: number; year: number } {
  const month = parseInt(query.month)
  const year = parseInt(query.year)
  if (!month || month < 1 || month > 12) throw new Error("Invalid month")
  if (!year || year < 2000) throw new Error("Invalid year")
  return { month, year }
}

// GET /api/admin/properties/:propertyId/billing/summary?month=3&year=2026 — ภาพรวมบิลเดือน
// เรียก: billingService.getBillingSummary()
// ส่งกลับ: summary cards (incomplete/sent/meterRecorded) และ array ของบิลทุกห้อง
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

// GET /api/admin/properties/:propertyId/billing/:contractId/fees — ดึงค่าบริการคงที่ของห้อง
// เรียก: billingService.getRoomFees()
// ส่งกลับ: roomNumber, fees array, total
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

// GET /api/admin/properties/:propertyId/billing/:contractId/invoice?month=3&year=2026 — ใบแจ้งหนี้ realtime
// คำนวณจากมิเตอร์ปัจจุบันโดยไม่ต้องรอส่งบิล
// เรียก: billingService.getInvoice()
// ส่งกลับ: ข้อมูล property, ผู้เช่า, รายการค่าใช้จ่าย, ยอดรวม
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

// PUT /api/admin/properties/:propertyId/billing/:contractId/meter?month=3&year=2026 — บันทึก/แก้ไขมิเตอร์
// รับ: waterMeter, electricMeter, waterPrev?, electricPrev?, additionalItems?
// เรียก: billingService.updateMeter()
// ส่งกลับ: { message: "Meter updated" }
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

// POST /api/admin/properties/:propertyId/billing/:contractId/send?month=3&year=2026 — ส่งบิลห้องเดียว
// สร้างหรืออัปเดตบิลเป็น PENDING เพื่อรอผู้เช่าชำระ
// เรียก: billingService.sendBill()
// ส่งกลับ: billId, total, status status 201
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

// POST /api/admin/properties/:propertyId/billing/send-all?month=3&year=2026 — ส่งบิลทุกห้องพร้อมกัน
// เรียก: billingService.sendAllBills()
// ส่งกลับ: total, success, failed count
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

// POST /api/admin/properties/:propertyId/billing/bills/:billId/payment — admin อัปโหลดสลิปแทนผู้เช่า
// รับ: slipUrl จาก body
// เรียก: billingService.submitPaymentByAdmin()
// ส่งกลับ: { success: true }
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

// GET /api/admin/properties/:propertyId/billing/payments?month=3&year=2026&status=VERIFYING — รายการชำระเงิน
// เรียก: billingService.getPayments()
// ส่งกลับ: array ของ payment rows (รวม PENDING bills ที่ยังไม่มีสลิป)
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

// GET /api/admin/properties/:propertyId/billing/payments/:paymentId — ดูรายละเอียดการชำระเงิน
// เรียก: billingService.getPaymentDetail()
// ส่งกลับ: ข้อมูล payment พร้อม slipUrl, สถานะ
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

// PATCH /api/admin/properties/:propertyId/billing/payments/:paymentId/confirm — ยืนยันการชำระเงิน
// เปลี่ยนสถานะ payment เป็น CONFIRMED และบิลเป็น PAID
// เรียก: billingService.confirmPayment()
// ส่งกลับ: { message: "Payment confirmed" }
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

// PATCH /api/admin/properties/:propertyId/billing/payments/:paymentId/reject — ปฏิเสธการชำระเงิน
// เปลี่ยนสถานะ payment เป็น REJECTED และบิลกลับเป็น PENDING
// เรียก: billingService.rejectPayment()
// ส่งกลับ: { message: "Payment rejected" }
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

// GET /api/admin/properties/:propertyId/billing/available-months — เดือนที่มีบิล
// เรียก: billingService.getAvailableMonths()
// ส่งกลับ: array ของ { month, year } ที่มีบิลในที่พักนี้
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
