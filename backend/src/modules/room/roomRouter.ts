import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./roomService"

const router = express.Router()

router.get("/properties/:propertyId/rooms", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getRooms(req.params.propertyId))
  } catch (err) {
    res.status(500).json({ error: "Internal server error" })
  }
})

router.post("/properties/:propertyId/rooms", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.status(201).json(await service.createRoom(req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
