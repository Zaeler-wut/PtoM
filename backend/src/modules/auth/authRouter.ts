// authRouter.ts — กำหนด route สำหรับระบบ Authentication
// รับ request จาก client ส่งต่อไปยัง authService แล้วส่ง response กลับ
// ทุก route ใน /api/auth ไม่ต้องผ่าน authenticate middleware

import express from "express"
// rate limit ป้องกันการ login ถี่เกินไป
import rateLimit from "express-rate-limit"
// เรียกใช้ authService สำหรับ business logic
import * as service from "./authService"
// authenticate ใช้เฉพาะ GET /me เพื่อตรวจสอบ token
import { authenticate, type AuthenticatedRequest } from "../../middlewares/authenticate"
// repo ใช้เฉพาะ GET /me เพื่อดึงข้อมูล user จาก database โดยตรง
import * as repo from "./authRepository"

const router = express.Router()

// จำกัด login ไม่เกิน 100 ครั้งต่อ 15 นาที ต่อ IP เดียวกัน
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, please try again later" },
})

// กำหนดค่า cookie สำหรับ refresh token
// httpOnly: true — JavaScript อ่านไม่ได้ ป้องกัน XSS
// maxAge: 7 วัน ตรงกับอายุ refresh token
const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: false,
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

// error messages ที่ควร return 401 แทน 400
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

// แปลง error message เป็น HTTP status code ที่เหมาะสม
function resolveStatus(message: string): number {
  if (AUTH_ERRORS.has(message)) return 401
  return 400
}

// POST /api/auth/register — สมัครสมาชิกใหม่
// รับ: firstName, lastName, email, password จาก body
// เรียก: authService.register()
// ส่งกลับ: accessToken, refreshToken, user พร้อม set cookie refreshToken
router.post("/register", async (req, res) => {
  try {
    const result = await service.register(req.body)
    res.cookie("refreshToken", result.refreshToken, REFRESH_COOKIE_OPTIONS)
    res.status(201).json(result)
  } catch (err: any) {
    res.status(resolveStatus(err.message)).json({ error: err.message })
  }
})

// POST /api/auth/login — เข้าสู่ระบบ
// รับ: email, password จาก body
// เรียก: authService.login()
// ส่งกลับ: accessToken, refreshToken, user พร้อม set cookie refreshToken
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

// POST /api/auth/refresh-token — ขอ access token ใหม่ด้วย refresh token
// รับ: refreshToken จาก cookie หรือ body
// เรียก: authService.refreshToken()
// ส่งกลับ: accessToken และ refreshToken ใหม่ (token rotation)
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
    res.json({ accessToken: null })
  }
})

// GET /api/auth/me — ดึงข้อมูล user ที่ login อยู่
// ต้องผ่าน authenticate middleware ก่อน
// รับ: userId จาก req.user (แนบโดย authenticate)
// เรียก: authRepository.findById() โดยตรง
// ส่งกลับ: id, name, email, role
router.get("/me", authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const user = await repo.findById(userId)
    if (!user) return res.status(404).json({ error: "User not found" })
    res.json({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/logout — ออกจากระบบ
// รับ: refreshToken จาก cookie หรือ body
// เรียก: authService.logout() เพื่อ revoke token ใน database
// ส่งกลับ: clear cookie และ { message: "Logged out" }
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
