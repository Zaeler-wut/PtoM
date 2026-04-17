export interface PropertySearchQuery {
  lat: number
  lng: number
  month: number       // เดือนที่จะเข้าอยู่
  year: number        // ปีที่จะเข้าอยู่
  day?: number        // วันที่จะเข้าอยู่ (ถ้าไม่ส่งมา = วันแรกของเดือน)
  maxOccupants?: number // จำนวนคน
  radius?: number     // รัศมีค้นหา (กม.) default 20
}


export interface PropertyCardItem {
  id: string
  name: string
  address: string
  coverImage: string | null
  images: string[]
  facilities: string[]
  contractTerm: string | null
  priceMin: number
  priceMax: number
  totalRooms: number
  availableRooms: number      // ว่างแล้วตอนนี้ (หรือ ≤ searchDate)
  preparingCount: number      // กำลังเตรียมว่าง (readyDate > searchDate)
  preparingAvailableDate: string | null  // วันแรกที่จะว่าง (ISO date)
  distanceKm: number
  lat: number | null
  lng: number | null
  googleMap: string | null
}

export interface PropertyDetailMobile {
  id: string
  name: string
  address: string
  phone: string | null
  googleMap: string | null
  description: string | null
  contractTerm: string | null
  priceMin: number
  priceMax: number
  lat: number | null
  lng: number | null
  bankName: string
  bankAccount: string
  bankHolder: string
  paymentQrUrl: string | null
  logoUrl: string | null
  coverImage: string | null
  images: string[]
  facilities: string[]
  roomTypes: RoomTypeMobile[]
}

export interface RoomTypeMobile {
  id: string
  name: string
  description: string | null
  size: number | null
  maxOccupants: number
  roomPrice: number
  furniturePrice: number | null
  bookingFee: number
  advanceRent: number
  securityDeposit: number
  waterRate: number
  electricRate: number
  allowOnlineBooking: boolean
  availableRooms: number
  images: string[]
  facilities: string[]
  fees: { title: string; amount: number }[]
}