// uploadRouter.ts — กำหนด route สำหรับอัปโหลดรูปภาพขึ้น Cloudinary
// ใช้ multer เก็บไฟล์ใน memory ก่อน แล้ว uploadService จะ upload ต่อไปยัง Cloudinary
// รับ request จาก web frontend หรือ mobile ส่งต่อไปยัง uploadService

import { Router } from "express"
// multer — middleware รับไฟล์ multipart/form-data
import multer from "multer"
// asyncHandler — wrapper ดักจับ async error แล้วส่งต่อให้ express error handler
import { asyncHandler } from "../../utils/asyncHandler"
// uploadService — ทำการ upload จริงขึ้น Cloudinary
import * as UploadService from "./uploadService"
// authenticate — ตรวจสอบ JWT token (ใช้เฉพาะ route ที่ต้องการ auth)
import { authenticate } from "../../middlewares/authenticate"

const router = Router()

// multer config — เก็บไฟล์ใน memory (Buffer) ก่อน แล้วค่อย stream ขึ้น Cloudinary
// จำกัดขนาดไฟล์ 5MB และรับเฉพาะ JPG, PNG, WEBP
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error("Only JPG, PNG, WEBP are allowed"))
  },
})

// POST /api/upload/image — อัปโหลดรูปภาพเดียว
// form-data: file (image)
// query: folder (optional) — subfolder ใน Cloudinary เช่น "meter", "slip"
// ส่งกลับ: { url: string }
router.post(
  "/image",
  upload.single("file"),
  asyncHandler(UploadService.uploadImage)
)

// POST /api/upload/images — อัปโหลดหลายรูปพร้อมกัน (สูงสุด 10 ไฟล์)
// ต้องผ่าน authenticate ก่อน
// form-data: files[] (images)
// query: folder (optional)
// ส่งกลับ: { urls: string[] }
router.post(
  "/images",
  authenticate,
  upload.array("files", 10),
  asyncHandler(UploadService.uploadImages)
)

// GET /api/upload/test — ตรวจสอบว่า upload service ทำงานได้
router.get("/test", (_req, res) => {
  res.json({ ok: true })
})

export default router
