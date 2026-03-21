import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./tenantService"

const router = express.Router()

router.get("/properties/:propertyId/tenants", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getTenants(req.params.propertyId))
  } catch (err) {
    res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/properties/:propertyId/tenants/:contractId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getTenantDetail(req.params.contractId, req.params.propertyId))
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

export default router
