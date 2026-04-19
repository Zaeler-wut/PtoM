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

export interface CurrentRoomInfo {
  propertyName: string
  roomNumber: string
  roomType: string
  startDate: string
  monthlyRent: number
  roomPrice: number
  furniturePrice: number | null
  status: string
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
