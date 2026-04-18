import express from "express"
import * as service from "./meterService"
import { authenticate, type AuthenticatedRequest } from "../../middlewares/authenticate"
import Anthropic from "@anthropic-ai/sdk"

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 90000 })
}

const router = express.Router()

// ดึง properties ที่ admin คนนี้ดูแล
router.get("/admin/properties", authenticate, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).user.id
    const data = await service.getAdminProperties(userId)
    res.json(data)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
})

// ดึงห้องทั้งหมดใน property พร้อมข้อมูลมิเตอร์เดือนนั้น
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

// บันทึกมิเตอร์แต่ละห้อง
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

// AI อ่านมิเตอร์จากรูปภาพ
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
          'ภาพอาจถูกหมุน — ให้มองหาข้อความ "หน่วยลูกบาศก์เมตร" หรือ "หน่วยลิตร" หรือ "DUSS" แล้วหมุนภาพในใจให้ตรงก่อน\n\n' +
          'เลขห้อง: มองหาสติ๊กเกอร์ที่ติดทีหลังบนหน้าปัด เช่น วงกลมสีแดงมีตัวเลขขนาดใหญ่ → roomNumber หรือ null\n\n' +
          'ค่ามิเตอร์:\n' +
          '  - หน้าปัดมีช่องตัวเลข 2 กลุ่ม: 4 ช่องใต้คำว่า "หน่วยลูกบาศก์เมตร" และ 3 ช่องใต้คำว่า "หน่วยลิตร"\n' +
          '  - อ่านเฉพาะ 4 ช่องที่อยู่ใต้ "หน่วยลูกบาศก์เมตร" เท่านั้น ตัดศูนย์นำหน้า\n' +
          '  - อ่านเฉพาะตัวเลขสีดำเท่านั้น ห้ามอ่านตัวเลขสีแดงหรือตัวเลขที่อยู่ในกรอบสีแดง\n' +
          '  - 3 ช่องใต้ "หน่วยลิตร" ละเว้นทั้งหมด แม้จะเบลอหรือกำลังหมุนอยู่ก็ไม่ต้องสนใจ\n' +
          '  - กฎเด็ดขาด: ทุกหลักใน 4 ช่อง cubic ต้องมองเห็นชัดเจน 100% ถึงจะอ่านได้\n' +
          '  - ถ้ามีเงาบัง / แสงจ้า / เบลอ / เห็นครึ่งตัว / สงสัยแม้แต่หลักเดียว → cubic = null ทันที ห้ามเดาโดยเด็ดขาด\n' +
          '  - การเดาค่าที่ไม่ชัดเจนถือว่าผิดร้ายแรงกว่าการคืน null\n\n' +
          'ตอบ JSON เท่านั้น เริ่มด้วย { ทันที:\n' +
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
        const jsonMatches = text.match(/\{[^{}]*\}/g)
        const clean = jsonMatches ? jsonMatches[jsonMatches.length - 1] : '{}'
        const parsed = JSON.parse(clean)
        const roomNumber = parsed.roomNumber != null ? String(parsed.roomNumber).trim() : null

        let meterValue: number | null = null
        if (parsed.cubic != null) {
          meterValue = Math.floor(Number(parsed.cubic))
          if (meterValue >= 10000) {
            meterValue = Math.floor(meterValue / Math.pow(10, Math.floor(Math.log10(meterValue)) - 3))
          }
        } else if (parsed.meterValue != null) {
          meterValue = Math.floor(Number(parsed.meterValue))
        }

        results.push({ roomNumber, meterValue, type: img.type })
      } catch {
        results.push({ roomNumber: null, meterValue: null, type: img.type })
      }
    }

    res.json(results)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
