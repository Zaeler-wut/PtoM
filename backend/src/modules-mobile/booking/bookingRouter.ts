import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./bookingService"

const router = express.Router()

// 1. ดึงข้อมูลสำหรับหน้าจอง (ไม่ต้อง login)
// GET /properties/:propertyId/room-types/:roomTypeId/booking-info

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

// 2. สร้าง booking + อัพโหลดสลิป (ต้อง login)
// POST /properties/:propertyId/room-types/:roomTypeId/bookings
// body: { moveInDate, slipUrl }

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

// 3. ยกเลิก booking (ต้อง login)
// DELETE /bookings/:bookingId

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


// 4. ดึงรายการจองของฉัน (แท็บการจอง)
// GET /bookings

router.get("/bookings", authenticate, async (req: any, res) => {
  try {
    const data = await service.getMyBookings(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
