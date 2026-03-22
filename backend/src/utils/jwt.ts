import jwt from "jsonwebtoken"

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string

export function generateAccessToken(user: any) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.roleAdmin ? "admin" : "user"
    },
    ACCESS_SECRET,
    { expiresIn: "15m" }
  )
}

export function generateRefreshToken(user: any) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  )
}