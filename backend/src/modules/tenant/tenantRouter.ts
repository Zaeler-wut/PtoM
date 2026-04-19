// tenantRouter.ts — กำหนด route สำหรับจัดการข้อมูลผู้เช่า
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin()
// รับ request จาก web frontend ส่งต่อไปยัง tenantService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น ADMIN
import { authorize } from "../../middlewares/authorize"
// authorizePropertyAdmin — ตรวจสอบว่า admin นี้ดูแลที่พักนี้จริง
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
// tenantService — business logic ทั้งหมดของผู้เช่า
import * as service from "./tenantService"

const router = express.Router()

// GET /api/admin/properties/:propertyId/tenants — ดึงรายชื่อผู้เช่าที่ active ทั้งหมด
// เรียก: tenantService.getTenants()
// ส่งกลับ: array ของผู้เช่าพร้อม contractId, ชื่อ, เบอร์โทร, ห้อง, สถานะสัญญา
router.get("/properties/:propertyId/tenants", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getTenants(req.params.propertyId))
  } catch (err) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// GET /api/admin/properties/:propertyId/tenants/:contractId — ดูรายละเอียดผู้เช่า
// เรียก: tenantService.getTenantDetail()
// ส่งกลับ: ข้อมูล user, สัญญา, และยานพาหนะ
router.get("/properties/:propertyId/tenants/:contractId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getTenantDetail(req.params.contractId, req.params.propertyId))
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// PATCH /api/admin/properties/:propertyId/tenants/:contractId — แก้ไขข้อมูลส่วนตัวผู้เช่า
// รับ: firstName, lastName, email, phone, lineId, vehicles จาก body
// เรียก: tenantService.updateTenantPersonalInfo()
// ส่งกลับ: { success: true }
router.patch("/properties/:propertyId/tenants/:contractId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.updateTenantPersonalInfo(req.params.contractId, req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
