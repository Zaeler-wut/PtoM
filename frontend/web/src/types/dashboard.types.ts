// ── Dashboard Summary (GET properties/:propertyId/dashboard) ──────────────────
export interface DashboardSummary {
  // Rooms
  totalRooms: number;
  availableRooms: number;
  occupiedRooms: number;
  reservedRooms: number;
  preparingRooms: number;
  maintenanceRooms: number;

  // Contracts
  activeContracts: number;
  moveOutNoticeContracts: number;

  // Bookings
  pendingBookings: number;
  confirmedBookings: number;

  // Revenue (current month)
  currentMonthRevenue: number;
  pendingPayments: number;
  overduePayments: number;

  // Move outs
  upcomingMoveOuts: number;
}

// ── Redux State ───────────────────────────────────────────────────────────────
export interface DashboardState {
  summary: DashboardSummary | null;
  isLoading: boolean;
  error: string | null;
}
