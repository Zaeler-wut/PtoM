import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"

// ─── TYPES ────────────────────────────────────────────────────

export type BillStatus = 'DRAFT' | 'READY' | 'PENDING' | 'VERIFYING' | 'PAID'
export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED'
export type ContractStatus = 'ACTIVE' | 'MOVE_OUT_NOTICE' | 'ENDED'

export interface BillFeeItem {
  title: string
  amount: number
}

export interface BillCard {
  billId: string
  propertyName: string
  billingPeriod: string
  firstName: string
  lastName: string
  roomNumber: string
  roomRent: number
  electricCharge: number
  waterCharge: number
  extraFees: BillFeeItem[]
  total: number
  status: BillStatus
  dueDate: string | null
  pdfUrl: string | null
}

export interface BillListResponse {
  totalUnpaid: number
  bills: BillCard[]
}

export interface BillPaymentInfo {
  billId: string
  propertyName: string
  billingPeriod: string
  total: number
  paymentQrUrl: string | null
  bankName: string
  bankAccount: string
  bankHolder: string
  items: BillFeeItem[]
}

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
  canCancel: boolean
}

export interface MyContractItem {
  contractId: string
  propertyName: string
  roomNumber: string
  contractDuration: string
  startDate: string
  endDate: string
  status: ContractStatus
  pdfUrl: string | null
}

// ─── API ──────────────────────────────────────────────────────

export const financeApi = {
  // บิล
  getBills: async (): Promise<BillListResponse> => {
    const res = await api.get(ENDPOINTS.mobileBills.list)
    return res.data
  },

  getBillPaymentInfo: async (billId: string): Promise<BillPaymentInfo> => {
    const res = await api.get(ENDPOINTS.mobileBills.paymentInfo(billId))
    return res.data
  },

  submitPayment: async (billId: string, slipUrl: string, amount: number) => {
    const res = await api.post(ENDPOINTS.mobileBills.submitPayment(billId), { slipUrl, amount })
    return res.data
  },

  uploadSlip: async (uri: string): Promise<string> => {
    const formData = new FormData()
    const filename = uri.split('/').pop() ?? 'slip.jpg'
    const match = /\.(\w+)$/.exec(filename)
    const type = match ? `image/${match[1]}` : 'image/jpeg'
    formData.append('file', { uri, name: filename, type } as any)
    const res = await api.post(ENDPOINTS.upload.image, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.url as string
  },

  // การจอง
  getMyBookings: async (): Promise<MyBookingItem[]> => {
    const res = await api.get(ENDPOINTS.mobileBookingsList.list)
    return res.data
  },

  cancelBooking: async (bookingId: string) => {
    const res = await api.delete(ENDPOINTS.mobileBookingsList.cancel(bookingId))
    return res.data
  },

  // สัญญา
  getMyContracts: async (): Promise<MyContractItem[]> => {
    const res = await api.get(ENDPOINTS.mobileContracts.list)
    return res.data
  },
}
