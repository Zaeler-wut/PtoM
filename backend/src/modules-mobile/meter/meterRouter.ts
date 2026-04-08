import express from "express"
import * as service from "./meterService"
import { authenticate, type AuthenticatedRequest } from "../../middlewares/authenticate"

const router = express.Router()

// ดึง properties ที่ admin คนนี้ดูแล
router.get("/admin/properties", authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const data = await service.getAdminProperties(userId)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ดึงห้องทั้งหมดใน property พร้อมข้อมูลมิเตอร์เดือนนั้น
router.get("/admin/properties/:propertyId/rooms", authenticate, async (req, res) => {
  try {
    const propertyId = req.params.propertyId as string
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear()
    const data = await service.getRoomsForMeter(propertyId, month, year)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// บันทึกมิเตอร์แต่ละห้อง
router.post("/admin/meter", authenticate, async (req, res) => {
  try {
    const { roomId, month, year, waterMeter, electricMeter } = req.body
    if (!roomId || !month || !year || waterMeter == null || electricMeter == null) {
      return res.status(400).json({ error: "Missing required fields" })
    }
    const data = await service.saveMeterReading({
      roomId,
      month: parseInt(month),
      year: parseInt(year),
      waterMeter: parseFloat(waterMeter),
      electricMeter: parseFloat(electricMeter),
    })
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
