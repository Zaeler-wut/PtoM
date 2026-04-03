import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { BookingListItem, BookingDetail } from "../../types/booking.types"

export const getBookings = (propertyId: string) =>
  api.get<BookingListItem[]>(ENDPOINTS.bookings.list(propertyId)).then((r) => r.data)

export const getBookingDetail = (propertyId: string, bookingId: string) =>
  api.get<BookingDetail>(ENDPOINTS.bookings.detail(propertyId, bookingId)).then((r) => r.data)

export const confirmBooking = (propertyId: string, bookingId: string) =>
  api.patch(ENDPOINTS.bookings.confirm(propertyId, bookingId)).then((r) => r.data)

export const cancelBooking = (propertyId: string, bookingId: string) =>
  api.patch(ENDPOINTS.bookings.cancel(propertyId, bookingId)).then((r) => r.data)

export const getContractPrefill = (propertyId: string, bookingId: string) =>
  api.get(ENDPOINTS.bookings.contractPrefill(propertyId, bookingId)).then((r) => r.data)
