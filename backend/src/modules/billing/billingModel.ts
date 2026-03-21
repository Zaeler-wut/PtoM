export interface BillingSummary {
  summary: BillingSummaryCards
  bills: BillingTableRow[]
}

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
  items: BillLineItem[]
  total: number
  meter: MeterInfo
}

export interface BillLineItem {
  title: string
  amount: number
}

export interface MeterInfo {
  waterPrev: number
  waterCurrent: number
  waterUsed: number
  electricPrev: number
  electricCurrent: number
  electricUsed: number
}

export interface UpdateMeterInput {
  waterMeter: number
  electricMeter: number
  additionalItems?: { title: string; amount: number }[]
}


export interface SendBillResponse {
  billId: string
  total: number
  status: BillStatus
}

export interface SendAllBillsResponse {
  total: number
  success: number
  failed: number
}

export interface PaymentListItem {
  paymentId: string
  roomNumber: string
  tenantName: string
  amount: number
  slipUrl: string | null
  paidAt: Date
  status: PaymentStatus
}

export interface PaymentDetail {
  paymentId: string
  roomNumber: string
  roomType: string | undefined
  amount: number
  slipUrl: string | null
  paidAt: Date
  status: PaymentStatus
  verifiedAt?: Date | null
  verifiedBy?: string | null
}

export type BillStatus = "DRAFT" | "READY" | "PENDING" | "VERIFYING" | "PAID"
export type PaymentStatus = "PENDING" | "VERIFYING" | "CONFIRMED" | "REJECTED"
