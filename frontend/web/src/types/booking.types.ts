// import type { User } from "./auth.types";
// import type { Room, RoomType } from "./property.types";

// // ── Enums ─────────────────────────────────────────────────────────────────────
// export type BookingStatus =
//   | "PENDING"
//   | "CONFIRMED"
//   | "CHECKED_IN"
//   | "CANCELLED";

// // ── Booking ───────────────────────────────────────────────────────────────────
// export interface Booking {
//   id: string;
//   propertyId: string;
//   roomTypeId: string;
//   roomId: string | null;
//   userId: string;
//   moveInDate: string;
//   bookingFee: number;
//   slipUrl: string;
//   status: BookingStatus;
//   createdAt: string;
//   assignedAt: string | null;

//   // relations
//   user?: User;
//   roomType?: RoomType;
//   room?: Room | null;
// }

// // ── Contract Prefill (GET bookings/:id/contract-prefill) ──────────────────────
// export interface ContractPrefill {
//   booking: Booking;
//   roomType: RoomType;
//   room: Room;
//   user: User;
//   suggestedStartDate: string;
//   suggestedEndDate: string;
//   securityDeposit: number;
// }

// // ── Payloads ──────────────────────────────────────────────────────────────────
// export interface ConfirmBookingPayload {
//   // backend auto-assigns room; no body needed typically
// }

// export interface CancelBookingPayload {
//   reason?: string;
// }

// // ── Redux State ───────────────────────────────────────────────────────────────
// export interface BookingState {
//   list: Booking[];
//   selected: Booking | null;
//   prefill: ContractPrefill | null;
//   isLoading: boolean;
//   error: string | null;
// }
