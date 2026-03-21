export interface BookingListItem {
  bookingId: string
  firstName: string
  lastName: string
  phone: string | null
  roomNumber: string
  roomType: string
  moveInDate: Date
  bookingFee: number
  slipUrl: string
  status: BookingStatus
}

export interface BookingDetail extends BookingListItem {
  bookingDate: Date
}

export interface BookingContractPrefill {
  bookingId: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  lineId: string | null
  address: string | null
  roomId: string | null
  roomNumber: string
  roomType: string
  moveInDate: Date
  securityDeposit: number
  advanceRent: number
  totalDeposit: number
  vehicles: { plateNumber: string; type: string }[]
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CHECKED_IN" | "CANCELLED"

export interface RoomAssignmentResult {
  bookingId: string
  roomId: string
  roomNumber: string
  assignedAt: Date
}
