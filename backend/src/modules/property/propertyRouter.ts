// propertyRouter.ts (web) — route สำหรับจัดการที่พักและ room type ฝั่ง web admin
// ทุก route ต้องผ่าน authenticate → authorize("ADMIN") → authorizePropertyAdmin() (เฉพาะ route ที่ระบุ property)
// รับ request จาก web frontend ส่งต่อไปยัง propertyService

import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./propertyService"

const router = express.Router()

// GET /api/properties — ดึง property ทั้งหมดของ admin ที่ login อยู่
// เรียก: propertyService.getMyProperties()
// ส่งกลับ: PropertyListItem[]
router.get("/properties", authenticate, authorize("ADMIN"), async (req: any, res) => {
  try { res.json(await service.getMyProperties(req.user.id)) }
  catch (err) { res.status(500).json({ error: "Internal server error" }) }
})

// POST /api/properties — สร้าง property ใหม่ (ตรวจ limit ก่อนสร้าง)
// รับ: CreatePropertyInput + userId จาก JWT จาก body
// เรียก: propertyService.createProperty()
// ส่งกลับ: property record (201)
router.post("/properties", authenticate, authorize("ADMIN"), async (req: any, res) => {
  try { res.status(201).json(await service.createProperty({ ...req.body, userId: req.user.id })) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// GET /api/properties/:propertyId — ดึงข้อมูล property ฉบับเต็ม
// เรียก: propertyService.getPropertyDetail()
// ส่งกลับ: PropertyDetail
router.get("/properties/:propertyId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.getPropertyDetail(req.params.propertyId)) }
  catch (err: any) { res.status(404).json({ error: err.message }) }
})

// PUT /api/properties/:propertyId — แก้ไข property
// รับ: UpdatePropertyInput จาก body
// เรียก: propertyService.updateProperty()
// ส่งกลับ: PropertyDetail ล่าสุด
router.put("/properties/:propertyId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.updateProperty(req.params.propertyId, req.body)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// DELETE /api/properties/:propertyId — ลบ property และทุกอย่างในนั้น (cascade)
// เรียก: propertyService.deleteProperty()
// ส่งกลับ: { message: "Property deleted" }
router.delete("/properties/:propertyId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.deleteProperty(req.params.propertyId); res.json({ message: "Property deleted" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// POST /api/properties/:propertyId/images — เพิ่มรูป property
// รับ: { urls: string[] } จาก body
// เรียก: propertyService.addPropertyImages()
// ส่งกลับ: รูปที่เพิ่ม (201)
router.post("/properties/:propertyId/images", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.status(201).json(await service.addPropertyImages(req.params.propertyId, req.body.urls)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// DELETE /api/properties/:propertyId/images/:imageId — ลบรูป property
// เรียก: propertyService.deletePropertyImage()
// ส่งกลับ: { message: "Image deleted" }
router.delete("/properties/:propertyId/images/:imageId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.deletePropertyImage(req.params.propertyId, req.params.imageId); res.json({ message: "Image deleted" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// PATCH /api/properties/:propertyId/images/:imageId/cover — ตั้งรูป cover
// เรียก: propertyService.setCoverImage()
// ส่งกลับ: { message: "Cover image updated" }
router.patch("/properties/:propertyId/images/:imageId/cover", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.setCoverImage(req.params.propertyId, req.params.imageId); res.json({ message: "Cover image updated" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// GET /api/properties/:propertyId/room-types — ดึง room type ทั้งหมดของ property
// เรียก: propertyService.getRoomTypes()
// ส่งกลับ: array ของ room type พร้อม roomCount, fees, facilities, images
router.get("/properties/:propertyId/room-types", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.getRoomTypes(req.params.propertyId)) }
  catch (err) { res.status(500).json({ error: "Internal server error" }) }
})

// POST /api/properties/:propertyId/room-types — สร้าง room type ใหม่
// รับ: CreateRoomTypeInput จาก body
// เรียก: propertyService.createRoomType()
// ส่งกลับ: room type record (201)
router.post("/properties/:propertyId/room-types", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.status(201).json(await service.createRoomType(req.params.propertyId, req.body)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// GET /api/properties/:propertyId/room-types/:roomTypeId — ดึงข้อมูล room type ฉบับเต็ม
// เรียก: propertyService.getRoomTypeDetail()
// ส่งกลับ: RoomTypeDetail
router.get("/properties/:propertyId/room-types/:roomTypeId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.getRoomTypeDetail(req.params.roomTypeId)) }
  catch (err: any) { res.status(404).json({ error: err.message }) }
})

// DELETE /api/properties/:propertyId/room-types/:roomTypeId — ลบ room type
// ป้องกันการลบถ้ามีห้องใช้อยู่
// เรียก: propertyService.deleteRoomType()
router.delete("/properties/:propertyId/room-types/:roomTypeId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.deleteRoomType(req.params.roomTypeId)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// PUT /api/properties/:propertyId/room-types/:roomTypeId — แก้ไข room type
// รับ: UpdateRoomTypeInput จาก body
// เรียก: propertyService.updateRoomType()
router.put("/properties/:propertyId/room-types/:roomTypeId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.updateRoomType(req.params.roomTypeId, req.body)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// POST /api/properties/:propertyId/room-types/:roomTypeId/images — เพิ่มรูป room type (max 5)
// รับ: { urls: string[] } จาก body
// เรียก: propertyService.addRoomTypeImages()
// ส่งกลับ: รูปที่เพิ่ม (201)
router.post("/properties/:propertyId/room-types/:roomTypeId/images", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.status(201).json(await service.addRoomTypeImages(req.params.roomTypeId, req.body.urls)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// DELETE /api/properties/:propertyId/room-types/:roomTypeId/images/:imageId — ลบรูป room type
// เรียก: propertyService.deleteRoomTypeImage()
// ส่งกลับ: { message: "Image deleted" }
router.delete("/properties/:propertyId/room-types/:roomTypeId/images/:imageId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.deleteRoomTypeImage(req.params.roomTypeId, req.params.imageId); res.json({ message: "Image deleted" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// GET /api/resolve-map-url?url=... — resolve short Google Maps URL เป็น full URL
// ใช้ HEAD request ติดตาม redirect แล้วส่ง final URL กลับ
// เรียก: fetch() ภายใน route โดยตรง
router.get("/resolve-map-url", authenticate, authorize("ADMIN"), async (req: any, res) => {
  const url = req.query.url as string
  if (!url) return res.status(400).json({ error: "url is required" })
  try {
    const response = await fetch(url, { method: "HEAD", redirect: "follow" })
    res.json({ resolvedUrl: response.url })
  } catch {
    res.status(400).json({ error: "ไม่สามารถ resolve URL ได้" })
  }
})

export default router
