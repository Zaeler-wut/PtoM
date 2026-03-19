import * as repo from "./authRepository"
import * as service from "./authService"
import jwt from "jsonwebtoken"
import { generateAccessToken } from "../../utils/jwt"

// VALIDATE REGISTER
function validateRegister(data: any) {

  if (!data.email || typeof data.email !== "string") {
    throw new Error("Email must be string")
  }

  if (!data.email.includes("@")) {
    throw new Error("Invalid email format")
  }

  if (!data.firstName || typeof data.firstName !== "string") {
    throw new Error("First name required")
  }

  if (!data.lastName || typeof data.lastName !== "string") {
    throw new Error("Last name required")
  }

  if (!data.password || data.password.length < 6) {
    throw new Error("Password must be at least 6 chars")
  }
}

// VALIDATE LOGIN
function validateLogin(data: any) {

  if (!data.email || typeof data.email !== "string") {
    throw new Error("Email required")
  }

  if (!data.password) {
    throw new Error("Password required")
  }
}


// REGISTER
export const register = async (data: any) => {

  validateRegister(data)

  const exist = await repo.findByEmail(data.email)

  if (exist) {
    throw new Error("Email already exists")
  }

  const user = await service.registerService(data, repo)

  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName
  }
}


// LOGIN
export const login = async (data: any) => {

  validateLogin(data)

  const user = await repo.findByEmail(data.email)

  if (!user) {
    throw new Error("Invalid credentials")
  }

  if (!user.isActive) {
    throw new Error("User inactive")
  }

  const tokens = await service.loginService(data, user)

  await repo.updateLastLogin(user.id)

  return tokens
}


// REFRESH TOKEN
export const refreshToken = async (req: any) => {

  const token = req.cookies?.refreshToken

  if (!token) {
    throw new Error("No refresh token")
  }

  const decoded: any = jwt.verify(
    token,
    process.env.REFRESH_TOKEN_SECRET as string
  )

  const user = await repo.findById(decoded.sub)

  if (!user) {
    throw new Error("User not found")
  }

  if (!user.isActive) {
    throw new Error("User inactive")
  }

  return {
    accessToken: generateAccessToken(user)
  }
}