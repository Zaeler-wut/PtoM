// authService.ts — business logic สำหรับ auth module
// รับข้อมูลจาก authRouter แล้วประมวลผล ส่งผลลัพธ์กลับ
// เรียกใช้ authRepository สำหรับ query database, utils/password สำหรับ hash, utils/jwt สำหรับ token

import jwt from "jsonwebtoken"
import * as repo from "./authRepository"
import { hashPassword, comparePassword } from "../../utils/password"
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt"
import type { RegisterInput, LoginInput, AuthResponse, RegisterResponse } from "./authModel"

// ตรวจสอบข้อมูล register — email format, ชื่อ-นามสกุล, ความยาว password
function validateRegister(data: RegisterInput) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!data.email || !emailRegex.test(data.email.trim())) {
    throw new Error("Invalid email format")
  }
  if (!data.firstName?.trim()) {
    throw new Error("First name required")
  }
  if (!data.lastName?.trim()) {
    throw new Error("Last name required")
  }
  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 characters")
  }
  if (data.password.length > 72) {
    throw new Error("Password must not exceed 72 characters")
  }
}

// ตรวจสอบข้อมูล login — email และ password ต้องมีค่า
function validateLogin(data: LoginInput) {
  if (!data.email?.trim()) {
    throw new Error("Email required")
  }
  if (!data.password) {
    throw new Error("Password required")
  }
}

// register — สมัครสมาชิกใหม่
// 1. validate ข้อมูล
// 2. ตรวจสอบ email ซ้ำจาก database
// 3. hash password ด้วย bcrypt (utils/password.ts)
// 4. สร้าง user ใหม่ใน database ผ่าน authRepository
// 5. สร้าง accessToken + refreshToken ผ่าน utils/jwt.ts
// 6. บันทึก refreshToken ลง database
// 7. ส่ง token และข้อมูล user กลับไปยัง authRouter
export const register = async (data: RegisterInput): Promise<RegisterResponse> => {
  validateRegister(data)

  const email = data.email.trim().toLowerCase()

  const exist = await repo.findByEmail(email)
  if (exist) {
    throw new Error("Email already exists")
  }

  const hashed = await hashPassword(data.password)

  const user = await repo.createUser({
    firstName: data.firstName.trim(),
    lastName: data.lastName.trim(),
    email,
    password: hashed,
    role: "USER",
  })

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)
  await repo.saveRefreshToken(user.id, refreshToken)

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    },
  }
}

// login — เข้าสู่ระบบ
// 1. validate ข้อมูล
// 2. ค้นหา user จาก email ใน database
// 3. ตรวจสอบว่า account active อยู่
// 4. เปรียบเทียบ password กับ hash ใน database (utils/password.ts)
// 5. สร้าง accessToken + refreshToken ใหม่
// 6. บันทึก refreshToken และอัปเดต lastLogin ใน database
// 7. ส่ง token และข้อมูล user กลับไปยัง authRouter
export const login = async (data: LoginInput): Promise<AuthResponse> => {
  validateLogin(data)

  const email = data.email.trim().toLowerCase()
  const user = await repo.findByEmail(email)

  // ใช้ message เดียวกันทั้ง "ไม่พบ user" และ "password ผิด" เพื่อป้องกัน user enumeration
  if (!user) {
    throw new Error("Invalid credentials")
  }

  if (!user.isActive) {
    throw new Error("User account is inactive")
  }

  const valid = await comparePassword(data.password, user.password)
  if (!valid) {
    throw new Error("Invalid credentials")
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  await repo.saveRefreshToken(user.id, refreshToken)
  await repo.updateLastLogin(user.id)

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    },
  }
}

// refreshToken — ออก access token ใหม่โดยใช้ refresh token
// ใช้ระบบ Token Rotation: revoke token เก่า ออก token ใหม่ทุกครั้ง
// 1. verify refresh token ด้วย REFRESH_TOKEN_SECRET
// 2. ตรวจสอบว่า token ยังไม่ถูก revoke ใน database
// 3. ค้นหา user และตรวจสอบ isActive
// 4. revoke token เก่า สร้างและบันทึก token ใหม่
// 5. ส่ง accessToken และ refreshToken ใหม่กลับไปยัง authRouter
export const refreshToken = async (token: string): Promise<{ accessToken: string, refreshToken: string, user: { id: string, name: string, email: string, role: string } }> => {
  if (!token) {
    throw new Error("No refresh token")
  }

  let decoded: any
  try {
    decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET as string)
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      throw new Error("Refresh token expired")
    }
    throw new Error("Invalid refresh token")
  }

  if (!decoded?.sub) {
    throw new Error("Invalid token payload")
  }

  const stored = await repo.findRefreshToken(token)
  if (!stored || stored.revoked) {
    throw new Error("Refresh token has been revoked")
  }

  const user = await repo.findById(decoded.sub)
  if (!user) throw new Error("User not found")
  if (!user.isActive) throw new Error("User account is inactive")

  // Token Rotation — revoke token เก่า แล้วออก token ใหม่
  await repo.revokeRefreshToken(token)
  const newRefreshToken = generateRefreshToken(user)
  await repo.saveRefreshToken(user.id, newRefreshToken)

  return {
    accessToken: generateAccessToken(user),
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    },
  }
}

// logout — ออกจากระบบ
// revoke refresh token ใน database เพื่อป้องกันการนำ token เก่ากลับมาใช้
export const logout = async (token: string): Promise<void> => {
  if (!token) return

  const stored = await repo.findRefreshToken(token)
  if (stored && !stored.revoked) {
    await repo.revokeRefreshToken(token)
  }
}
