// bookingRouter.ts — กำหนด route สำหรับจัดการการจองห้องพัก
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin()
// รับ request จาก web frontend ส่งต่อไปยัง bookingService แล้วส่ง response กลับ

import express from "express"
// authenticate — ตรวจสอบ JWT token
import { authenticate } from "../../middlewares/authenticate"
// authorize — ตรวจสอบว่า role เป็น ADMIN
import { authorize } from "../../middlewares/authorize"
// authorizePropertyAdmin — ตรวจสอบว่า admin นี้ดูแลที่พักนี้จริง
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
// bookingService — business logic ทั้งหมดของการจอง
import * as service from "./bookingService"

const router = express.Router()

// GET /api/admin/properties/:propertyId/bookings — ดึงรายการจองทั้งหมดของที่พัก
// เรียก: bookingService.getBookings()
// ส่งกลับ: array ของ booking พร้อมสถานะที่คำนวณแล้ว (CHECKED_IN ถ้ามีสัญญา)
router.get(
  "/properties/:propertyId/bookings",
  authenticate, authorize("ADMIN"), authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.getBookings(req.params.propertyId))
    } catch (err) {
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

// GET /api/admin/properties/:propertyId/bookings/:bookingId — ดูรายละเอียดการจอง
// เรียก: bookingService.getBookingDetail()
// ส่งกลับ: ข้อมูลการจองพร้อมรายละเอียดผู้จอง ห้อง และค่าใช้จ่าย
router.get(
  "/properties/:propertyId/bookings/:bookingId",
  authenticate, authorize("ADMIN"), authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.getBookingDetail(req.params.bookingId, req.params.propertyId))
    } catch (err: any) {
      res.status(404).json({ error: err.message })
    }
  }
)

// GET /api/admin/properties/:propertyId/bookings/:bookingId/contract-prefill — ดึงข้อมูลสำหรับสร้างสัญญา
// ตรวจสอบว่ายังไม่มีสัญญาสำหรับ booking นี้ก่อน
// เรียก: bookingService.getBookingForContract()
// ส่งกลับ: ข้อมูลผู้เช่า ห้อง และยานพาหนะสำหรับกรอกสัญญา
router.get(
  "/properties/:propertyId/bookings/:bookingId/contract-prefill",
  authenticate, authorize("ADMIN"), authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.getBookingForContract(req.params.bookingId, req.params.propertyId))
    } catch (err: any) {
      res.status(404).json({ error: err.message })
    }
  }
)

// PATCH /api/admin/properties/:propertyId/bookings/:bookingId/confirm — ยืนยัน booking
// auto assign ห้องถ้ายังไม่มีห้อง แล้วเปลี่ยนสถานะเป็น CONFIRMED
// เรียก: bookingService.confirmBooking()
// ส่งกลับ: { message: "Booking confirmed" }
router.patch(
  "/properties/:propertyId/bookings/:bookingId/confirm",
  authenticate, authorize("ADMIN"), authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.confirmBooking(req.params.bookingId, req.params.propertyId))
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// PATCH /api/admin/properties/:propertyId/bookings/:bookingId/cancel — ยกเลิก booking
// ไม่อนุญาตถ้ามีสัญญาแล้ว หรือ status เป็น CHECKED_IN
// เรียก: bookingService.cancelBooking()
// ส่งกลับ: { message: "Booking cancelled" }
router.patch(
  "/properties/:propertyId/bookings/:bookingId/cancel",
  authenticate, authorize("ADMIN"), authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.cancelBooking(req.params.bookingId, req.params.propertyId))
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

export default router
