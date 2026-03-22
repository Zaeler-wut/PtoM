import { axiosInstance } from "../axiosInstance";
import { BILLING_ENDPOINTS } from "../endpoints";
import type {
  BillingSummary,
  InvoicePreview,
  ContractFees,
  Payment,
  PaymentStatus,
} from "../../types/billing.types";

export const billingApi = {
  // ── Summary + Bills ────────────────────────────────────────────────────────
  getSummary: async (
    propertyId: string,
    month: number,
    year: number
  ): Promise<BillingSummary> => {
    const { data } = await axiosInstance.get<BillingSummary>(
      BILLING_ENDPOINTS.SUMMARY(propertyId, month, year)
    );
    return data;
  },

  // ── Fees ───────────────────────────────────────────────────────────────────
  getFees: async (
    propertyId: string,
    contractId: string
  ): Promise<ContractFees> => {
    const { data } = await axiosInstance.get<ContractFees>(
      BILLING_ENDPOINTS.FEES(propertyId, contractId)
    );
    return data;
  },

  // ── Invoice Preview (realtime) ─────────────────────────────────────────────
  getInvoice: async (
    propertyId: string,
    contractId: string,
    month: number,
    year: number
  ): Promise<InvoicePreview> => {
    const { data } = await axiosInstance.get<InvoicePreview>(
      BILLING_ENDPOINTS.INVOICE(propertyId, contractId, month, year)
    );
    return data;
  },

  // ── Meter ──────────────────────────────────────────────────────────────────
  updateMeter: async (
    propertyId: string,
    contractId: string,
    month: number,
    year: number,
    payload: { waterMeter: number; electricMeter: number }
  ): Promise<void> => {
    await axiosInstance.put(
      BILLING_ENDPOINTS.UPDATE_METER(propertyId, contractId, month, year),
      payload
    );
  },

  // ── Send Bills ─────────────────────────────────────────────────────────────
  sendBill: async (
    propertyId: string,
    contractId: string,
    month: number,
    year: number
  ): Promise<void> => {
    await axiosInstance.post(
      BILLING_ENDPOINTS.SEND_BILL(propertyId, contractId, month, year)
    );
  },

  sendAll: async (
    propertyId: string,
    month: number,
    year: number
  ): Promise<void> => {
    await axiosInstance.post(
      BILLING_ENDPOINTS.SEND_ALL(propertyId, month, year)
    );
  },

  // ── Payments ───────────────────────────────────────────────────────────────
  getPayments: async (
    propertyId: string,
    month: number,
    year: number,
    status?: PaymentStatus
  ): Promise<Payment[]> => {
    const { data } = await axiosInstance.get<Payment[]>(
      BILLING_ENDPOINTS.PAYMENTS(propertyId, month, year, status)
    );
    return data;
  },

  getPaymentDetail: async (
    propertyId: string,
    paymentId: string
  ): Promise<Payment> => {
    const { data } = await axiosInstance.get<Payment>(
      BILLING_ENDPOINTS.PAYMENT_DETAIL(propertyId, paymentId)
    );
    return data;
  },

  confirmPayment: async (
    propertyId: string,
    paymentId: string
  ): Promise<Payment> => {
    const { data } = await axiosInstance.patch<Payment>(
      BILLING_ENDPOINTS.CONFIRM_PAYMENT(propertyId, paymentId)
    );
    return data;
  },

  rejectPayment: async (
    propertyId: string,
    paymentId: string
  ): Promise<Payment> => {
    const { data } = await axiosInstance.patch<Payment>(
      BILLING_ENDPOINTS.REJECT_PAYMENT(propertyId, paymentId)
    );
    return data;
  },
};
