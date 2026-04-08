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
  distanceKm: number
  lat: number | null
  lng: number | null
  googleMap: string | null
}

export interface PropertySearchParams {
  lat: number
  lng: number
  month: number
  year: number
  maxOccupants?: number
  radius?: number
}
