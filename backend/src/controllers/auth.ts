import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { prisma } from '../lib/prisma';

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt"

const SALT_ROUNDS = 12

// REGISTER
export const register = async (req: Request, res: Response) => {

  const { email, password, name } = req.body

  try {

    const existing = await prisma.user.findUnique({
      where: { email }
    })

    if (existing) {
      return res.status(409).json({
        error: "Email already exists"
      })
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    })

    return res.status(201).json({
      data: {
        id: user.id,
        email: user.email
      }
    })

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error"
    })
  }
}


// LOGIN
export const login = async (req: Request, res: Response) => {

  const { email, password } = req.body

  try {

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      })
    }

    const match = await bcrypt.compare(password, user.password)

    if (!match) {
      return res.status(401).json({
        error: "Invalid credentials"
      })
    }

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    return res.status(200).json({
      accessToken
    })

  } catch (err) {
    return res.status(500).json({
      error: "Internal server error"
    })
  }
}


// REFRESH TOKEN
export const refreshToken = async (req: Request, res: Response) => {

  const token = req.cookies.refreshToken

  if (!token) {
    return res.status(401).json({
      error: "No refresh token"
    })
  }

  try {

    const decoded: any = verifyRefreshToken(token)

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub }
    })

    if (!user) {
      return res.status(401).json({
        error: "Invalid refresh token"
      })
    }

    const accessToken = generateAccessToken(user)

    return res.status(200).json({
      accessToken
    })

  } catch {

    return res.status(403).json({
      error: "Invalid or expired refresh token"
    })

  }
}


// LOGOUT
export const logout = async (req: Request, res: Response) => {

  res.clearCookie("refreshToken")

  return res.status(200).json({
    message: "Logged out successfully"
  })
}