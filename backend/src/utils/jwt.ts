// jwt.ts — สร้าง JWT token สำหรับระบบ Authentication
// ส่งออก generateAccessToken และ generateRefreshToken
// ถูกเรียกใช้จาก authService.ts ตอน login และ refresh token

import jwt from "jsonwebtoken"

// อ่าน secret key จาก environment variable
// ใช้เซ็น access token อายุสั้น (1 ชั่วโมง)
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET as string

// ใช้เซ็น refresh token อายุยาว (7 วัน)
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET as string

// ตรวจสอบว่ากำหนด secret ทั้งสองไว้ใน .env ถ้าไม่มีจะ throw error ตั้งแต่ตอน start server
if (!process.env.ACCESS_TOKEN_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  throw new Error(
    "Missing JWT secrets: ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be set"
  )
}

// สร้าง Access Token อายุ 1 ชั่วโมง
// บรรจุ userId (sub), role, name, email ไว้ใน payload
// ส่งกลับไปยัง client เพื่อแนบใน Authorization header ทุก request
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

// สร้าง Refresh Token อายุ 7 วัน
// บรรจุเฉพาะ userId เพื่อความปลอดภัย
// ถูกบันทึกลง database ตาราง RefreshToken และส่งให้ client เก็บไว้
export function generateRefreshToken(user: { id: string }) {
  return jwt.sign(
    { sub: user.id },
    REFRESH_SECRET,
    { expiresIn: "7d" }
  )
}
