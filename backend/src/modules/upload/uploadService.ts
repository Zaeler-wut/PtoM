// uploadService.ts — จัดการการอัปโหลดรูปภาพขึ้น Cloudinary
// รับ Buffer จาก multer memory storage แล้ว stream ขึ้น Cloudinary
// ถูกเรียกใช้จาก uploadRouter.ts ผ่าน asyncHandler

import { Request, Response } from "express"
import { v2 as cloudinary } from "cloudinary"
import { v4 as uuidv4 } from "uuid"

// ตั้งค่า Cloudinary ด้วย environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// subfolder หลักใน Cloudinary — ทุกรูปจะอยู่ใน ptom/<folder>
const FOLDER = process.env.CLOUDINARY_FOLDER ?? "ptom"

// helper: รับ Buffer แล้ว stream ขึ้น Cloudinary พร้อม auto resize และ compress
// resize: ไม่เกิน 1200x800 | quality: auto good | format: auto (webp ถ้า browser รองรับ)
// ส่งกลับ: secure_url ของรูปที่อัปโหลดสำเร็จ
async function uploadToCloudinary(
  buffer: Buffer,
  mimetype: string,
  folder: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `${FOLDER}/${folder}`,
        public_id: uuidv4(),
        resource_type: "image",
        transformation: [
          { width: 1200, height: 800, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) return reject(new Error(error.message))
        resolve(result!.secure_url)
      }
    )
    uploadStream.end(buffer)
  })
}

// POST /api/upload/image — อัปโหลดรูปภาพเดียว
// รับ: req.file (จาก multer single), req.query.folder (optional subfolder)
// เรียก: uploadToCloudinary()
// ส่งกลับ: { url: string }
export const uploadImage = async (req: Request, res: Response) => {
  const file = req.file
  if (!file) throw new Error("No file uploaded")

  const folder = (req.query.folder as string) ?? "general"
  const url = await uploadToCloudinary(file.buffer, file.mimetype, folder)

  res.json({ url })
}

// POST /api/upload/images — อัปโหลดหลายรูปพร้อมกัน (สูงสุด 10 ไฟล์)
// รับ: req.files (จาก multer array), req.query.folder (optional subfolder)
// เรียก: uploadToCloudinary() ทุกไฟล์แบบ parallel
// ส่งกลับ: { urls: string[] }
export const uploadImages = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files || files.length === 0) throw new Error("No files uploaded")

  const folder = (req.query.folder as string) ?? "general"
  const urls = await Promise.all(
    files.map((f) => uploadToCloudinary(f.buffer, f.mimetype, folder))
  )

  res.json({ urls })
}
