// roomRouter.ts — กำหนด route สำหรับจัดการห้องพัก
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin()
// รับ request จาก web frontend ส่งต่อไปยัง roomService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น ADMIN
import { authorize } from "../../middlewares/authorize"
// authorizePropertyAdmin — ตรวจสอบว่า admin นี้ดูแลที่พักนี้จริง
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
// roomService — business logic ทั้งหมดของห้อง
import * as service from "./roomService"

const router = express.Router()

// GET /api/admin/properties/:propertyId/rooms — ดึงรายการห้องทั้งหมดของที่พัก
// เรียก: roomService.getRooms()
// ส่งกลับ: array ของ room พร้อม status, tenant, availableFromDate
router.get("/properties/:propertyId/rooms", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getRooms(req.params.propertyId))
  } catch (err) {
    res.status(500).json({ error: "Internal server error" })
  }
})

// POST /api/admin/properties/:propertyId/rooms — เพิ่มห้องใหม่
// รับ: roomNumber, roomTypeId, floor จาก body
// เรียก: roomService.createRoom()
// ส่งกลับ: ข้อมูลห้องที่สร้าง status 201
router.post("/properties/:propertyId/rooms", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.status(201).json(await service.createRoom(req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// PUT /api/admin/properties/:propertyId/rooms/:roomId — แก้ไขข้อมูลห้อง
// รับ: roomNumber, roomTypeId, floor, status จาก body
// เรียก: roomService.updateRoom()
// ส่งกลับ: ข้อมูลห้องที่อัปเดต
router.put("/properties/:propertyId/rooms/:roomId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.updateRoom(req.params.roomId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// DELETE /api/admin/properties/:propertyId/rooms/:roomId — ลบห้อง
// ไม่อนุญาตถ้า status เป็น OCCUPIED หรือ PREPARING
// เรียก: roomService.deleteRoom()
// ส่งกลับ: { message: "ลบห้องสำเร็จ" }
router.delete("/properties/:propertyId/rooms/:roomId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    await service.deleteRoom(req.params.roomId)
    res.json({ message: "ลบห้องสำเร็จ" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/admin/properties/:propertyId/rooms/:roomId/meters — ดูประวัติมิเตอร์ของห้อง
// เรียก: roomService.getMeterHistory()
// ส่งกลับ: array ของ MeterReading เรียงจากล่าสุด
router.get("/properties/:propertyId/rooms/:roomId/meters", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getMeterHistory(req.params.roomId, req.params.propertyId))
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

export default router
