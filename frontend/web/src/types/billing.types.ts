import type { User } from "./auth.types";
import type { Room } from "./room.types";
import type { Contract } from "./contract.types";

// ── Enums ─────────────────────────────────────────────────────────────────────
export type BillStatus = "DRAFT" | "READY" | "PENDING" | "VERIFYING" | "PAID";
export type PaymentStatus = "PENDING" | "VERIFYING" | "CONFIRMED" | "REJECTED";

// ── Bill ──────────────────────────────────────────────────────────────────────
export interface BillItem {
  id: string;
  billId: string;
  title: string;
  amount: number;
}

export interface Bill {
  id: string;
  contractId: string;
  roomId: string;
  userId: string;
  month: number | null;
  year: number | null;
  roomRent: number;
  furnitureRent: number | null;
  total: number;
  status: BillStatus;
  pdfUrl: string | null;
  createdAt: string;

  // relations
  items?: BillItem[];
  payments?: Payment[];
  contract?: Contract;
  room?: Room;
  user?: User;
}

// ── Payment ───────────────────────────────────────────────────────────────────
export interface Payment {
  id: string;
  userId: string;
  billId: string;
  amount: number;
  slipUrl: string | null;
  status: PaymentStatus;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;

  // relations
  user?: User;
  bill?: Bill;
}

// ── Summary (GET billing/summary) ─────────────────────────────────────────────
export interface BillingSummary {
  totalBills: number;
  totalPaid: number;
  totalPending: number;
  totalRevenue: number;
  bills: Bill[];
}

// ── Invoice Realtime (GET billing/:contractId/invoice) ────────────────────────
export interface InvoicePreview {
  contractId: string;
  month: number;
  year: number;
  roomRent: number;
  furnitureRent: number | null;
  items: { title: string; amount: number }[];
  waterUsage: number;
  electricUsage: number;
  waterCharge: number;
  electricCharge: number;
  total: number;
}

// ── Fixed Fees (GET billing/:contractId/fees) ─────────────────────────────────
export interface ContractFees {
  contractId: string;
  fees: { title: string; amount: number }[];
}

// ── Payloads ──────────────────────────────────────────────────────────────────
export interface UpdateMeterPayload {
  waterMeter: number;
  electricMeter: number;
}

// ── Redux State ───────────────────────────────────────────────────────────────
export interface BillingState {
  summary: BillingSummary | null;
  payments: Payment[];
  selectedPayment: Payment | null;
  invoice: InvoicePreview | null;
  fees: ContractFees | null;
  month: number;
  year: number;
  isLoading: boolean;
  error: string | null;
}
