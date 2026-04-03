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

export const getBillingSummary = (propertyId: string, month: number, year: number) =>
  api.get<{ summary: BillingSummaryCards; bills: BillingTableRow[] }>(
    ENDPOINTS.billing.summary(propertyId),
    { params: { month, year } }
  ).then((r) => r.data)

export const getRoomFees = (propertyId: string, contractId: string) =>
  api.get<RoomFeesResponse>(ENDPOINTS.billing.fees(propertyId, contractId)).then((r) => r.data)

export const getInvoice = (propertyId: string, contractId: string, month: number, year: number) =>
  api.get<InvoiceResponse>(
    ENDPOINTS.billing.invoice(propertyId, contractId),
    { params: { month, year } }
  ).then((r) => r.data)

export const updateMeter = (
  propertyId: string, contractId: string, month: number, year: number, data: UpdateMeterInput
) =>
  api.put(ENDPOINTS.billing.updateMeter(propertyId, contractId), data, { params: { month, year } })
    .then((r) => r.data)

export const sendBill = (propertyId: string, contractId: string, month: number, year: number) =>
  api.post(ENDPOINTS.billing.sendBill(propertyId, contractId), {}, { params: { month, year } })
    .then((r) => r.data)

export const sendAllBills = (propertyId: string, month: number, year: number) =>
  api.post(ENDPOINTS.billing.sendAll(propertyId), {}, { params: { month, year } })
    .then((r) => r.data)

export const getPayments = (propertyId: string, month: number, year: number) =>
  api.get<PaymentListItem[]>(ENDPOINTS.billing.payments(propertyId), { params: { month, year } })
    .then((r) => r.data)

export const submitPaymentByAdmin = (propertyId: string, billId: string, slipUrl?: string) =>
  api.post(ENDPOINTS.billing.submitPayment(propertyId, billId), { slipUrl }).then((r) => r.data)

export const uploadSlipImage = (file: File) => {
  const form = new FormData()
  form.append("file", file)
  return api.post<{ url: string }>("/upload/image", form).then((r) => r.data)
}

export const confirmPayment = (propertyId: string, paymentId: string) =>
  api.patch(ENDPOINTS.billing.confirmPayment(propertyId, paymentId), {}).then((r) => r.data)

export const rejectPayment = (propertyId: string, paymentId: string) =>
  api.patch(ENDPOINTS.billing.rejectPayment(propertyId, paymentId), {}).then((r) => r.data)
