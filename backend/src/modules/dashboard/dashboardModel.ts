export interface DashboardData {
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
}


export interface RevenueMonthItem {
  month: number
  year: number
  label: string
  revenue: number // ยอดรวม Bill PAID
  billCount: number
}

export interface RevenueResponse {
  propertyId: string
  months: RevenueMonthItem[]
  totalRevenue: number
}