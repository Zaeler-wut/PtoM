import express from "express"
import rateLimit from "express-rate-limit"
import * as service from "./authService"

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
})

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

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
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)
    res.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    })
  } catch (err: any) {
    res.status(resolveStatus(err.message)).json({ error: err.message })
  }
})

router.post("/refresh-token", async (req, res) => {
  const token = req.cookies?.refreshToken ?? req.body?.refreshToken
  if (!token) {
    return res.json({ accessToken: null })
  }
  try {
    const result = await service.refreshToken(token)
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)
    res.json({ accessToken: result.accessToken, refreshToken: result.refreshToken, user: result.user })
  } catch {
    // ไม่ clearCookie เพราะ token rotation revoke server-side แล้ว
    // การ clear cookie จะทำให้ request คู่ขนานที่สำเร็จถูกลบทับ
    res.json({ accessToken: null })
  }
})

router.post("/logout", async (req, res) => {
  try {
    const token = req.cookies?.refreshToken ?? req.body?.refreshToken
    await service.logout(token)
  } finally {
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS)
    res.json({ message: "Logged out" })
  }
})

export default router