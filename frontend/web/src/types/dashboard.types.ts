export interface DashboardSummary {
  totalRooms: number
  available: number
  preparing: number
  bookableRooms: number
  reserved: number
  occupied: number
  maintenance: number
  pendingBookings: number
  verifyingBills: number
  unpaidBills: number
  monthlyRevenue: number
  // alias สำหรับ component เดิม
  currentMonthRevenue?: number
  pendingPayments?: number
}

export interface RevenueMonthItem {
  month: number
  year: number
  label: string
  revenue: number
  billCount: number
}

export interface RevenueResponse {
  propertyId: string
  months: RevenueMonthItem[]
  totalRevenue: number
}

export interface DashboardState {
  summary: DashboardSummary | null
  revenue: RevenueResponse | null
  isLoading: boolean
  error: string | null
}