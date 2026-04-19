// moveOutRouter.ts — กำหนด route สำหรับจัดการการแจ้งย้ายออก
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin()
// รับ request จาก web frontend ส่งต่อไปยัง moveOutService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น ADMIN
import { authorize } from "../../middlewares/authorize"
// authorizePropertyAdmin — ตรวจสอบว่า admin นี้ดูแลที่พักนี้จริง
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
// moveOutService — business logic ทั้งหมดของการแจ้งย้ายออก
import * as service from "./moveOutService"

const router = express.Router()

// GET /api/admin/properties/:propertyId/move-out?year=2026&status=CONFIRMED — รายการแจ้งย้ายออก
// แสดงทั้งที่รอดำเนินการ (pending) และที่ออกบิลแล้ว (completed)
// เรียก: moveOutService.getMoveOutList()
// ส่งกลับ: { pending, completed }
router.get(
  "/properties/:propertyId/move-out",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined
      const status = req.query.status as string | undefined
      const data = await service.getMoveOutList(req.params.propertyId, { year, status })
      res.json(data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

// POST /api/admin/properties/:propertyId/move-out/:contractId/preview — preview บิลย้ายออก (realtime)
// คำนวณยอดก่อนสร้างบิลจริง ไม่บันทึกข้อมูล
// รับ: moveOutDate, billingStartDay/EndDay, waterStart/End, electricStart/End, damageItems?, additionalItems?
// เรียก: moveOutService.getMoveOutPreview()
// ส่งกลับ: ข้อมูลผู้เช่า, บิลสุดท้าย, ค่าเสียหาย, สรุปเงินคืน
router.post(
  "/properties/:propertyId/move-out/:contractId/preview",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.getMoveOutPreview(
        req.params.contractId,
        req.params.propertyId,
        req.body
      )
      res.json(data)
    } catch (err: any) {
      console.error(err)
      res.status(400).json({ error: err.message })
    }
  }
)

// POST /api/admin/properties/:propertyId/move-out/:contractId/bill — สร้างบิลย้ายออก
// หลังสร้างแล้ว → contract เปลี่ยนเป็น ENDED, ห้องเปลี่ยนเป็น PREPARING
// รับ: moveOutDate, billingStartDay/EndDay, waterStart/End, electricStart/End, damageItems?, additionalItems?
// เรียก: moveOutService.createMoveOutBill()
// ส่งกลับ: moveOutBillId, refundAmount, totalCharge, status (status 201)
router.post(
  "/properties/:propertyId/move-out/:contractId/bill",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.createMoveOutBill(
        req.params.contractId,
        req.params.propertyId,
        req.body
      )
      res.status(201).json(data)
    } catch (err: any) {
      console.error(err)
      res.status(400).json({ error: err.message })
    }
  }
)

// GET /api/admin/properties/:propertyId/move-out/bills/:moveOutBillId — รายละเอียดบิลย้ายออก
// เรียก: moveOutService.getMoveOutBillDetail()
// ส่งกลับ: ข้อมูล property, ผู้เช่า, มิเตอร์, บิลสุดท้าย, ค่าเสียหาย, สรุปเงินคืน
router.get(
  "/properties/:propertyId/move-out/bills/:moveOutBillId",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.getMoveOutBillDetail(
        req.params.moveOutBillId,
        req.params.propertyId
      )
      res.json(data)
    } catch (err: any) {
      console.error(err)
      res.status(404).json({ error: err.message })
    }
  }
)

export default router
