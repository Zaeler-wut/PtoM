import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./propertyService"

const router = express.Router()

router.get("/properties", authenticate, authorize("ADMIN"), async (req: any, res) => {
  try { res.json(await service.getMyProperties(req.user.id)) }
  catch (err) { res.status(500).json({ error: "Internal server error" }) }
})

router.post("/properties", authenticate, authorize("ADMIN"), async (req: any, res) => {
  try { res.status(201).json(await service.createProperty({ ...req.body, userId: req.user.id })) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.get("/properties/:propertyId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.getPropertyDetail(req.params.propertyId)) }
  catch (err: any) { res.status(404).json({ error: err.message }) }
})

router.put("/properties/:propertyId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.updateProperty(req.params.propertyId, req.body)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.delete("/properties/:propertyId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.deleteProperty(req.params.propertyId); res.json({ message: "Property deleted" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.post("/properties/:propertyId/images", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.status(201).json(await service.addPropertyImages(req.params.propertyId, req.body.urls)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.delete("/properties/:propertyId/images/:imageId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.deletePropertyImage(req.params.propertyId, req.params.imageId); res.json({ message: "Image deleted" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.patch("/properties/:propertyId/images/:imageId/cover", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.setCoverImage(req.params.propertyId, req.params.imageId); res.json({ message: "Cover image updated" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.get("/properties/:propertyId/room-types", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.getRoomTypes(req.params.propertyId)) }
  catch (err) { res.status(500).json({ error: "Internal server error" }) }
})

router.post("/properties/:propertyId/room-types", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.status(201).json(await service.createRoomType(req.params.propertyId, req.body)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.get("/properties/:propertyId/room-types/:roomTypeId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.getRoomTypeDetail(req.params.roomTypeId)) }
  catch (err: any) { res.status(404).json({ error: err.message }) }
})

router.delete("/properties/:propertyId/room-types/:roomTypeId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.deleteRoomType(req.params.roomTypeId)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.put("/properties/:propertyId/room-types/:roomTypeId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.json(await service.updateRoomType(req.params.roomTypeId, req.body)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.post("/properties/:propertyId/room-types/:roomTypeId/images", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { res.status(201).json(await service.addRoomTypeImages(req.params.roomTypeId, req.body.urls)) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

router.delete("/properties/:propertyId/room-types/:roomTypeId/images/:imageId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try { await service.deleteRoomTypeImage(req.params.roomTypeId, req.params.imageId); res.json({ message: "Image deleted" }) }
  catch (err: any) { res.status(400).json({ error: err.message }) }
})

// ── Resolve short Google Maps URL → ดึง final URL แล้วคืนกลับ ──
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
