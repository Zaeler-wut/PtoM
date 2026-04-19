// authorizePropertyAdmin.ts — middleware ตรวจสอบว่าผู้ใช้เป็น admin ของที่พักนั้น ๆ
// ป้องกัน admin คนหนึ่งเข้าถึงข้อมูลของที่พักที่ตัวเองไม่ได้ดูแล
// ใช้หลังจากผ่าน authenticate และ authorize("ADMIN") แล้ว
// SUPERADMIN ผ่านได้เสมอโดยไม่ต้องตรวจสอบ

import { Request, Response, NextFunction } from "express"

// import prisma เพื่อ query ตาราง PropertyAdmin
import { prisma } from "../lib/prisma"

// import AuthenticatedRequest เพื่ออ่าน req.user
import type { AuthenticatedRequest } from "./authenticate"

export const authorizePropertyAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthenticatedRequest).user

      // ถ้าไม่มีข้อมูล user ส่ง 401
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" })
      }

      // อ่าน propertyId จาก route params, body, หรือ query string ตามลำดับ
      const propertyId =
        req.params.propertyId ??
        req.body.propertyId ??
        req.query.propertyId

      // ถ้าไม่มี propertyId ใน request ส่ง 400
      if (!propertyId) {
        return res.status(400).json({ error: "propertyId is required" })
      }

      // SUPERADMIN ข้ามการตรวจสอบ เข้าถึงที่พักทุกอันได้
      // ADMIN ต้องตรวจสอบว่าอยู่ใน PropertyAdmin ของที่พักนั้น
      if (user.role === "ADMIN") {
        // query ตาราง PropertyAdmin ใน database ว่ามีคู่ userId + propertyId นี้ไหม
        const admin = await prisma.propertyAdmin.findFirst({
          where: { userId: user.id, propertyId: String(propertyId) },
        })

        // ถ้าไม่พบ แสดงว่า admin คนนี้ไม่มีสิทธิ์จัดการที่พักนี้ ส่ง 403
        if (!admin) {
          return res.status(403).json({ error: "You are not admin of this property" })
        }
      }

      // ผ่านการตรวจสอบ ส่งต่อไปยัง route handler
      next()
    } catch (err) {
      return res.status(500).json({ error: "Internal server error" })
    }
  }
}
