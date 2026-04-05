import { Request, Response } from "express"
import { v2 as cloudinary } from "cloudinary"
import { v4 as uuidv4 } from "uuid"

//  Cloudinary config 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const FOLDER = process.env.CLOUDINARY_FOLDER ?? "ptom"

//  Helper: upload buffer  Cloudinary 
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
          { width: 1200, height: 800, crop: "limit" }, // resize
          { quality: "auto:good" },                     // auto compress
          { fetch_format: "auto" },                     // auto format (webp ถ้า browser รองรับ)
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

//  POST /api/upload/image 
export const uploadImage = async (req: Request, res: Response) => {
  const file = req.file
  if (!file) throw new Error("No file uploaded")

  const folder = (req.query.folder as string) ?? "general"
  const url = await uploadToCloudinary(file.buffer, file.mimetype, folder)

  res.json({ url })
}

//  POST /api/upload/images 
export const uploadImages = async (req: Request, res: Response) => {
  const files = req.files as Express.Multer.File[]
  if (!files || files.length === 0) throw new Error("No files uploaded")

  const folder = (req.query.folder as string) ?? "general"
  const urls = await Promise.all(
    files.map((f) => uploadToCloudinary(f.buffer, f.mimetype, folder))
  )

  res.json({ urls })
}