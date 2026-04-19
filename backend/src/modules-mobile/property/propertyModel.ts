// propertyModel.ts (mobile) — TypeScript types สำหรับ property module ฝั่ง mobile
// ใช้เป็น input/return type ของ propertyService และ propertyRouter

// query parameters สำหรับค้นหาที่พัก
export interface PropertySearchQuery {
  lat: number
  lng: number
  month: number           // เดือนที่จะเข้าอยู่
  year: number            // ปีที่จะเข้าอยู่
  day?: number            // วันที่จะเข้าอยู่ (ถ้าไม่ส่งมา = วันสุดท้ายของเดือน)
  maxOccupants?: number   // จำนวนคน
  radius?: number         // รัศมีค้นหา (กม.) default 20
}

// ข้อมูลที่พักสำหรับแสดงในรายการ (card)
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
  availableRooms: number              // ห้องว่างแล้ว ณ searchDate
  preparingCount: number              // ห้องกำลังเตรียมว่าง (readyDate > searchDate)
  preparingAvailableDate: string | null  // วันแรกที่จะมีห้องว่าง (ISO date)
  distanceKm: number
  lat: number | null
  lng: number | null
  googleMap: string | null
}

// ข้อมูลที่พักฉบับเต็ม สำหรับหน้า detail ใน mobile app
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

// ข้อมูล room type สำหรับ mobile — รวมจำนวนห้องว่าง
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
