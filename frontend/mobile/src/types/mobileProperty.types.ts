export interface MobilePropertyCard {
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
  availableRooms: number
  preparingCount: number
  preparingAvailableDate: string | null
  distanceKm: number
  lat: number | null
  lng: number | null
  googleMap: string | null
}

export interface MobileRoomType {
  id: string
  name: string
  size: number | null
  roomPrice: number
  availableRooms: number
  preparingCount: number
  preparingAvailableDate: string | null
  facilities: string[]
  maxOccupants: number | null
}

export interface MobilePropertyDetail extends MobilePropertyCard {
  allowOnlineBooking: boolean
  description: string | null
  phone: string | null
  roomTypes: MobileRoomType[]
}

export interface PropertySearchParams {
  lat: number
  lng: number
  month: number
  year: number
  day?: number
  maxOccupants?: number
  radius?: number
}