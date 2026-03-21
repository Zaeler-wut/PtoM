import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./dashboardService"

const router = express.Router()

router.get(
  "/properties/:propertyId/dashboard",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      res.json(await service.getDashboard(req.params.propertyId))
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

router.get(
  "/properties/:propertyId/revenue",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const months = req.query.months ? parseInt(req.query.months as string) : 6
      const data = await service.getRevenue(req.params.propertyId, months)
      res.json(data)
    } catch (err: any) {
      res.status(400).json({ error: err.message })
    }
  }
)

export default router