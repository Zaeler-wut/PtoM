// prisma.ts — สร้างและ export Prisma Client สำหรับใช้เชื่อมต่อ database
// ไฟล์อื่น ๆ ทั่วทั้ง backend import { prisma } จากที่นี่เพื่อ query database

// โหลด environment variables จาก .env
import "dotenv/config"

// PrismaPg — adapter สำหรับเชื่อมต่อ PostgreSQL โดยตรง
import { PrismaPg } from '@prisma/adapter-pg'

// PrismaClient — class หลักที่ใช้ query database ทั้งหมด
// generate มาจาก schema.prisma ไว้ที่ generated/prisma/
import { PrismaClient } from '../../generated/prisma/client'

// อ่าน DATABASE_URL จาก .env เช่น postgresql://user:pass@host/db
const connectionString = `${process.env.DATABASE_URL}`

// สร้าง PostgreSQL adapter โดยใช้ connection string
const adapter = new PrismaPg({ connectionString })

// สร้าง Prisma client แบบ singleton ส่งออกให้ทุก module ใช้ร่วมกัน
const prisma = new PrismaClient({ adapter })

export { prisma }
