export interface BookingInfoResponse {
  // กรอบบนสุดที่แสดงตลอด
  propertyName: string
  roomTypeName: string
  roomPrice: number
  bookingFee: number
  // ข้อมูลการชำระเงิน (สำหรับหน้าชำระ)
  payment: {
    paymentQrUrl: string | null
    bankName: string
    bankAccount: string
    bankHolder: string
  }
  // วันที่เข้าอยู่ล่วงหน้าได้สูงสุด
  maxMoveInDate: string // 45 วัน
  minMoveInDate: string // วันพรุ่งนี้
}
//Create booking
export interface CreateBookingInput {
  moveInDate: string  // ISO string
  slipUrl: string     // url ของสลิปที่ upload ไป storage แล้ว
}

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


export interface CancelBookingResponse {
  message: string
  bookingId: string
  status: "CANCELLED"
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED"


export interface MyBookingItem {
  bookingId: string
  propertyName: string
  roomTypeName: string
  roomNumber: string | null
  firstName: string
  lastName: string
  moveInDate: string
  bookingFee: number
  roomPrice: number
  createdAt: string
  status: BookingStatus
  canCancel: boolean  // true ถ้า status = PENDING
}
