export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED"

export interface BookingListItem {
  bookingId: string
  firstName: string
  lastName: string
  phone: string | null
  roomNumber: string
  roomType: string
  moveInDate: string
  bookingFee: number
  slipUrl: string | null
  status: BookingStatus
}

export interface BookingDetail {
  bookingId: string
  firstName: string
  lastName: string
  phone: string | null
  roomNumber: string
  roomType: string
  bookingDate: string
  moveInDate: string
  bookingFee: number
  advanceRent: number
  securityDeposit: number
  slipUrl: string | null
  status: BookingStatus
}
