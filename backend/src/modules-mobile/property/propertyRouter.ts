import express from "express"
import * as service from "./propertyService"

const router = express.Router()


router.get("/properties/featured", async (_req, res) => {
  try {
    const data = await service.getFeaturedProperties()
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

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

    const data = await service.searchProperties({
      lat, lng, month, year, maxOccupants, radius,
    })

    res.json(data)
  } catch (err: any) {
    console.error(err)
    res.status(400).json({ error: err.message })
  }
})


router.get("/properties/:propertyId", async (req, res) => {
  try {
    const month = req.query.month ? parseInt(req.query.month as string) : undefined
    const year = req.query.year ? parseInt(req.query.year as string) : undefined
    const maxOccupants = req.query.maxOccupants
      ? parseInt(req.query.maxOccupants as string)
      : undefined

    const data = await service.getPropertyDetail(req.params.propertyId, {
      month, year, maxOccupants,
    })

    res.json(data)
  } catch (err: any) {
    res.status(404).json({ error: err.message })
  }
})

export default router