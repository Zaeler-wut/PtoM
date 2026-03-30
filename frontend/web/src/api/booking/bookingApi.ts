import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"

export const getBookings = (propertyId: string) =>
  api.get(ENDPOINTS.bookings.list(propertyId)).then((r) => r.data)

export const getContractPrefill = (propertyId: string, bookingId: string) =>
  api.get(ENDPOINTS.bookings.contractPrefill(propertyId, bookingId)).then((r) => r.data)
