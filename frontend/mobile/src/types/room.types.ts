import type { RoomType } from "./property.types";

// ── Enums ─────────────────────────────────────────────────────────────────────
export type RoomStatus =
  | "AVAILABLE"
  | "RESERVED"
  | "OCCUPIED"
  | "PREPARING"
  | "MAINTENANCE";

// ── Room ──────────────────────────────────────────────────────────────────────
export interface Room {
  id: string;
  propertyId: string;
  roomTypeId: string;
  roomNumber: string;
  floor: number | null;
  status: RoomStatus;

  // relations
  roomType?: RoomType;
}

// ── Meter Reading ─────────────────────────────────────────────────────────────
export type MeterType = "WATER" | "ELECTRIC";

export interface MeterReading {
  id: string;
  roomId: string;
  month: number;
  year: number;
  waterMeter: number;
  electricMeter: number;
  createdAt: string;
  images?: MeterImage[];
}

export interface MeterImage {
  id: string;
  meterReadingId: string;
  url: string;
  type: MeterType;
}

// ── Payloads ──────────────────────────────────────────────────────────────────
export interface CreateRoomPayload {
  roomTypeId: string;
  roomNumber: string;
  floor?: number;
  status?: RoomStatus;
}

export interface UpdateMeterPayload {
  waterMeter: number;
  electricMeter: number;
}

// ── Redux State ───────────────────────────────────────────────────────────────
export interface RoomState {
  list: Room[];
  isLoading: boolean;
  error: string | null;
}
