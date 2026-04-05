import { Router } from "express"
import multer from "multer"
import { asyncHandler } from "../../utils/asyncHandler"
import * as UploadService from "./uploadService"
import { authenticate } from "../../middlewares/authenticate"

const router = Router()

// multer — เก็บใน memory ก่อน แล้วค่อย upload ขึ้น Supabase
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (allowed.includes(file.mimetype)) cb(null, true)
    else cb(new Error("Only JPG, PNG, WEBP are allowed"))
  },
})

//  อัพโหลดรูปภาพเดียว 
// POST /api/upload/image
// form-data: file (image)
router.post(
  "/image",
  //authenticate,
  upload.single("file"),
  asyncHandler(UploadService.uploadImage)
)

//  อัพโหลดหลายรูป 
// POST /api/upload/images
// form-data: files[] (images)
router.post(
  "/images",
  authenticate,
  upload.array("files", 10),
  asyncHandler(UploadService.uploadImages)
)

router.get("/test", (req, res) => {
  res.json({ ok: true })
})

export default router