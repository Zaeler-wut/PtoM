// asyncHandler.ts — wrapper function สำหรับ async route handler
// ใช้ครอบ async function ใน router เพื่อดักจับ error อัตโนมัติ
// แทนที่จะต้องเขียน try-catch ทุก route

import { Request, Response, NextFunction } from "express"

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>

// รับ async function เข้ามา แล้ว return function ใหม่ที่ถ้า error จะส่งไป next() เอง
// next() จะส่ง error ไปยัง Express error handler ต่อไป
export const asyncHandler = (fn: AsyncHandler) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
