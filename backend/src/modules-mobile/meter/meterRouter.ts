// meterRouter.ts (mobile) — route สำหรับบันทึกมิเตอร์และ AI อ่านมิเตอร์
// ทุก route ต้องผ่าน authenticate — ใช้โดย admin ผ่าน mobile app
// รับ request จาก mobile app ส่งต่อไปยัง meterService และ Anthropic AI

import express from "express"
// meterService — business logic ดึงข้อมูลและบันทึกมิเตอร์
import * as service from "./meterService"
// authenticate — ตรวจสอบ JWT token
import { authenticate, type AuthenticatedRequest } from "../../middlewares/authenticate"
// Anthropic SDK — ใช้ส่งรูปมิเตอร์ให้ AI อ่านค่า
import Anthropic from "@anthropic-ai/sdk"

// สร้าง Anthropic client ใหม่ต่อ request — timeout 90s เผื่อ AI ใช้เวลานาน
function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 90000 })
}

const router = express.Router()

// GET /api/mobile/admin/properties — ดึงที่พักที่ admin คนนี้ดูแล
// เรียก: meterService.getAdminProperties()
// ส่งกลับ: array ของ AdminPropertyCard (id, name, coverImage, totalRooms, roomTypeNames)
router.get("/admin/properties", authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const data = await service.getAdminProperties(userId)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// GET /api/mobile/admin/properties/:propertyId/rooms?month=&year= — ห้องทั้งหมดพร้อมมิเตอร์เดือนนั้น
// เรียก: meterService.getRoomsForMeter()
// ส่งกลับ: array ของห้องพร้อม electricMeter, waterMeter (null ถ้ายังไม่ได้กรอก)
router.get("/admin/properties/:propertyId/rooms", authenticate, async (req, res) => {
  try {
    const propertyId = req.params.propertyId as string
    const month = req.query.month ? parseInt(req.query.month as string) : new Date().getMonth() + 1
    const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear()
    const data = await service.getRoomsForMeter(propertyId, month, year)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/mobile/admin/meter — บันทึก/แก้ไขค่ามิเตอร์ห้องเดียว
// รับ: roomId, month, year, waterMeter, electricMeter จาก body
// เรียก: meterService.saveMeterReading()
// ส่งกลับ: MeterReading record ที่บันทึก
router.post("/admin/meter", authenticate, async (req, res) => {
  try {
    const { roomId, month, year, waterMeter, electricMeter } = req.body
    if (!roomId || !month || !year || waterMeter == null || electricMeter == null) {
      return res.status(400).json({ error: "Missing required fields" })
    }
    const data = await service.saveMeterReading({
      roomId,
      month: parseInt(month),
      year: parseInt(year),
      waterMeter: parseFloat(waterMeter),
      electricMeter: parseFloat(electricMeter),
    })
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// POST /api/mobile/admin/meter/ai-read — AI อ่านค่ามิเตอร์จากรูปภาพ
// รับ: images array ของ { base64, mimeType, type: 'electric'|'water' }
// ส่งรูปให้ claude-sonnet-4-6 แปลงค่า — แยก prompt ตามประเภทมิเตอร์
// ส่งกลับ: array ของ { roomNumber, meterValue, type }
router.post("/admin/meter/ai-read", authenticate, async (req, res) => {
  try {
    const { images } = req.body as {
      images: Array<{ base64: string; mimeType: string; type: 'electric' | 'water' }>
    }
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: "images array is required" })
    }

    const results: Array<{ roomNumber: string | null; meterValue: number | null; type: string }> = []

    for (const img of images) {
      // prompt ไฟฟ้า: อ่าน room sticker + kWh จาก LCD หรือ analog roller wheels
      // prompt น้ำ: อ่าน room sticker + cubic meter จากกล่องดำ 4 ช่อง (ไม่รวมกล่องแดงลิตร)
      const prompt = img.type === 'electric'
        ? 'Read this electricity meter image. Extract room number and kWh reading.\n\n' +
          'ORIENTATION: Find "kWh", "MITSUBISHI", or "IPG" text. If upside-down, flip mentally first.\n\n' +
          'ROOM NUMBER: Find a sticker added to the meter body (not original part). Any color/shape, may have letters (A11, B3). Thai numerals → Arabic. No sticker → null.\n\n' +
          'METER READING — two types:\n' +
          '• Digital LCD (IPG/International Power Group): read the integer number shown on screen before "kWh". Example: "63 kWh" → 63\n' +
          '• Analog roller wheels (Mitsubishi): read the 4 digits directly below the brand name. Ignore the decimal point and any digits after it. Example: "1741.0" → 1741\n\n' +
          'STRICT RULE: If any digit is unclear, blurry, or partially obscured → set that value to null. DO NOT guess under any circumstances.\n\n' +
          'Reply with a single JSON object and nothing else — no explanation, no markdown. Start your response with { directly.\n' +
          'Format: {"roomNumber":"4","meterValue":63}'
        : 'อ่านค่ามิเตอร์น้ำจากภาพนี้\n\n' +
          'ขั้นตอนที่ 1 — ปรับทิศทางภาพ:\n' +
          '  มองหาข้อความ "หน่วยลูกบาศก์เมตร" หรือ "หน่วยลิตร" หรือ "DUSS"\n' +
          '  ภาพอาจถูกหมุน 90° หรือ 180° ให้หมุนภาพในใจจนข้อความอ่านได้ปกติก่อนเสมอ\n\n' +
          'ขั้นตอนที่ 2 — เลขห้อง:\n' +
          '  มองหาสติ๊กเกอร์ที่ติดทีหลังบนหน้าปัด เช่น วงกลมสีแดงที่มีตัวเลขขนาดใหญ่อยู่ตรงกลาง\n' +
          '  → roomNumber หรือ null ถ้าไม่มีสติ๊กเกอร์\n\n' +
          'ขั้นตอนที่ 3 — อ่านค่า cubic meter:\n\n' +
          '  โครงสร้างช่องตัวเลข (หลังปรับทิศแล้ว อ่านจากซ้ายไปขวา):\n' +
          '    กล่องดำ 4 ช่อง = หน่วยลูกบาศก์เมตร  (พัน | ร้อย | สิบ | หน่วย)\n' +
          '    กล่องแดง 3 ช่อง = หน่วยลิตร  ← ห้ามอ่านเด็ดขาด\n\n' +
          '  วิธีอ่านที่ถูกต้อง:\n' +
          '    1. ระบุกล่องดำทั้ง 4 ช่องให้ครบก่อน (แต่ละช่องแทน พัน-ร้อย-สิบ-หน่วย)\n' +
          '    2. อ่านตัวเลขในกล่องดำทีละช่องตามลำดับ จะได้ตัวเลข 4 หลัก เช่น "0075"\n' +
          '    3. แปลง 4 หลักนั้นเป็นจำนวนเต็ม: "0075" → cubic = 75\n' +
          '    ⚠ ห้ามข้ามกล่องดำแม้จะเป็น 0 เพราะทุกช่องมีความหมาย\n' +
          '    ⚠ ห้ามนับกล่องแดงรวมเข้ามา ไม่ว่าจะอยู่ชิดแค่ไหน\n\n' +
          '  ตัวอย่าง:\n' +
          '    [0][0][7][5](ดำ) | [6][3][?](แดง)  →  "0075" → cubic = 75\n' +
          '    [0][1][7][8](ดำ) | [8][0][?](แดง)  →  "0178" → cubic = 178\n' +
          '    [0][0][0][9](ดำ) | [5][0][0](แดง)  →  "0009" → cubic = 9\n' +
          '    [0][0][0][0](ดำ) | [0][0][0](แดง)  →  "0000" → cubic = 0\n\n' +
          '  กฎสุดท้าย: ถ้ากล่องดำช่องใดมองไม่ชัด/เบลอ/มีเงาบัง → cubic = null ห้ามเดา\n\n' +
          'ตอบ JSON เท่านั้น เริ่มด้วย { ทันที ห้ามมี markdown หรือคำอธิบาย:\n' +
          '{"roomNumber":"5","cubic":75}'

      try {
        const response = await getAnthropicClient().messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 150,
          temperature: 0,
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'base64', media_type: img.mimeType as any, data: img.base64 } },
              { type: 'text', text: prompt },
            ],
          }],
        })

        const text = response.content.find(b => b.type === 'text')?.text ?? '{}'
        // ดึงเฉพาะ JSON object สุดท้ายจาก response (กรณี AI ส่งข้อความนำหน้า)
        const jsonMatches = text.match(/\{[^{}]*\}/g)
        const clean = jsonMatches ? jsonMatches[jsonMatches.length - 1] : '{}'
        const parsed = JSON.parse(clean)
        const roomNumber = parsed.roomNumber != null ? String(parsed.roomNumber).trim() : null

        let meterValue: number | null = null
        if (parsed.cubic != null) {
          meterValue = Math.floor(Number(parsed.cubic))
          // ถ้าค่าเกิน 10000 แสดงว่า AI อ่านหลักทศนิยมด้วย → ตัดให้เหลือ 4 หลัก
          if (meterValue >= 10000) {
            meterValue = Math.floor(meterValue / Math.pow(10, Math.floor(Math.log10(meterValue)) - 3))
          }
        } else if (parsed.meterValue != null) {
          meterValue = Math.floor(Number(parsed.meterValue))
        }

        results.push({ roomNumber, meterValue, type: img.type })
      } catch {
        // ถ้า AI ล้มเหลวหรือ parse ไม่ได้ → ส่ง null กลับแทน
        results.push({ roomNumber: null, meterValue: null, type: img.type })
      }
    }

    res.json(results)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
