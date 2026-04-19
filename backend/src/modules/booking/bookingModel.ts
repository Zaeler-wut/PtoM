// bookingModel.ts — TypeScript types สำหรับ booking module
// ใช้เป็น return type ของ bookingService และ type hint ใน bookingRouter

// ข้อมูล booking สำหรับแสดงในรายการ
export interface BookingListItem {
  bookingId: string
  firstName: string
  lastName: string
  phone: string | null
  roomNumber: string
  roomType: string
  moveInDate: Date
  bookingFee: number
  slipUrl: string
  status: BookingStatus
}

// ข้อมูล booking รายละเอียด — ขยายจาก BookingListItem เพิ่ม bookingDate
export interface BookingDetail extends BookingListItem {
  bookingDate: Date
}

// ข้อมูล booking สำหรับกรอกสัญญาเช่า — ครบทุก field ที่ต้องการ
export interface BookingContractPrefill {
  bookingId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  lineId: string | null
  address: string | null
  roomId: string | null
  roomNumber: string
  roomType: string
  moveInDate: Date
  securityDeposit: number
  advanceRent: number
  totalDeposit: number
  vehicles: { plateNumber: string; type: string }[]
}

// สถานะของ booking — CHECKED_IN คำนวณใน service (ไม่ได้เก็บใน DB ตรงๆ)
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED"

// ผลลัพธ์หลัง assign ห้องให้ booking สำเร็จ
export interface RoomAssignmentResult {
  bookingId: string
  roomId: string
  roomNumber: string
  assignedAt: Date
}
