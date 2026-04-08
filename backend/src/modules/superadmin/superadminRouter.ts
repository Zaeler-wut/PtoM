import express from "express"
import { authenticate } from "../../middlewares/authenticate"
import { authorize } from "../../middlewares/authorize"
import * as service from "./superadminService"

const router = express.Router()

const guard = [authenticate, authorize("SUPERADMIN")]

// Dashboard
router.get("/dashboard", ...guard, async (_req, res) => {
  try {
    res.json(await service.getDashboard())
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ── Admins ───────────────────────────────────────────────────
router.get("/admins", ...guard, async (_req, res) => {
  try {
    res.json(await service.getAdmins())
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/admins", ...guard, async (req, res) => {
  try {
    const data = await service.createAdmin(req.body)
    res.status(201).json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.patch("/admins/:id/limit", ...guard, async (req, res) => {
  try {
    const data = await service.updateLimit(req.params.id as string, parseInt(req.body.propertyLimit))
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.patch("/admins/:id/status", ...guard, async (req, res) => {
  try {
    const data = await service.setStatus(req.params.id as string, req.body.isActive)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/admins/:id/reset-password", ...guard, async (req, res) => {
  try {
    await service.resetPassword(req.params.id as string, req.body.password)
    res.json({ message: "Password reset successfully" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// Impersonate
router.post("/admins/:id/impersonate", ...guard, async (req, res) => {
  try {
    const data = await service.impersonate(req.params.id as string)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ── Properties ───────────────────────────────────────────────
router.get("/properties", ...guard, async (_req, res) => {
  try {
    res.json(await service.getProperties())
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ── Users (Support) ──────────────────────────────────────────
router.get("/users/search", ...guard, async (req, res) => {
  try {
    const data = await service.searchUsers(req.query.q as string)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.patch("/users/:id/status", ...guard, async (req, res) => {
  try {
    const data = await service.setStatus(req.params.id as string, req.body.isActive)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

router.post("/users/:id/reset-password", ...guard, async (req, res) => {
  try {
    await service.resetPassword(req.params.id as string, req.body.password)
    res.json({ message: "Password reset successfully" })
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

export default router
