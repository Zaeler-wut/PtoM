import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./contractService"

const router = express.Router()

router.get("/properties/:propertyId/contracts", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getContracts(req.params.propertyId))
  } catch (err) {
    res.status(500).json({ error: "Internal server error" })
  }
})

router.get("/properties/:propertyId/contracts/:contractId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.getContractDetail(req.params.contractId, req.params.propertyId))
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

router.patch("/properties/:propertyId/contracts/:contractId/pdf", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    await service.uploadContractPdf(req.params.contractId, req.params.propertyId, req.body.pdfUrl)
    res.json({ message: "Contract PDF uploaded" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.put("/properties/:propertyId/contracts/:contractId", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.json(await service.updateContract(req.params.contractId, req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/properties/:propertyId/contracts/online", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.status(201).json(await service.createOnlineContract(req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/properties/:propertyId/contracts/offline", authenticate, authorize("ADMIN"), authorizePropertyAdmin(), async (req: any, res) => {
  try {
    res.status(201).json(await service.createOfflineContract(req.params.propertyId, req.body))
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
