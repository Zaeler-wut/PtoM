// propertyRouter.ts (mobile) — route สำหรับค้นหาและดูรายละเอียดที่พัก
// ไม่ต้องผ่าน authenticate — เปิดให้ผู้ใช้ที่ยังไม่ login ดูได้
// รับ request จาก mobile app ส่งต่อไปยัง propertyService แล้วส่ง response กลับ

import express from "express"
// propertyService — business logic ค้นหาและแสดงรายละเอียดที่พัก
import * as service from "./propertyService"

const router = express.Router()

// GET /api/mobile/properties/featured — ดึงที่พักแนะนำทั้งหมด (ไม่กรองพิกัด)
// เรียก: propertyService.getFeaturedProperties()
// ส่งกลับ: array ของ PropertyCardItem พร้อมจำนวนห้องว่าง
router.get("/properties/featured", async (_req, res) => {
  try {
    const data = await service.getFeaturedProperties()
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/mobile/properties?lat=&lng=&month=&year=&day=&maxOccupants=&radius= — ค้นหาที่พัก
// กรองตามพิกัด GPS, วันที่ต้องการเข้าอยู่, จำนวนคน, รัศมี (km)
// เรียก: propertyService.searchProperties()
// ส่งกลับ: array ของ PropertyCardItem เรียงตามระยะห่างจากใกล้ไปไกล
router.get("/properties", async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string)
    const lng = parseFloat(req.query.lng as string)
    const month = parseInt(req.query.month as string)
    const year = parseInt(req.query.year as string)
    const maxOccupants = req.query.maxOccupants
      ? parseInt(req.query.maxOccupants as string)
      : undefined
    const radius = req.query.radius
      ? parseFloat(req.query.radius as string)
      : 20

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ error: "lat and lng are required" })
    }
    if (isNaN(month) || isNaN(year)) {
      return res.status(400).json({ error: "month and year are required" })
    }

    const day = req.query.day ? parseInt(req.query.day as string) : undefined

    const data = await service.searchProperties({
      lat, lng, month, year, day, maxOccupants, radius,
    })

    res.json(data)
  } catch (err: any) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})

// GET /api/mobile/properties/:propertyId/room-types/:roomTypeId — รายละเอียด room type
// เรียก: propertyService.getRoomTypeDetail()
// ส่งกลับ: ข้อมูล room type พร้อมราคา, สิ่งอำนวยความสะดวก, จำนวนห้องว่าง
router.get("/properties/:propertyId/room-types/:roomTypeId", async (req, res) => {
  try {
    const data = await service.getRoomTypeDetail(
      req.params.propertyId,
      req.params.roomTypeId
    )
    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

// GET /api/mobile/properties/:propertyId?month=&year=&day=&maxOccupants= — รายละเอียดที่พัก
// เรียก: propertyService.getPropertyDetail()
// ส่งกลับ: PropertyDetailMobile พร้อม roomTypes ทั้งหมดที่ allowOnlineBooking
router.get("/properties/:propertyId", async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined
    const year = req.query.year ? parseInt(req.query.year as string) : undefined
    const day = req.query.day ? parseInt(req.query.day as string) : undefined
    const maxOccupants = req.query.maxOccupants
      ? parseInt(req.query.maxOccupants as string)
      : undefined

    const data = await service.getPropertyDetail(req.params.propertyId, {
      month, year, day, maxOccupants,
    })

    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

export default router
