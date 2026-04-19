// bookingModel.ts (mobile) — TypeScript types สำหรับ booking module ฝั่ง mobile
// ใช้เป็น input/return type ของ bookingService และ bookingRouter

// ข้อมูลที่ใช้แสดงก่อนยืนยันการจอง — แสดงราคา ข้อมูลชำระ และวันที่เข้าอยู่ที่เลือกได้
export interface BookingInfoResponse {
  // กรอบบนสุดที่แสดงตลอด
  propertyName: string
  roomTypeName: string
  roomPrice: number
  furniturePrice: number
  bookingFee: number
  // ข้อมูลการชำระเงิน (สำหรับหน้าชำระ)
  payment: {
    paymentQrUrl: string | null
    bankName: string
    bankAccount: string
    bankHolder: string
  }
  // วันที่เข้าอยู่ล่วงหน้าได้สูงสุด
  maxMoveInDate: string // 45 วันนับจากวันนี้
  minMoveInDate: string // วันพรุ่งนี้ หรือวันที่ห้องพร้อมเร็วสุด (ถ้าไม่มีห้อง AVAILABLE)
}

// input สำหรับ POST /bookings — สร้างการจองใหม่
export interface CreateBookingInput {
  moveInDate: string  // ISO string
  slipUrl: string     // url ของสลิปที่ upload ไป storage แล้ว
}

// ข้อมูลที่ส่งกลับหลังสร้างการจองสำเร็จ
export interface CreateBookingResponse {
  bookingId: string
  propertyName: string
  roomTypeName: string
  roomPrice: number
  bookingFee: number
  moveInDate: string
  firstName: string
  lastName: string
  status: BookingStatus
  paidAmount: number  // = bookingFee
}

// ข้อมูลที่ส่งกลับหลังยกเลิกการจองสำเร็จ
export interface CancelBookingResponse {
  message: string
  bookingId: string
  status: "CANCELLED"
}

// สถานะการจองที่เป็นไปได้ทั้งหมด
export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED"

// ข้อมูลการจองหนึ่งรายการในหน้า "การจองของฉัน"
export interface MyBookingItem {
  bookingId: string
  propertyName: string
  roomTypeName: string
  roomNumber: string | null     // null ถ้า admin ยังไม่ assign ห้อง
  firstName: string
  lastName: string
  moveInDate: string
  bookingFee: number
  roomPrice: number
  createdAt: string
  status: BookingStatus
  canCancel: boolean  // true ถ้า status = PENDING หรือ CONFIRMED
}
