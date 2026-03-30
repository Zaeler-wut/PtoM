import jwt from "jsonwebtoken"
import * as repo from "./authRepository"
import { hashPassword, comparePassword } from "../../utils/password"
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt"
import type { RegisterInput, LoginInput, AuthResponse, RegisterResponse } from "./authModel"

// VALIDATORS

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

function validateLogin(data: LoginInput) {
  if (!data.email?.trim()) {
    throw new Error("Email required")
  }
  if (!data.password) {
    throw new Error("Password required")
  }
}

// REGISTER

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

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
  }
}


// LOGIN

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  validateLogin(data)

  const email = data.email.trim().toLowerCase()

  const user = await repo.findByEmail(email)

  // ใช้ message เดียวกันเพื่อป้องกัน user enumeration
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

  // บันทึก refresh token ลง DB
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

// REFRESH TOKEN

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

  // Token Rotation — revoke ตัวเก่า ออกตัวใหม่
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


export const logout = async (token: string): Promise<void> => {
  if (!token) return // ไม่มี token ก็ logout ได้เลย

  const stored = await repo.findRefreshToken(token)
  if (stored && !stored.revoked) {
    await repo.revokeRefreshToken(token)
  }
}