import * as repo from "./propertyRepository"
import type { PropertySearchQuery, PropertyCardItem, PropertyDetailMobile } from "./propertyModel"

// คำนวณระยะห่างระหว่างสองจุด GPS (Haversine formula) หน่วย กม.
function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371 // รัศมีโลก กม.
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10 // ปัดทศนิยม 1 ตำแหน่ง
}

// เช็คว่าห้องนี้ว่างในเดือนนั้นไหม
// AVAILABLE = ว่างอยู่แล้ว
// PREPARING = คนเก่าออกแล้ว รอ preparingDays → พร้อมในเดือนนั้น
function isRoomAvailableInMonth(
  room: any,
  month: number,
  year: number,
  preparingDays: number
): boolean {
  if (room.status === "AVAILABLE") return true

  if (room.status === "PREPARING") {
    const latestMoveOut = room.moveOutBills[0]
    if (!latestMoveOut) return false

    const readyDate = new Date(latestMoveOut.moveOutDate)
    readyDate.setDate(readyDate.getDate() + preparingDays)

    // พร้อมภายในเดือนที่เลือก
    return (
      readyDate.getMonth() + 1 <= month &&
      readyDate.getFullYear() <= year
    )
  }

  return false
}

// กรองตามจำนวนคน
function roomMatchesOccupants(room: any, maxOccupants?: number): boolean {
  if (!maxOccupants) return true
  return room.roomType.maxOccupants >= maxOccupants
}


export const searchProperties = async (query: PropertySearchQuery): Promise<PropertyCardItem[]> => {
  const { lat, lng, month, year, maxOccupants, radius = 20 } = query

  if (!lat || !lng) throw new Error("lat and lng are required")
  if (!month || month < 1 || month > 12) throw new Error("Invalid month")
  if (!year || year < 2000) throw new Error("Invalid year")

  const properties = await repo.getAllProperties()

  const results: PropertyCardItem[] = []

  for (const property of properties) {
    // ── กรองระยะห่าง ──
    if (!property.lat || !property.lng) continue

    const distanceKm = calculateDistance(lat, lng, property.lat, property.lng)
    if (distanceKm > radius) continue

    // ── นับห้องว่างในเดือนนั้น ──
    const availableRooms = property.rooms.filter((room) =>
      isRoomAvailableInMonth(room, month, year, property.preparingDays) &&
      roomMatchesOccupants(room, maxOccupants)
    ).length

    // ถ้าไม่มีห้องว่างในเดือนนั้น ไม่แสดง
    if (availableRooms === 0) continue

    const coverImage =
      property.images.find((img) => img.isCover)?.url ||
      property.images[0]?.url ||
      null

    results.push({
      id: property.id,
      name: property.name,
      address: property.address,
      coverImage,
      images: property.images.map((img) => img.url),
      facilities: property.facilities.map((f) => f.facility.name),
      contractTerm: property.contractTerm,
      priceMin: property.priceMin,
      priceMax: property.priceMax,
      totalRooms: property.rooms.length,
      availableRooms,
      distanceKm,
      lat: property.lat,
      lng: property.lng,
      googleMap: property.googleMap,
    })
  }

  // เรียงจากใกล้ไปไกล
  return results.sort((a, b) => a.distanceKm - b.distanceKm)
}


// ดูรายละเอียดหอพัก

export const getPropertyDetail = async (
  propertyId: string,
  query: { month?: number; year?: number; maxOccupants?: number }
): Promise<PropertyDetailMobile> => {
  const property = await repo.getPropertyById(propertyId)
  if (!property) throw new Error("Property not found")

  const month = query.month
  const year = query.year

  const coverImage =
    property.images.find((img) => img.isCover)?.url ||
    property.images[0]?.url ||
    null

  const roomTypes = property.roomTypes.map((rt) => {
    // นับห้องว่างของแต่ละ roomType ในเดือนที่เลือก
    const roomsOfType = property.rooms.filter((r) => r.roomTypeId === rt.id)

    const availableRooms =
      month && year
        ? roomsOfType.filter((room) =>
            isRoomAvailableInMonth(room, month, year, property.preparingDays) &&
            roomMatchesOccupants(room, query.maxOccupants)
          ).length
        : roomsOfType.filter((r) => r.status === "AVAILABLE").length

    return {
      id: rt.id,
      name: rt.name,
      description: rt.description,
      size: rt.size,
      maxOccupants: rt.maxOccupants,
      roomPrice: rt.roomPrice,
      furniturePrice: rt.furniturePrice,
      bookingFee: rt.bookingFee,
      advanceRent: rt.advanceRent,
      securityDeposit: rt.securityDeposit,
      waterRate: rt.waterRate,
      electricRate: rt.electricRate,
      allowOnlineBooking: rt.allowOnlineBooking,
      availableRooms,
      images: rt.images.map((i) => i.url),
      facilities: rt.facilities.map((f) => f.facility.name),
      fees: rt.fees.map((f) => ({ title: f.title, amount: f.amount })),
    }
  })

  return {
    id: property.id,
    name: property.name,
    address: property.address,
    googleMap: property.googleMap,
    description: property.description,
    contractTerm: property.contractTerm,
    priceMin: property.priceMin,
    priceMax: property.priceMax,
    lat: property.lat,
    lng: property.lng,
    bankName: property.bankName,
    bankAccount: property.bankAccount,
    bankHolder: property.bankHolder,
    paymentQrUrl: property.paymentQrUrl,
    logoUrl: property.logoUrl,
    coverImage,
    images: property.images.map((img) => img.url),
    facilities: property.facilities.map((f) => f.facility.name),
    roomTypes,
  }
}