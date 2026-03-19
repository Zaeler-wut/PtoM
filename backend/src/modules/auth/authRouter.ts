import express from "express"
import rateLimit from "express-rate-limit"
import * as service from "./authService"

const router = express.Router()

// ─────────────────────────────────────────
// Rate Limiter
// ─────────────────────────────────────────

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
})

// ─────────────────────────────────────────
// Cookie Options
// ─────────────────────────────────────────

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "strict" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

// ─────────────────────────────────────────
// Error → HTTP Status
// ─────────────────────────────────────────

const AUTH_ERRORS = new Set([
  "Invalid credentials",
  "User account is inactive",
  "Refresh token expired",
  "Invalid refresh token",
  "Refresh token has been revoked",
  "Invalid token payload",
  "No refresh token",
  "User not found",
])

function resolveStatus(message: string): number {
  if (AUTH_ERRORS.has(message)) return 401
  return 400
}

// ─────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────

router.post("/register", async (req, res) => {
  try {
    const result = await service.register(req.body)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(resolveStatus(err.message)).json({ error: err.message })
  }
})

router.post("/login", loginLimiter, async (req, res) => {
  try {
    const result = await service.login(req.body)

    // web → เซ็ต cookie
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)

    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // mobile เอาไปเก็บใน SecureStore
      user: result.user,
    })
  } catch (err: any) {
    res.status(resolveStatus(err.message)).json({ error: err.message })
  }
})

router.post("/refresh-token", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken
    const result = await service.refreshToken(token)

    // web → อัพเดท cookie ด้วย refreshToken ใหม่
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)

    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken, // mobile เอาไปเก็บใน SecureStore แทนตัวเก่า
    })
  } catch (err: any) {
    res.status(resolveStatus(err.message)).json({ error: err.message })
  }
})

router.post("/logout", async (req, res) => {
  try {
    // web  → ส่งมาใน cookie
    // mobile → ส่งมาใน body
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken
    await service.logout(token)
  } finally {
    // ล้าง cookie เสมอ (web)
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS)
    res.json({ message: "Logged out" })
  }
})

export default router