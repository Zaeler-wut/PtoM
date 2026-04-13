export interface PropertyImage {
  id: string
  url: string
  isCover: boolean
}

export interface Property {
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
  totalRooms: number
  available: number
  occupied: number
  reserved: number
  bookingCount: number
  coverImage?: string | null
  images?: PropertyImage[]
  facilities?: string[]
  amenities?: string[]
  lat?: number | null
  lng?: number | null
  billNote?: string | null
}

export type PropertyListItem = Property

export interface CreatePropertyPayload {
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
}

export interface UpdatePropertyPayload {
  name?: string
  address?: string
  googleMap?: string
  description?: string
  priceMin?: number
  priceMax?: number
  contractTerm?: string
  preparingDays?: number
  bankName?: string
  bankAccount?: string
  bankHolder?: string
  amenities?: string[]
  facilities?: string[]
  logoUrl?: string | null
  paymentQrUrl?: string | null
  lat?: number | null
  lng?: number | null
  billNote?: string | null
}

export interface PropertyState {
  list: Property[]
  selected: Property | null
  isLoading: boolean
  error: string | null
}