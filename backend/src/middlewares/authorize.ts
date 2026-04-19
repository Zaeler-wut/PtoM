// authorize.ts — middleware ตรวจสอบ role ของผู้ใช้
// ใช้หลังจาก authenticate ผ่านแล้ว เพื่อจำกัดสิทธิ์ตาม role
// เรียกใช้โดยส่ง role ที่อนุญาตเข้าไป เช่น authorize("ADMIN", "SUPERADMIN")

import { Request, Response, NextFunction } from "express"

// import AuthenticatedRequest เพื่ออ่าน req.user ที่ authenticate แนบไว้
import type { AuthenticatedRequest } from "./authenticate"

type Role = "USER" | "ADMIN" | "SUPERADMIN"

// รับ role ที่อนุญาตได้หลาย role แล้วส่งกลับ middleware function
export const authorize = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as AuthenticatedRequest).user

    // ถ้าไม่มีข้อมูล user (authenticate ไม่ผ่าน) ส่ง 401
    if (!user) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    // ถ้า role ของผู้ใช้ไม่อยู่ใน list ที่อนุญาต ส่ง 403
    if (!roles.includes(user.role as Role)) {
      return res.status(403).json({ error: "Access denied" })
    }

    // role ผ่าน — ส่งต่อไปยัง route handler ถัดไป
    next()
  }
}
