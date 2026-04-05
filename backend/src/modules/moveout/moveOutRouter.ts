import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import { authorizePropertyAdmin } from "../../middlewares/authorizePropertyAdmin"
import * as service from "./moveOutService"

const router = express.Router()

// 1. รายการแจ้งย้ายออก + บิลที่ออกแล้ว
// GET /properties/:propertyId/move-out

router.get(
  "/properties/:propertyId/move-out",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : undefined
      const status = req.query.status as string | undefined
      const data = await service.getMoveOutList(req.params.propertyId, { year, status })
      res.json(data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Internal server error" })
    }
  }
)

// 2. Preview — คำนวณยอดก่อนสร้างบิล (realtime)
// POST /properties/:propertyId/move-out/:contractId/preview
// body: { moveOutDate, billingStartDay, billingEndDay,
//         waterStart, waterEnd, electricStart, electricEnd,
//         damageItems?, additionalItems? }

router.post(
  "/properties/:propertyId/move-out/:contractId/preview",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.getMoveOutPreview(
        req.params.contractId,
        req.params.propertyId,
        req.body
      )
      res.json(data)
    } catch (err: any) {
      console.error(err)
      res.status(400).json({ error: err.message })
    }
  }
)

// 3. สร้างบิลแจ้งออก
// POST /properties/:propertyId/move-out/:contractId/bill
// body: { moveOutDate, billingStartDay, billingEndDay,
//         waterStart, waterEnd, electricStart, electricEnd,
//         damageItems?, additionalItems? }

router.post(
  "/properties/:propertyId/move-out/:contractId/bill",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.createMoveOutBill(
        req.params.contractId,
        req.params.propertyId,
        req.body
      )
      res.status(201).json(data)
    } catch (err: any) {
      console.error(err)
      res.status(400).json({ error: err.message })
    }
  }
)

// 4. ดูรายละเอียดบิลแจ้งออก
// GET /properties/:propertyId/move-out/bills/:moveOutBillId

router.get(
  "/properties/:propertyId/move-out/bills/:moveOutBillId",
  authenticate,
  authorize("ADMIN"),
  authorizePropertyAdmin(),
  async (req: any, res) => {
    try {
      const data = await service.getMoveOutBillDetail(
        req.params.moveOutBillId,
        req.params.propertyId
      )
      res.json(data)
    } catch (err: any) {
      console.error(err)
      res.status(404).json({ error: err.message })
    }
  }
)

export default router
