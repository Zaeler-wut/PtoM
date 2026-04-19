// profileModel.ts (mobile) — TypeScript types สำหรับ profile module ฝั่ง mobile
// ใช้เป็น input/return type ของ profileService และ profileRouter

// ข้อมูลโปรไฟล์ทั้งหมดที่ส่งกลับเมื่อ tenant ดูโปรไฟล์ตัวเอง
export interface ProfileResponse {
  // ข้อมูลส่วนตัว
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: string

  // ห้องพักปัจจุบัน (array ว่างถ้าไม่มีสัญญา active)
  currentRooms: CurrentRoomInfo[]

  // สรุปบิล
  billSummary: BillSummary
}

// ข้อมูลห้องพักที่ผูกกับสัญญา active ของ tenant
export interface CurrentRoomInfo {
  propertyName: string
  roomNumber: string
  roomType: string
  startDate: string
  monthlyRent: number          // roomPrice + furniturePrice รวมกัน
  roomPrice: number
  furniturePrice: number | null
  status: string               // ACTIVE | MOVE_OUT_NOTICE | ENDED
}

// สรุปจำนวนบิลแบ่งตามสถานะ — แสดงบนหน้าโปรไฟล์
export interface BillSummary {
  total: number           // จำนวนบิลทั้งหมด
  paid: number            // ชำระแล้ว
  unpaid: number          // รอชำระ (PENDING + VERIFYING)
}

// input สำหรับ PUT /profile — แก้ไขข้อมูลส่วนตัว
export interface UpdateProfileInput {
  firstName: string
  lastName: string
  phone?: string
}

// ข้อมูลที่ส่งกลับหลัง update สำเร็จ
export interface UpdateProfileResponse {
  id: string
  firstName: string
  lastName: string
  phone: string | null
}
