// bookingApi.ts (web) — API calls สำหรับจัดการ booking ฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก bookingSlice.ts และ BookingPage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { BookingListItem, BookingDetail } from "../../types/booking.types"

// GET /api/admin/properties/:propertyId/bookings — ดึงรายการ booking ทั้งหมด
export const getBookings = (propertyId: string) =>
  api.get<BookingListItem[]>(ENDPOINTS.bookings.list(propertyId)).then((r) => r.data)

// GET /api/admin/properties/:propertyId/bookings/:bookingId — ดึงรายละเอียด booking
export const getBookingDetail = (propertyId: string, bookingId: string) =>
  api.get<BookingDetail>(ENDPOINTS.bookings.detail(propertyId, bookingId)).then((r) => r.data)

// PATCH /api/admin/properties/:propertyId/bookings/:bookingId/confirm — ยืนยัน booking (อาจ assign ห้องอัตโนมัติ)
export const confirmBooking = (propertyId: string, bookingId: string) =>
  api.patch(ENDPOINTS.bookings.confirm(propertyId, bookingId)).then((r) => r.data)

// PATCH /api/admin/properties/:propertyId/bookings/:bookingId/cancel — ยกเลิก booking
export const cancelBooking = (propertyId: string, bookingId: string) =>
  api.patch(ENDPOINTS.bookings.cancel(propertyId, bookingId)).then((r) => r.data)

// GET /api/admin/properties/:propertyId/bookings/:bookingId/contract-prefill — ดึงข้อมูล prefill สำหรับสร้างสัญญา
export const getContractPrefill = (propertyId: string, bookingId: string) =>
  api.get(ENDPOINTS.bookings.contractPrefill(propertyId, bookingId)).then((r) => r.data)
