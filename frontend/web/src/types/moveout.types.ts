import type { User } from "./auth.types";
import type { Room } from "./room.types";
import type { Contract } from "./contract.types";

// ── Enums ─────────────────────────────────────────────────────────────────────
export type MoveOutBillStatus = "DRAFT" | "CONFIRMED" | "COMPLETED";

// ── Move Out Bill ─────────────────────────────────────────────────────────────
export interface MoveOutBillItem {
  id: string;
  moveOutBillId: string;
  title: string;
  amount: number;
}

export interface MoveOutBill {
  id: string;
  contractId: string;
  roomId: string;
  userId: string;
  moveOutDate: string;
  waterStart: number;
  waterEnd: number;
  electricStart: number;
  electricEnd: number;
  totalCharge: number;
  refundAmount: number;
  billingStartDay: number | null;
  billingEndDay: number | null;
  status: MoveOutBillStatus;
  createdAt: string;

  // relations
  items?: MoveOutBillItem[];
  contract?: Contract;
  room?: Room;
  user?: User;
}

// ── Preview (POST move-out/:contractId/preview) ───────────────────────────────
export interface MoveOutPreview {
  contractId: string;
  moveOutDate: string;
  waterStart: number;
  waterEnd: number;
  electricStart: number;
  electricEnd: number;
  waterCharge: number;
  electricCharge: number;
  proRatedRent: number;
  damages: number;
  totalCharge: number;
  securityDeposit: number;
  refundAmount: number;
  items: { title: string; amount: number }[];
}

// ── Payloads ──────────────────────────────────────────────────────────────────
export interface MoveOutPreviewPayload {
  moveOutDate: string;
  waterEnd: number;
  electricEnd: number;
  damages?: number;
  damageNote?: string;
}

export interface CreateMoveOutBillPayload extends MoveOutPreviewPayload {}

// ── Redux State ───────────────────────────────────────────────────────────────
export interface MoveOutState {
  list: MoveOutBill[];
  selected: MoveOutBill | null;
  preview: MoveOutPreview | null;
  year: number;
  statusFilter: MoveOutBillStatus | "ALL";
  isLoading: boolean;
  error: string | null;
}
