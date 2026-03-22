import jwt from "jsonwebtoken"

const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string

if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "Missing JWT secrets: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set"
  )
}

export function generateAccessToken(user: {
  id: string
  role: string
  firstName: string
  lastName: string
  email: string
}) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    },
    ACCESS_SECRET,
    { expiresIn: "1h" }
  )
}

export function generateRefreshToken(user: { id: string }) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  )
}