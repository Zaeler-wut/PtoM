// billingApi.ts (web) — API calls สำหรับระบบเรียกเก็บเงินฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก billingSlice.ts และ BillingPage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type {
  BillingTableRow,
  BillingSummaryCards,
  RoomFeesResponse,
  InvoiceResponse,
  UpdateMeterInput,
  PaymentListItem,
} from "../../types/billing.types"

// GET /api/admin/properties/:propertyId/billing/summary?month=&year= — ดึงสรุปบิลเดือนที่ระบุ
export const getBillingSummary = (propertyId: string, month: number, year: number) =>
  api.get<{ summary: BillingSummaryCards; bills: BillingTableRow[] }>(
    ENDPOINTS.billing.summary(propertyId),
    { params: { month, year } }
  ).then((r) => r.data)

// GET /api/admin/properties/:propertyId/billing/:contractId/fees — ดึงค่าใช้จ่ายห้องสำหรับคำนวณบิล
export const getRoomFees = (propertyId: string, contractId: string) =>
  api.get<RoomFeesResponse>(ENDPOINTS.billing.fees(propertyId, contractId)).then((r) => r.data)

// GET /api/admin/properties/:propertyId/billing/:contractId/invoice?month=&year= — ดึง invoice realtime
export const getInvoice = (propertyId: string, contractId: string, month: number, year: number) =>
  api.get<InvoiceResponse>(
    ENDPOINTS.billing.invoice(propertyId, contractId),
    { params: { month, year } }
  ).then((r) => r.data)

// PUT /api/admin/properties/:propertyId/billing/:contractId/meter?month=&year= — บันทึก/แก้ไขมิเตอร์และ items
export const updateMeter = (
  propertyId: string, contractId: string, month: number, year: number, data: UpdateMeterInput
) =>
  api.put(ENDPOINTS.billing.updateMeter(propertyId, contractId), data, { params: { month, year } })
    .then((r) => r.data)

// POST /api/admin/properties/:propertyId/billing/:contractId/send?month=&year= — ส่งบิลให้ tenant เดียว
export const sendBill = (propertyId: string, contractId: string, month: number, year: number) =>
  api.post(ENDPOINTS.billing.sendBill(propertyId, contractId), {}, { params: { month, year } })
    .then((r) => r.data)

// POST /api/admin/properties/:propertyId/billing/send-all?month=&year= — ส่งบิลทุกห้องพร้อมกัน
export const sendAllBills = (propertyId: string, month: number, year: number) =>
  api.post(ENDPOINTS.billing.sendAll(propertyId), {}, { params: { month, year } })
    .then((r) => r.data)

// GET /api/admin/properties/:propertyId/billing/payments?month=&year= — ดึงรายการ payment ที่รอยืนยัน
export const getPayments = (propertyId: string, month: number, year: number) =>
  api.get<PaymentListItem[]>(ENDPOINTS.billing.payments(propertyId), { params: { month, year } })
    .then((r) => r.data)

// POST /api/admin/properties/:propertyId/billing/bills/:billId/payment — admin บันทึกการชำระเงินเอง
export const submitPaymentByAdmin = (propertyId: string, billId: string, slipUrl?: string) =>
  api.post(ENDPOINTS.billing.submitPayment(propertyId, billId), { slipUrl }).then((r) => r.data)

// POST /upload/image — upload สลิปเพื่อให้ได้ URL ก่อน submitPayment
export const uploadSlipImage = (file: File) => {
  const form = new FormData()
  form.append("file", file)
  return api.post<{ url: string }>("/upload/image", form).then((r) => r.data)
}

// PATCH /api/admin/properties/:propertyId/billing/payments/:paymentId/confirm — ยืนยันการชำระเงิน
export const confirmPayment = (propertyId: string, paymentId: string) =>
  api.patch(ENDPOINTS.billing.confirmPayment(propertyId, paymentId), {}).then((r) => r.data)

// PATCH /api/admin/properties/:propertyId/billing/payments/:paymentId/reject — ปฏิเสธการชำระเงิน
export const rejectPayment = (propertyId: string, paymentId: string) =>
  api.patch(ENDPOINTS.billing.rejectPayment(propertyId, paymentId), {}).then((r) => r.data)

// GET /api/admin/properties/:propertyId/billing/available-months — เดือนที่มีข้อมูลบิล (สำหรับ dropdown)
export const getAvailableMonths = (propertyId: string) =>
  api.get<{ month: number; year: number }[]>(ENDPOINTS.billing.availableMonths(propertyId)).then((r) => r.data)
