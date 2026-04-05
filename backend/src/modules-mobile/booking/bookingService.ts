import * as repo from "./bookingRepository"
import type {
  BookingInfoResponse,
  CreateBookingInput,
  CreateBookingResponse,
  CancelBookingResponse,
} from "./bookingModel"

// ─────────────────────────────────────────
// 1. ดึงข้อมูลสำหรับหน้าจอง
// ─────────────────────────────────────────

export const getBookingInfo = async (
  propertyId: string,
  roomTypeId: string
): Promise<BookingInfoResponse> => {
  const rt = await repo.getBookingInfo(propertyId, roomTypeId)
  if (!rt) throw new Error("RoomType not found or not available for online booking")

  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 45)

  return {
    propertyName: rt.property.name,
    roomTypeName: rt.name,
    roomPrice: rt.roomPrice,
    bookingFee: rt.bookingFee,
    payment: {
      paymentQrUrl: rt.property.paymentQrUrl,
      bankName: rt.property.bankName,
      bankAccount: rt.property.bankAccount,
      bankHolder: rt.property.bankHolder,
    },
    minMoveInDate: tomorrow.toISOString().split("T")[0],
    maxMoveInDate: maxDate.toISOString().split("T")[0],
  }
}

// ─────────────────────────────────────────
// 2. สร้าง booking
// ─────────────────────────────────────────

export const createBooking = async (
  propertyId: string,
  roomTypeId: string,
  userId: string,
  data: CreateBookingInput
): Promise<CreateBookingResponse> => {
  if (!data.moveInDate) throw new Error("moveInDate is required")
  if (!data.slipUrl) throw new Error("slipUrl is required")

  const moveInDate = new Date(data.moveInDate)
  if (isNaN(moveInDate.getTime())) throw new Error("moveInDate is invalid")

  // เช็คว่า moveInDate อยู่ในช่วงที่อนุญาต (พรุ่งนี้ - 45 วัน)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 45)

  if (moveInDate < tomorrow) throw new Error("moveInDate must be at least tomorrow")
  if (moveInDate > maxDate) throw new Error("moveInDate must be within 45 days from today")

  // ดึง roomType เพื่อเอา bookingFee
  const rt = await repo.getBookingInfo(propertyId, roomTypeId)
  if (!rt) throw new Error("RoomType not found or not available for online booking")

  const booking = await repo.createBooking({
    propertyId,
    roomTypeId,
    userId,
    moveInDate,
    bookingFee: rt.bookingFee,
    slipUrl: data.slipUrl,
  })

  // ดึงข้อมูลครบสำหรับ response
  const full = await repo.getBookingById(booking.id)
  if (!full) throw new Error("Booking not found")

  return {
    bookingId: full.id,
    propertyName: full.property.name,
    roomTypeName: full.roomType.name,
    roomPrice: full.roomType.roomPrice,
    bookingFee: full.bookingFee,
    moveInDate: full.moveInDate.toISOString().split("T")[0],
    firstName: full.user.firstName,
    lastName: full.user.lastName,
    status: full.status as any,
    paidAmount: full.bookingFee,
  }
}

// ─────────────────────────────────────────
// 3. ยกเลิก booking
// ─────────────────────────────────────────

export const cancelBooking = async (
  bookingId: string,
  userId: string
): Promise<CancelBookingResponse> => {
  const booking = await repo.getBookingById(bookingId)
  if (!booking) throw new Error("Booking not found")

  // เช็คว่าเป็น booking ของ user นี้
  if (booking.userId !== userId) throw new Error("Unauthorized")

  // ยกเลิกได้เฉพาะ PENDING เท่านั้น
  if (booking.status === "CANCELLED") throw new Error("Booking is already cancelled")
  if (booking.status === "CHECKED_IN") throw new Error("Cannot cancel checked-in booking")

  await repo.cancelBooking(bookingId)

  // คืนห้องถ้ามีการ assign แล้ว
  if (booking.roomId) {
    await repo.releaseRoom(booking.roomId)
  }

  return {
    message: "Booking cancelled",
    bookingId,
    status: "CANCELLED",
  }
}

// ─────────────────────────────────────────
// 4. ดึงรายการจองของฉัน (แท็บการจอง)
// ─────────────────────────────────────────

export const getMyBookings = async (userId: string) => {
  const bookings = await repo.getMyBookings(userId)
  return bookings.map((b) => ({
    bookingId: b.id,
    propertyName: b.property.name,
    roomTypeName: b.roomType.name,
    roomNumber: b.room?.roomNumber ?? null,
    firstName: b.user.firstName,
    lastName: b.user.lastName,
    moveInDate: b.moveInDate.toISOString().split("T")[0],
    bookingFee: b.bookingFee,
    roomPrice: b.roomType.roomPrice,
    createdAt: b.createdAt.toISOString().split("T")[0],
    status: b.status as any,
    canCancel: b.status === "PENDING",
  }))
}
