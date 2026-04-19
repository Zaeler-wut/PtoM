// billModel.ts (mobile) — TypeScript types สำหรับ billing module ฝั่ง mobile
// ใช้เป็น input/return type ของ billService และ billRouter

// ข้อมูลรายการบิลทั้งหมด — แสดงในแท็บ "บิล" ของ mobile app
export interface BillListResponse {
  totalUnpaid: number  // ยอดค้างชำระทั้งหมด (PENDING + VERIFYING)
  bills: BillCardItem[]
}

// ข้อมูลบิลหนึ่งรายการสำหรับแสดงใน card
export interface BillCardItem {
  billId: string
  propertyName: string
  billingPeriod: string  // เช่น "01 - 28 ก.พ. 2569"
  firstName: string
  lastName: string
  roomNumber: string
  items: { title: string; amount: number }[]
  total: number
  status: BillStatus
  dueDate: string | null  // วันครบกำหนด (null ถ้ายังไม่กำหนด)
  pdfUrl: string | null   // URL ของ PDF invoice ที่ generate แล้ว
}

// ข้อมูลสำหรับหน้าชำระเงิน — แสดงราคา รายละเอียด และช่องทางชำระ
export interface BillPaymentInfoResponse {
  billId: string
  propertyName: string
  billingPeriod: string
  total: number
  // QR / ธนาคาร
  paymentQrUrl: string | null
  bankName: string
  bankAccount: string
  bankHolder: string
  // รายละเอียดค่าใช้จ่าย
  items: { title: string; amount: number }[]
}

// input สำหรับ POST /bills/:billId/payments — ส่งหลักฐานการชำระเงิน
export interface SubmitPaymentInput {
  slipUrl: string   // URL ของสลิปที่ upload ไปแล้ว
  amount: number    // จำนวนเงินที่ชำระ
}

// ข้อมูลที่ส่งกลับหลังส่งหลักฐานชำระเงินสำเร็จ
export interface SubmitPaymentResponse {
  paymentId: string
  propertyName: string
  billingPeriod: string
  amount: number
  status: "VERIFYING"  // สถานะหลังส่งสลิปเสมอ = VERIFYING (รอ admin ตรวจสอบ)
}

// สถานะบิลที่เป็นไปได้ทั้งหมด
export type BillStatus = "PENDING" | "VERIFYING" | "PAID" | "DRAFT" | "READY"
