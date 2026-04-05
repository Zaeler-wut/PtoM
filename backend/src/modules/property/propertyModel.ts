// PROPERTY
export interface PropertyListItem {
  id: string
  name: string
  address: string
  coverImage: string | null
  totalRooms: number
  available: number
  occupied: number
  reserved: number
  bookingCount: number
}

export interface PropertyDetail {
  id: string
  name: string
  address: string
  googleMap: string | null
  description: string | null
  priceMin: number
  priceMax: number
  contractTerm: string | null
  preparingDays: number
  bankName: string
  bankAccount: string
  bankHolder: string
  paymentQrUrl: string | null
  logoUrl: string | null
  facilities: string[]
  images: PropertyImageItem[]
}

export interface PropertyImageItem {
  id: string
  url: string
  isCover: boolean
}

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

export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  facilities?: string[]
}

// ROOM TYPE

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
  images?: string[]
  fees?: { title: string; amount: number }[]
}

export interface UpdateRoomTypeInput extends Partial<CreateRoomTypeInput> {}
