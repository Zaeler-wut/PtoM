export interface PropertyImage {
  id: string
  url: string
  isCover: boolean
}

export interface Property {
  id: string
  name: string
  address: string
  priceMin: number
  priceMax: number
  totalRooms: number
  available: number
  occupied: number
  reserved: number
  bookingCount: number
  images?: PropertyImage[]
  coverImage?: string | null
}

// alias สำหรับ list
export type PropertyListItem = Property

export interface PropertyState {
  list: Property[]
  selected: Property | null
  isLoading: boolean
  error: string | null
}