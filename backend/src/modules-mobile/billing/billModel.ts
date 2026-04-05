export interface BillListResponse {
  totalUnpaid: number  // ยอดค้างชำระทั้งหมด
  bills: BillCardItem[]
}

export interface BillCardItem {
  billId: string
  propertyName: string
  billingPeriod: string  // "01 - 28 ก.พ. 2569"
  firstName: string
  lastName: string
  roomNumber: string
  roomRent: number
  electricCharge: number
  waterCharge: number
  extraFees: { title: string; amount: number }[]  // ค่าบริการคงที่
  total: number
  status: BillStatus
  dueDate: string | null  // วันครบกำหนด
  pdfUrl: string | null
}

// PAYMENT INFO (หน้าชำระเงิน)
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

// SUBMIT PAYMENT
export interface SubmitPaymentInput {
  slipUrl: string
  amount: number
}

export interface SubmitPaymentResponse {
  paymentId: string
  propertyName: string
  billingPeriod: string
  amount: number
  status: "VERIFYING"
}

export type BillStatus = "PENDING" | "VERIFYING" | "PAID" | "DRAFT" | "READY"
