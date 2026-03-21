import type { User } from "./auth.types";
import type { Room } from "./room.types";

// ── Enums ─────────────────────────────────────────────────────────────────────
export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED";
export type ContractType = "ONLINE" | "OFFLINE";

// ── Contract ──────────────────────────────────────────────────────────────────
export interface Contract {
  id: string;
  userId: string;
  roomId: string;
  bookingId: string | null;
  startDate: string;
  endDate: string;
  securityDeposit: number;
  contractType: ContractType;
  status: ContractStatus;
  pdfUrl: string | null;
  moveOutNoticeDate: string | null;
  createdAt: string;
  updatedAt: string;

  // relations
  user?: User;
  room?: Room;
}

// ── Payloads ──────────────────────────────────────────────────────────────────
export interface CreateOnlineContractPayload {
  bookingId: string;
  startDate: string;
  endDate: string;
  securityDeposit: number;
}

export interface CreateOfflineContractPayload {
  userId: string;
  roomId: string;
  startDate: string;
  endDate: string;
  securityDeposit: number;
}

export interface UpdateContractPayload {
  startDate?: string;
  endDate?: string;
  securityDeposit?: number;
  status?: ContractStatus;
}

// ── Redux State ───────────────────────────────────────────────────────────────
export interface ContractState {
  list: Contract[];
  selected: Contract | null;
  isLoading: boolean;
  error: string | null;
}
