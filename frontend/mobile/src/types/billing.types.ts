export type BillStatus = "DRAFT" | "READY" | "PENDING" | "VERIFYING" | "PAID"
export type PaymentStatus = "PENDING" | "VERIFYING" | "CONFIRMED" | "REJECTED"

export interface BillingSummaryCards {
  incomplete: number
  sent: number
  meterRecorded: number
  meterTotal: number
  meterPercent: number
  estimatedRevenue: number
}

export interface BillingTableRow {
  contractId: string
  contractStatus: string
  moveOutBillId: string | null
  roomNumber: string
  tenantName: string
  billingCycle: string
  waterPrev: number | null
  waterCurrent: number | null
  waterUsed: number | null
  electricPrev: number | null
  electricCurrent: number | null
  electricUsed: number | null
  total: number
  billStatus: BillStatus
  billId: string | null
}

export interface RoomFeesResponse {
  roomNumber: string
  fees: { title: string; amount: number }[]
  total: number
}

export interface InvoiceResponse {
  property: {
    name: string
    address: string
    bankName: string
    bankAccount: string
    bankHolder: string
    paymentQrUrl: string | null
    logoUrl: string | null
  }
  roomNumber: string
  roomType: string
  tenantName: string
  billingPeriod: string
  billingCycle: string
  items: { title: string; amount: number }[]
  total: number
  meter: {
    waterPrev: number
    waterCurrent: number
    waterUsed: number
    electricPrev: number
    electricCurrent: number
    electricUsed: number
  }
}

export interface UpdateMeterInput {
  waterMeter: number
  electricMeter: number
  waterPrev?: number
  electricPrev?: number
  additionalItems?: { title: string; amount: number }[]
}

export interface PaymentListItem {
  paymentId: string
  roomNumber: string
  tenantName: string
  amount: number
  slipUrl: string | null
  paidAt: string | null
  status: PaymentStatus
}

export interface PaymentDetail {
  paymentId: string
  roomNumber: string
  roomType: string | undefined
  amount: number
  slipUrl: string | null
  paidAt: string | null
  status: PaymentStatus
  verifiedAt?: string | null
  verifiedBy?: string | null
}
