// contractModel.ts — TypeScript types สำหรับ contract module
// ใช้เป็น return type ของ contractService และ input type ของ contractRouter

// ข้อมูลสัญญาสำหรับแสดงในรายการ
export interface ContractListItem {
  contractId: string
  firstName: string
  lastName: string
  roomNumber: string
  contractType: ContractType
  status: ContractStatus
  startDate: Date
  endDate: Date
  duration: string
  pdfUrl: string | null
}

// ข้อมูลสัญญารายละเอียด — รวมผู้เช่า ห้อง ยานพาหนะ และข้อมูลการเงิน
export interface ContractDetail {
  contractId: string
  contractType: ContractType
  status: ContractStatus
  startDate: Date
  endDate: Date
  createdAt: Date
  duration: string
  pdfUrl: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
  }
  room: {
    roomNumber: string
    roomType: string
    roomPrice: number
  }
  vehicles: { plateNumber: string; type: string }[]
  financial: {
    securityDeposit: number
    advanceRent: number
    waterRate: number
    electricRate: number
    furniturePrice: number | null
  }
}

// input สำหรับสร้างสัญญาใหม่ (ทั้ง ONLINE และ OFFLINE)
export interface CreateContractInput {
  bookingId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  lineId?: string
  houseNumber?: string
  soi?: string
  road?: string
  subDistrict?: string
  district?: string
  province?: string
  roomId: string
  startDate: string
  endDate: string
  securityDeposit: number
  pdfUrl?: string
  vehicles?: { plateNumber: string; type: string }[]
}

// input สำหรับแก้ไขสัญญา — ทุก field เป็น optional
export interface UpdateContractInput {
  status?: ContractStatus
  moveOutNoticeDate?: string
  firstName?: string
  lastName?: string
  roomId?: string
  startDate?: string
  endDate?: string
  vehicles?: { plateNumber: string; type: string }[]
}

// ผลลัพธ์หลังสร้างหรืออัปเดตสัญญา
export interface ContractResponse {
  contractId: string
  contractType: ContractType
  roomNumber: string
  roomType: string
  startDate: Date
  endDate: Date
  securityDeposit: number
  pdfUrl?: string | null
  status: ContractStatus
}

// สถานะสัญญา — ENDED เปลี่ยนกลับไม่ได้
export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
// ประเภทสัญญา — ONLINE มาจาก booking, OFFLINE มาจาก walk-in
export type ContractType = "ONLINE" | "OFFLINE"
