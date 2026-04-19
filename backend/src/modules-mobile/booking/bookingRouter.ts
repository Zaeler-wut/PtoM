// bookingRouter.ts (mobile) — route สำหรับจองห้องพักและดูรายการจอง
// ทุก route ต้องผ่าน authenticate — ใช้โดย tenant ผ่าน mobile app
// รับ request จาก mobile app ส่งต่อไปยัง bookingService

import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./bookingService"

const router = express.Router()

// GET /api/mobile/properties/:propertyId/room-types/:roomTypeId/booking-info
// ดึงข้อมูลก่อนจอง — ราคา ช่องทางชำระ และช่วงวันที่เข้าอยู่ได้
// เรียก: bookingService.getBookingInfo()
// ส่งกลับ: BookingInfoResponse
router.get(
  "/properties/:propertyId/room-types/:roomTypeId/booking-info",
  authenticate,
  async (req: any, res) => {
    try {
      const data = await service.getBookingInfo(
        req.params.propertyId,
        req.params.roomTypeId
      )
      res.json(data)
    } catch (err: any) {
      res.status(404).json({ error: err.message })
    }
  }
)

// POST /api/mobile/properties/:propertyId/room-types/:roomTypeId/bookings
// สร้างการจองใหม่ — validate วันที่เข้าอยู่และบันทึก booking พร้อมสลิป
// รับ: { moveInDate, slipUrl } จาก body
// เรียก: bookingService.createBooking()
// ส่งกลับ: CreateBookingResponse (201)
router.post(
  "/properties/:propertyId/room-types/:roomTypeId/bookings",
  authenticate,
  async (req: any, res) => {
    try {
      const data = await service.createBooking(
        req.params.propertyId,
        req.params.roomTypeId,
        req.user.id,
        req.body
      )
      res.status(201).json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// DELETE /api/mobile/bookings/:bookingId — ยกเลิกการจอง
// ตรวจสิทธิ์ว่าเป็น booking ของ user นี้ และยกเลิกได้เฉพาะ PENDING/CONFIRMED
// เรียก: bookingService.cancelBooking()
// ส่งกลับ: CancelBookingResponse
router.delete(
  "/bookings/:bookingId",
  authenticate,
  async (req: any, res) => {
    try {
      const data = await service.cancelBooking(
        req.params.bookingId,
        req.user.id
      )
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

// GET /api/mobile/bookings — ดึงรายการจองทั้งหมดของ user ที่ login อยู่
// เรียก: bookingService.getMyBookings()
// ส่งกลับ: MyBookingItem[]
router.get("/bookings", authenticate, async (req: any, res) => {
  try {
    const data = await service.getMyBookings(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
