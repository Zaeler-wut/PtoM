export interface ProfileResponse {
  // ข้อมูลส่วนตัว
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: string

  // ห้องพักปัจจุบัน (null ถ้าไม่มีสัญญา active)
  currentRoom: CurrentRoomInfo | null

  // สรุปบิล
  billSummary: BillSummary
}

export interface CurrentRoomInfo {
  propertyName: string
  roomNumber: string
  roomType: string
  startDate: string       // วันที่เข้าอยู่
  monthlyRent: number     // ค่าเช่าห้อง + ค่าเฟอร์นิเจอร์
  roomPrice: number
  furniturePrice: number | null
}

export interface BillSummary {
  total: number           // จำนวนบิลทั้งหมด
  paid: number            // ชำระแล้ว
  unpaid: number          // รอชำระ (PENDING + VERIFYING)
}

export interface UpdateProfileInput {
  firstName: string
  lastName: string
  phone?: string
}

export interface UpdateProfileResponse {
  id: string
  firstName: string
  lastName: string
  phone: string | null
}
