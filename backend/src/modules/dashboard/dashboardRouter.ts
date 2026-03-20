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

export default router
