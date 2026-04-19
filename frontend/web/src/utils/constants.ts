// ── Room Status ───────────────────────────────────────────────────────────────
export const ROOM_STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Available" },
  { value: "RESERVED", label: "Reserved" },
  { value: "OCCUPIED", label: "Occupied" },
  { value: "PREPARING", label: "Preparing" },
  { value: "MAINTENANCE", label: "Maintenance" },
];

// ── Booking Status ────────────────────────────────────────────────────────────
export const BOOKING_STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CHECKED_IN", label: "Checked In" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ── Contract Status ───────────────────────────────────────────────────────────
export const CONTRACT_STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "MOVE_OUT_NOTICE", label: "Move Out Notice" },
  { value: "ENDED", label: "Ended" },
];

// ── Payment Status ────────────────────────────────────────────────────────────
export const PAYMENT_STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "VERIFYING", label: "Verifying" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
];

// ── Move Out Status ───────────────────────────────────────────────────────────
export const MOVEOUT_STATUS_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "DRAFT", label: "Draft" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "COMPLETED", label: "Completed" },
];

// ── Contract Type ─────────────────────────────────────────────────────────────
export const CONTRACT_TYPE_OPTIONS = [
  { value: "ONLINE", label: "Online" },
  { value: "OFFLINE", label: "Offline" },
];

// ── Pagination ────────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
