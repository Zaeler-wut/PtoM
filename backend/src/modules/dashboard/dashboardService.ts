import * as repo from "./dashboardRepository"

export const getDashboard = async (propertyId: string) => {
  const { property, bills } = await repo.getDashboardData(propertyId)
  if (!property) throw new Error("Property not found")

  const rooms = property.rooms
  const available  = rooms.filter((r) => r.status === "AVAILABLE").length
  const preparing  = rooms.filter((r) => r.status === "PREPARING").length
  const reserved   = rooms.filter((r) => r.status === "RESERVED").length
  const occupied   = rooms.filter((r) => r.status === "OCCUPIED").length
  const maintenance = rooms.filter((r) => r.status === "MAINTENANCE").length

  const unpaidBills = bills.filter(
    (b) => b.status === "PENDING" || b.status === "VERIFYING"
  ).length

  const monthlyRevenue = bills
    .filter((b) => b.status === "PAID")
    .reduce((sum, b) => sum + b.total, 0)

  return {
    totalRooms: rooms.length,
    available,
    preparing,
    bookableRooms: available + preparing,
    reserved,
    occupied,
    maintenance,
    pendingBookings: property.bookings.filter((b) => b.status === "PENDING").length,
    verifyingBills: bills.filter((b) => b.status === "VERIFYING").length,
    unpaidBills,
    monthlyRevenue,
  }
}

const MONTH_SHORT = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
]

export const getRevenue = async (
  propertyId: string,
  monthsBack: number = 6
) => {
  if (monthsBack < 1 || monthsBack > 24) throw new Error("months must be between 1 and 24")

  const bills = await repo.getPaidBillsByMonths(propertyId, monthsBack)

  const revenueMap = new Map<string, { revenue: number; billCount: number }>()

  bills.forEach((bill) => {
    if (!bill.month || !bill.year) return
    const key = `${bill.month}-${bill.year}`
    const existing = revenueMap.get(key) ?? { revenue: 0, billCount: 0 }
    revenueMap.set(key, {
      revenue: existing.revenue + bill.total,
      billCount: existing.billCount + 1,
    })
  })

  const now = new Date()
  const months: { month: number; year: number }[] = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ month: d.getMonth() + 1, year: d.getFullYear() })
  }

  const result = months.map(({ month, year }) => {
    const key = `${month}-${year}`
    const data = revenueMap.get(key) ?? { revenue: 0, billCount: 0 }
    return {
      month,
      year,
      label: `${MONTH_SHORT[month - 1]} ${year + 543}`,
      revenue: data.revenue,
      billCount: data.billCount,
    }
  })

  const totalRevenue = result.reduce((sum, m) => sum + m.revenue, 0)

  return {
    propertyId,
    months: result,
    totalRevenue,
  }
}