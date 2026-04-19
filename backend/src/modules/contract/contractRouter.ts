// contractRouter.ts — กำหนด route สำหรับจัดการสัญญาเช่า
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin()
// รับ request จาก web frontend ส่งต่อไปยัง contractService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น ADMIN
import { authorize } from "../../middlewares/authorize"
// authorizePropertyAdmin — ตรวจสอบว่า admin นี้ดูแลที่พักนี้จริง
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
// contractService — business logic ทั้งหมดของสัญญาเช่า
import * as service from "./contractService"

const router = express.Router()

// GET /api/admin/properties/:propertyId/contracts — ดึงรายการสัญญาทั้งหมดของที่พัก
// เรียก: contractService.getContracts()
// ส่งกลับ: array ของสัญญาพร้อมข้อมูลผู้เช่า ห้อง สถานะ และระยะเวลา
router.get("/properties/:propertyId/contracts", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getContracts(req.params.propertyId))
  } catch (err) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/admin/properties/:propertyId/contracts/:contractId — ดูรายละเอียดสัญญา
// เรียก: contractService.getContractDetail()
// ส่งกลับ: ข้อมูลสัญญาครบถ้วน รวมผู้เช่า ห้อง ยานพาหนะ และข้อมูลการเงิน
router.get("/properties/:propertyId/contracts/:contractId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getContractDetail(req.params.contractId, req.params.propertyId))
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// PATCH /api/admin/properties/:propertyId/contracts/:contractId/pdf — อัปเดต URL ไฟล์สัญญา PDF
// รับ: pdfUrl จาก body
// เรียก: contractService.uploadContractPdf()
// ส่งกลับ: { message: "Contract PDF uploaded" }
router.patch("/properties/:propertyId/contracts/:contractId/pdf", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    await service.uploadContractPdf(req.params.contractId, req.params.propertyId, req.body.pdfUrl)
    res.json({ message: "Contract PDF uploaded" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/admin/properties/:propertyId/contracts/:contractId — แก้ไขข้อมูลสัญญา
// รับ: status, moveOutNoticeDate, ข้อมูลผู้เช่า, roomId, วันที่, ยานพาหนะ
// เรียก: contractService.updateContract()
// ส่งกลับ: ข้อมูลสัญญาที่อัปเดต
router.put("/properties/:propertyId/contracts/:contractId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.updateContract(req.params.contractId, req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/admin/properties/:propertyId/contracts/online — สร้างสัญญาแบบ ONLINE (มาจาก booking)
// รับ: ข้อมูลผู้เช่า, roomId, วันที่, securityDeposit, bookingId, vehicles
// เรียก: contractService.createOnlineContract()
// ส่งกลับ: ข้อมูลสัญญาที่สร้าง status 201
router.post("/properties/:propertyId/contracts/online", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.status(201).json(await service.createOnlineContract(req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/admin/properties/:propertyId/contracts/offline — สร้างสัญญาแบบ OFFLINE (walk-in)
// รับ: ข้อมูลผู้เช่า, roomId, วันที่, securityDeposit, vehicles
// เรียก: contractService.createOfflineContract()
// ส่งกลับ: ข้อมูลสัญญาที่สร้าง status 201
router.post("/properties/:propertyId/contracts/offline", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.status(201).json(await service.createOfflineContract(req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
