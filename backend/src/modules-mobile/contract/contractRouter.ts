import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import * as service from "./contractService"

const router = express.Router()


router.get("/contracts", authenticate, async (req: any, res) => {
  try {
    const data = await service.getMyContracts(req.user.id)
    res.json(data)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
