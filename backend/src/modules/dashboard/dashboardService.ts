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
