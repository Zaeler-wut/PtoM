export interface Property {
  id: string
  name: string
  address: string
  googleMap: string | null
  description: string | null
  priceMin: number
  priceMax: number
  bankName: string
  bankAccount: string
  bankHolder: string
  paymentQrUrl: string | null
  logoUrl: string | null
  totalRooms: number
  available: number
  occupied: number
  reserved: number
  bookingCount: number
  coverImage?: string | null
  images?: { id: string; url: string; isCover: boolean }[]
  facilities?: string[]
}

export type PropertyListItem = Property

export interface PropertyState {
  list: Property[]
  selected: Property | null
  isLoading: boolean
  error: string | null
}
