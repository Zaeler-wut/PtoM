import express from "express"
import * as service from "./meterService"
import { authenticate, type AuthenticatedRequest } from "../../middlewares/authenticate"
import Anthropic from "@anthropic-ai/sdk"

function getAnthropicClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 45000 })
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

    const results = await Promise.all(images.map(async (img) => {
      const prompt = img.type === 'electric'
        ? 'วิเคราะห์ภาพมิเตอร์ไฟฟ้าเพื่อสกัดข้อมูลเลขห้องและค่าหน่วยไฟ (kWh) โดยใช้หลักเกณฑ์ดังนี้:\n\n' +
          '1. การระบุทิศทางภาพ (Determine Orientation):\n' +
          '- ค้นหาคำว่า "kWh", "MITSUBISHI" หรือ "International Power Group" บนหน้าปัด\n' +
          '- หากคำเหล่านี้กลับหัวหรือเอียง ให้ปรับทิศทางการประมวลผลให้อักษรเหล่านี้อยู่ในระนาบปกติก่อนอ่านข้อมูล\n\n' +
          '2. การสกัดหมายเลขห้อง (Room Number):\n' +
          '- ค้นหาเลขห้องจากสติ๊กเกอร์ที่ติดเพิ่มบนตัวเครื่อง (ไม่ใช่ส่วนประกอบดั้งเดิมของมิเตอร์)\n' +
          '- สติ๊กเกอร์อาจเป็นทรงใดก็ได้ สีใดก็ได้ และอาจมีตัวอักษรผสม เช่น A11, B3\n' +
          '- เลขห้องอาจเป็นเลขไทย (๑,๒,๓) ให้แปลงเป็นเลขอารบิก\n' +
          '- ให้อ่านเลขห้องตามทิศทางเดียวกับตัวเลขมิเตอร์หลักเสมอ วิธีนี้ช่วยแยก 6 กับ 9 ได้\n' +
          '- ถ้าไม่มีสติ๊กเกอร์ที่ชัดเจน → null\n\n' +
          '3. การอ่านค่าไฟฟ้า (Reading Value):\n' +
          '- แบบ Digital: อ่านตัวเลขบนจอ LCD ที่อยู่หน้าหน่วย kWh ตรงๆ ไม่มีทศนิยม ใช้ค่าที่เห็นได้เลย\n' +
          '- แบบ Analog (ลูกกลิ้ง): อ่านเฉพาะ 4 หลักหลัก (kWh) เท่านั้น ไม่ต้องสนใจหลักอื่นนอกจากนี้\n\n' +
          'กฎเหล็ก:\n' +
          '- ถ้ามีแสงสะท้อน แสงบัง หรือเห็นตัวเลขไม่ครบ/ไม่ต่อเนื่อง → null ทันที ห้ามเดาเด็ดขาด\n' +
          '- ต้องเห็นตัวเลขชัดเจนครบทุกหลักจึงจะอ่านได้ ถ้าหลักใดไม่ชัดให้ถือว่าอ่านไม่ได้ทั้งค่า\n\n' +
          'ตอบกลับเป็น JSON เท่านั้น: {"roomNumber":"101","meterValue":1234}\n' +
          'ถ้าอ่านค่าใดไม่ได้ให้ใส่ null'
        : 'วิเคราะห์ภาพมิเตอร์น้ำนี้เพื่อสกัดข้อมูลเลขห้องและค่ามิเตอร์ โดยใช้หลักเกณฑ์ทางตรรกะและโครงสร้างภาพดังนี้:\n\n' +
          '1. การระบุทิศทางภาพ (Orientation Detection):\n' +
          '- ค้นหาคำว่า "ลูกบาศก์เมตร" หรือ "ลิตร" บนหน้าปัดมิเตอร์\n' +
          '- ทิศทางที่อ่านคำเหล่านี้ได้ปกติ (ไม่กลับหัว) ให้ถือเป็นทิศทางที่ถูกต้องในการอ่านตัวเลขทั้งหมด\n\n' +
          '2. การอ่านหมายเลขห้องจากสติ๊กเกอร์ (Room Number with Underline Logic):\n' +
          '- ค้นหาสติ๊กเกอร์หรือป้ายที่ติดเพิ่มภายหลัง ไม่ใช่ส่วนประกอบดั้งเดิมของมิเตอร์\n' +
          '- สติ๊กเกอร์อาจเป็นทรงใดก็ได้ (วงกลม สี่เหลี่ยม หรืออื่นๆ) และสีใดก็ได้ ไม่จำเป็นต้องสีน้ำเงิน\n' +
          '- เลขห้องอาจเป็นตัวเลขอย่างเดียว (1, 2, 9) หรือผสมตัวอักษร เช่น A11, B3, 101 ก็ได้\n' +
          '- เลขห้องอาจเป็นเลขไทย (๑,๒,๓) ให้แปลงเป็นเลขอารบิก\n' +
          '- กฎพิเศษแยก 6 กับ 9: หากพบขีดเส้นใต้บนตัวเลข ให้ถือว่าเส้นนั้นคือฐานล่างเสมอ (เลข 6 ขีดเส้นใต้ = อ่านว่า 6 ไม่ใช่ 9 กลับหัว)\n' +
          '- หากไม่มีขีดเส้นใต้ ให้อ่านตามทิศทางเดียวกับ "ลูกบาศก์เมตร"\n' +
          '- ถ้าไม่มีสติ๊กเกอร์ที่ชัดเจน → null\n\n' +
          '3. การอ่านค่ามิเตอร์ (Meter Reading):\n' +
          '- อ่านตัวเลขในช่องสี่เหลี่ยมเรียงจากซ้ายไปขวาตามทิศทางที่ระบุในข้อ 1\n' +
          '- cubic_meters: ชุดเลข 4–5 หลักแรกที่มีพื้นหลังสีดำ\n' +
          '- liters: ชุดเลข 2–3 หลักสุดท้ายที่มีพื้นหลังสีแดง\n' +
          '- ตัวเลขที่ปั๊ม/แกะสลักบนขอบทองเหลืองรอบนอก = Serial Number ไม่ใช่ค่ามิเตอร์\n\n' +
          '4. การจัดการตัวเลขที่คาบเกี่ยว (Digit Rolling):\n' +
          '- หากตัวเลขในช่องกำลังเลื่อน (เห็นสองเลขในช่องเดียว) ให้เลือกเลขที่ปรากฏเต็มหลักมากกว่า\n\n' +
          '5. การคำนวณผลลัพธ์:\n' +
          '- นำ cubic_meters (ตัดศูนย์นำหน้า) ถ้า liters ไม่ใช่ 0 → บวก 1\n' +
          '- ตัวอย่าง: cubic=0004 liters=72 → meterValue=5\n' +
          '- ตัวอย่าง: cubic=0009 liters=9  → meterValue=10\n' +
          '- ตัวอย่าง: cubic=0042 liters=0  → meterValue=42\n\n' +
          'กฎเหล็ก:\n' +
          '- ถ้ามีแสงสะท้อน แสงบัง หรือเห็นตัวเลขไม่ครบ/ไม่ต่อเนื่อง → null ทันที ห้ามเดาเด็ดขาด\n' +
          '- ต้องเห็นตัวเลขชัดเจนครบทุกหลักจึงจะอ่านได้ ถ้าหลักใดหลักหนึ่งไม่ชัดให้ถือว่าอ่านไม่ได้ทั้งค่า\n\n' +
          'ตอบกลับเป็น JSON เท่านั้น: {"roomNumber":"1","meterValue":5}\n' +
          'ถ้าอ่านค่าใดไม่ได้ให้ใส่ null'

      const response = await getAnthropicClient().messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
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

      try {
        const parsed = JSON.parse(clean)
        return {
          roomNumber: parsed.roomNumber != null ? String(parsed.roomNumber).trim() : null,
          meterValue: parsed.meterValue != null ? Math.ceil(Number(parsed.meterValue)) : null,
          type: img.type,
        }
      } catch {
        return { roomNumber: null, meterValue: null, type: img.type }
      }
    }))

    res.json(results)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
