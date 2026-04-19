// index.ts — จุดเริ่มต้นของ Backend Server
// สร้าง Express app, ติดตั้ง middleware และลงทะเบียน router ทั้งหมด

// โหลด environment variables จากไฟล์ .env เข้า process.env
import 'dotenv/config'

// Express framework สำหรับสร้าง HTTP server
import express from "express"

// Prisma client สำหรับเชื่อมต่อ database (ประกาศไว้ใน lib/prisma.ts)
import { prisma } from './lib/prisma'

// cors — อนุญาต request จาก domain อื่น เช่น frontend web และ mobile app
import cors from "cors"

// cookie-parser — อ่าน cookie จาก request header
import cookieParser from "cookie-parser"

// Admin routers — จัดการ route ของแต่ละ feature ฝั่ง admin
import authRouter from "./modules/auth/authRouter"               // login, register, refresh token
import propertyRouter from "./modules/property/propertyRouter"   // CRUD ที่พัก
import roomRouter from "./modules/room/roomRouter"               // CRUD ห้อง
import bookingRouter from "./modules/booking/bookingRouter"       // จัดการการจอง
import contractRouter from "./modules/contract/contractRouter"   // จัดการสัญญา
import tenantRouter from "./modules/tenant/tenantRouter"         // ข้อมูลผู้เช่า
import billingRouter from "./modules/billing/billingRouter"       // บิลและการชำระเงิน
import moveOutRouter from "./modules/moveout/moveOutRouter"       // กระบวนการย้ายออก
import dashboardRouter from "./modules/dashboard/dashboardRouter" // ข้อมูลสรุป dashboard
import uploadRouter from "./modules/upload/uploadRouter"         // อัปโหลดรูปภาพไปยัง Cloudinary

// Mobile routers — API สำหรับ Mobile App ฝั่งผู้เช่าโดยเฉพาะ
import mobilePropertyRouter from "./modules-mobile/property/propertyRouter"   // ค้นหาที่พักตาม location
import mobileMeterRouter from "./modules-mobile/meter/meterRouter"             // จดมิเตอร์น้ำ-ไฟ
import mobileProfileRouter from "./modules-mobile/profile/profileRouter"       // โปรไฟล์และห้องพักของผู้ใช้
import mobileBookingRouter from "./modules-mobile/booking/bookingRouter"       // จองห้องออนไลน์
import mobileBillRouter from "./modules-mobile/billing/billRouter"             // ดูบิลและแจ้งชำระเงิน
import mobileContractRouter from "./modules-mobile/contract/contractRouter"   // ดูสัญญาเช่า

// Superadmin router — จัดการ admin และภาพรวมระบบ
import superadminRouter from "./modules/superadmin/superadminRouter"

// สร้าง Express application
const app = express()

// อ่าน PORT จาก environment variable ถ้าไม่มีใช้ 8080
const port = process.env.PORT || 8080

// อนุญาต Cross-Origin Request จากทุก domain พร้อมส่ง cookie ข้าม domain ได้
app.use(cors({
  origin: true,
  credentials: true
}))

// parse request body เป็น JSON รองรับขนาดสูงสุด 50MB สำหรับรูปภาพ base64
app.use(express.json({ limit: '50mb' }))

// parse cookie จาก request header ให้อ่านได้ผ่าน req.cookies
app.use(cookieParser())

// upload route — รับไฟล์รูปภาพและส่งต่อไปยัง Cloudinary
console.log("uploadRouter loaded:", uploadRouter)
app.use("/api/upload", uploadRouter)

// route ทดสอบว่า upload endpoint พร้อมใช้งาน
app.get("/api/upload/test", (req, res) => {
  res.json({ ok: true })
})

// auth routes — ไม่ต้อง login ก่อน ใช้สำหรับ login, register, refresh token
app.use("/api/auth", authRouter)

// admin routes — ทุก route ตรวจสิทธิ์ผ่าน authenticate และ authorize ใน router ของตัวเอง
app.use("/api/admin", propertyRouter)
app.use("/api/admin", roomRouter)
app.use("/api/admin", bookingRouter)
app.use("/api/admin", contractRouter)
app.use("/api/admin", tenantRouter)
app.use("/api/admin", billingRouter)
app.use("/api/admin", moveOutRouter)
app.use("/api/admin", dashboardRouter)

// mobile routes — API สำหรับ Mobile App ผู้เช่า
app.use("/api/mobile", mobilePropertyRouter)
app.use("/api/mobile", mobileMeterRouter)
app.use("/api/mobile", mobileProfileRouter)
app.use("/api/mobile", mobileBookingRouter)
app.use("/api/mobile", mobileBillRouter)
app.use("/api/mobile", mobileContractRouter)

// superadmin routes — เฉพาะผู้ใช้ที่มี role SUPERADMIN
app.use("/api/superadmin", superadminRouter)

// เปิด HTTP server รอรับ request ที่ port ที่กำหนด
app.listen(port, () => {
    console.log(`Server is running on http:localhost:${port}`)
})
