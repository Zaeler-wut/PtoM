// authenticate.ts — middleware ตรวจสอบว่า request มี JWT access token ที่ถูกต้อง
// ใช้คู่กับทุก route ที่ต้องการ login ก่อนเข้าใช้งาน
// ถ้าผ่านจะแนบ user info ไว้ใน req.user และเรียก next() ต่อไป

import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"

// ขยาย Request interface เพิ่ม user field สำหรับแนบข้อมูลผู้ใช้
// middleware อื่นและ route handler ใช้ (req as AuthenticatedRequest).user เพื่ออ่านข้อมูล
export interface AuthenticatedRequest extends Request {
  user: {
    id: string
    role: string
    email: string
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // อ่าน Authorization header รูปแบบ "Bearer <token>"
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null

  // ถ้าไม่มี token ส่ง 401 กลับทันที ไม่ผ่านไปยัง route handler
  if (!token) {
    return res.status(401).json({ error: "Access token required" })
  }

  try {
    // ตรวจสอบ token ด้วย secret key จาก .env
    // ถ้า token ถูกต้องจะ decode payload ออกมา
    const decoded: any = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    )

    // ตรวจสอบว่า payload มี sub (userId) และ role ครบ
    if (!decoded?.sub || !decoded?.role) {
      return res.status(401).json({ error: "Invalid token payload" })
    }

    // แนบ user info ไว้ใน req เพื่อให้ route handler ดึงไปใช้ต่อได้
    ;(req as AuthenticatedRequest).user = {
      id: decoded.sub,
      role: decoded.role,
      email: decoded.email ?? "",
    }

    // ส่งต่อไปยัง middleware หรือ route handler ถัดไป
    next()
  } catch (err: any) {
    // token หมดอายุ — ให้ client ใช้ refresh token ขอ token ใหม่
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" })
    }
    // token ผิดรูปแบบหรือถูกแก้ไข
    return res.status(401).json({ error: "Invalid token" })
  }
}
