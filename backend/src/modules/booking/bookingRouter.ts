import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./bookingService"

const router = express.Router()

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

// ยืนยัน booking + auto assign ห้อง
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

// ยกเลิก booking
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
