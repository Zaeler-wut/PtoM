// propertyModel.ts (web) — TypeScript types สำหรับ property module ฝั่ง web admin
// ใช้เป็น input/return type ของ propertyService และ propertyRouter

// ข้อมูลที่พักสำหรับแสดงในรายการ (dashboard ของ admin)
export interface PropertyListItem {
  id: string
  name: string
  address: string
  coverImage: string | null
  totalRooms: number
  available: number     // ห้องว่าง
  occupied: number      // มีผู้เช่า
  reserved: number      // จองแล้ว (RESERVED)
  bookingCount: number  // จำนวน booking ที่ยังไม่ cancelled
}

// ข้อมูลที่พักฉบับเต็มสำหรับหน้าแก้ไข property
export interface PropertyDetail {
  id: string
  name: string
  address: string
  googleMap: string | null
  description: string | null
  priceMin: number
  priceMax: number
  contractTerm: string | null
  preparingDays: number       // วันเตรียมห้องหลัง moveout ก่อนเปิดรับจองใหม่
  bankName: string
  bankAccount: string
  bankHolder: string
  paymentQrUrl: string | null
  logoUrl: string | null
  facilities: string[]
  images: PropertyImageItem[]
}

// รูปภาพของ property — isCover บ่งบอกว่าเป็น cover image
export interface PropertyImageItem {
  id: string
  url: string
  isCover: boolean
}

// input สำหรับ POST /properties — สร้าง property ใหม่
export interface CreatePropertyInput {
  name: string
  address: string
  googleMap?: string
  description?: string
  priceMin: number
  priceMax: number
  contractTerm?: string
  preparingDays?: number
  bankName: string
  bankAccount: string
  bankHolder: string
  paymentQrUrl?: string
  logoUrl?: string
}

// input สำหรับ PUT /properties/:propertyId — แก้ไข property
export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  facilities?: string[]   // replace all facilities ถ้าส่งมา
}

// ข้อมูล room type ฉบับเต็มสำหรับหน้าแก้ไข
export interface RoomTypeDetail {
  id: string
  name: string
  description: string | null
  size: number | null
  maxOccupants: number
  price: number
  furniturePrice: number | null
  waterRate: number
  electricRate: number
  bookingFee: number
  advanceRent: number
  securityDeposit: number
  allowOnlineBooking: boolean
  images: { id: string; url: string }[]
  fees: { id: string; title: string; amount: number }[]
  facilities: string[]
}

// input สำหรับ POST /properties/:propertyId/room-types — สร้าง room type ใหม่
export interface CreateRoomTypeInput {
  name: string
  description?: string
  size?: number
  maxOccupants: number
  roomPrice: number
  furniturePrice?: number
  bookingFee: number
  advanceRent: number
  securityDeposit: number
  waterRate: number
  electricRate: number
  allowOnlineBooking?: boolean
  facilities?: string[]
  images?: string[]       // URLs ของรูป (max 5)
  fees?: { title: string; amount: number }[]
}

// input สำหรับ PUT /properties/:propertyId/room-types/:roomTypeId — แก้ไข room type
export interface UpdateRoomTypeInput extends Partial<CreateRoomTypeInput> {}
