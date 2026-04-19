// bookingService.ts (mobile) — business logic สำหรับ booking module ฝั่ง mobile
// รับข้อมูลจาก bookingRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ bookingRepository สำหรับ query database

import * as repo from "./bookingRepository"

// แปลง Date เป็น YYYY-MM-DD timezone กรุงเทพ (ป้องกัน UTC offset ทำให้วันคลาดเคลื่อน)
const toBkk = (d: Date) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(d)
import type {
  BookingInfoResponse,
  CreateBookingInput,
  CreateBookingResponse,
  CancelBookingResponse,
} from "./bookingModel"

// ดึงข้อมูลสำหรับแสดงหน้าก่อนจอง — ราคา ช่องทางชำระ และช่วงวันที่เข้าอยู่ได้
// คำนวณ minMoveInDate: ถ้าไม่มีห้อง AVAILABLE ให้ใช้วันที่ห้องพร้อมเร็วสุด (PREPARING/MOVE_OUT_NOTICE + preparingDays)
// เรียก: bookingRepository.getBookingInfo(), getRoomsForAvailabilityCheck()
// ส่งกลับ: BookingInfoResponse
export const getBookingInfo = async (
  propertyId: string,
  roomTypeId: string
): Promise<BookingInfoResponse> => {
  const [rt, { rooms, preparingDays }] = await Promise.all([
    repo.getBookingInfo(propertyId, roomTypeId),
    repo.getRoomsForAvailabilityCheck(propertyId, roomTypeId),
  ])
  if (!rt) throw new Error("RoomType not found or not available for online booking")

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const maxDate = new Date(today)
  maxDate.setDate(maxDate.getDate() + 45)

  // ถ้าไม่มีห้อง AVAILABLE เลย → หาวันที่ห้องพร้อมเร็วสุดจาก PREPARING/OCCUPIED
  const hasAvailableNow = rooms.some(r => r.status === "AVAILABLE")

  let minMoveInDate: Date
  if (!hasAvailableNow) {
    let earliestReady: Date | null = null

    for (const room of rooms) {
      let readyDate: Date | null = null

      if (room.status === "PREPARING") {
        const moveOut = room.moveOutBills[0]
        if (!moveOut) {
          readyDate = new Date(today)  // พร้อมแล้ว (ไม่มี moveOutBill)
        } else {
          readyDate = new Date(moveOut.moveOutDate)
          readyDate.setDate(readyDate.getDate() + preparingDays)
        }
      } else if (room.status === "OCCUPIED") {
        const contract = room.contracts[0]
        if (contract?.moveOutNoticeDate) {
          readyDate = new Date(contract.moveOutNoticeDate)
          readyDate.setDate(readyDate.getDate() + preparingDays)
        }
      }

      if (readyDate && (!earliestReady || readyDate < earliestReady)) {
        earliestReady = readyDate
      }
    }

    // ใช้วันที่พร้อมเร็วสุด แต่ไม่น้อยกว่าพรุ่งนี้
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    minMoveInDate = earliestReady && earliestReady > tomorrow ? earliestReady : tomorrow
  } else {
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    minMoveInDate = tomorrow
  }

  return {
    propertyName: rt.property.name,
    roomTypeName: rt.name,
    roomPrice: rt.roomPrice,
    furniturePrice: rt.furniturePrice ?? 0,
    bookingFee: rt.bookingFee,
    payment: {
      paymentQrUrl: rt.property.paymentQrUrl,
      bankName: rt.property.bankName,
      bankAccount: rt.property.bankAccount,
      bankHolder: rt.property.bankHolder,
    },
    minMoveInDate: toBkk(minMoveInDate),
    maxMoveInDate: toBkk(maxDate),
  }
}

// สร้างการจองใหม่ — validate moveInDate อยู่ในช่วง [minMoveInDate, +45วัน]
// คำนวณ minMoveInDate ใหม่อีกครั้งเพื่อป้องกัน race condition จากหน้า getBookingInfo
// เรียก: bookingRepository.getBookingInfo(), getRoomsForAvailabilityCheck(), createBooking(), getBookingById()
// ส่งกลับ: CreateBookingResponse
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
  moveInDate.setHours(0, 0, 0, 0)

  // ดึง roomType + คำนวณ minMoveInDate ตาม availability จริง ณ เวลาที่สร้าง
  const [rt, { rooms, preparingDays }] = await Promise.all([
    repo.getBookingInfo(propertyId, roomTypeId),
    repo.getRoomsForAvailabilityCheck(propertyId, roomTypeId),
  ])
  if (!rt) throw new Error("RoomType not found or not available for online booking")

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)
  const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + 45)

  const hasAvailableNow = rooms.some(r => r.status === "AVAILABLE")
  let minMoveInDate = tomorrow

  if (!hasAvailableNow) {
    let earliest: Date | null = null
    for (const room of rooms) {
      let ready: Date | null = null
      if (room.status === "PREPARING") {
        const mo = room.moveOutBills[0]
        ready = mo ? (() => { const d = new Date(mo.moveOutDate); d.setDate(d.getDate() + preparingDays); return d })() : new Date(today)
      } else if (room.status === "OCCUPIED" && room.contracts[0]?.moveOutNoticeDate) {
        ready = new Date(room.contracts[0].moveOutNoticeDate)
        ready.setDate(ready.getDate() + preparingDays)
      }
      if (ready && (!earliest || ready < earliest)) earliest = ready
    }
    if (earliest && earliest > tomorrow) minMoveInDate = earliest
  }

  if (moveInDate < minMoveInDate) throw new Error(`moveInDate (${toBkk(moveInDate)}) is before the earliest available date (${toBkk(minMoveInDate)})`)
  if (moveInDate > maxDate) throw new Error("moveInDate must be within 45 days from today")

  const booking = await repo.createBooking({
    propertyId,
    roomTypeId,
    userId,
    moveInDate,
    bookingFee: rt.bookingFee,
    slipUrl: data.slipUrl,
  })

  // ดึงข้อมูลครบสำหรับ response (property name, roomType name, user name)
  const full = await repo.getBookingById(booking.id)
  if (!full) throw new Error("Booking not found")

  return {
    bookingId: full.id,
    propertyName: full.property.name,
    roomTypeName: full.roomType.name,
    roomPrice: full.roomType.roomPrice,
    bookingFee: full.bookingFee,
    moveInDate: toBkk(full.moveInDate),
    firstName: full.user.firstName,
    lastName: full.user.lastName,
    status: full.status as any,
    paidAmount: full.bookingFee,
  }
}

// ยกเลิกการจอง — ตรวจสอบสิทธิ์และสถานะก่อนยกเลิก
// ยกเลิกได้เฉพาะ PENDING และ CONFIRMED เท่านั้น
// ถ้ามี roomId (admin assign แล้ว) → คืนห้องเป็น AVAILABLE ด้วย
// เรียก: bookingRepository.getBookingById(), cancelBooking(), releaseRoom()
// ส่งกลับ: CancelBookingResponse
export const cancelBooking = async (
  bookingId: string,
  userId: string
): Promise<CancelBookingResponse> => {
  const booking = await repo.getBookingById(bookingId)
  if (!booking) throw new Error("Booking not found")

  if (booking.userId !== userId) throw new Error("Unauthorized")

  if (booking.status === "CANCELLED") throw new Error("Booking is already cancelled")
  if (booking.status === "CHECKED_IN") throw new Error("Cannot cancel checked-in booking")

  await repo.cancelBooking(bookingId)

  // คืนห้องถ้า admin assign ไปแล้ว
  if (booking.roomId) {
    await repo.releaseRoom(booking.roomId)
  }

  return {
    message: "Booking cancelled",
    bookingId,
    status: "CANCELLED",
  }
}

// ดึงการจองทั้งหมดของ user พร้อม derive สถานะ CHECKED_IN
// CONFIRMED + มีสัญญาผูกอยู่ → แสดงเป็น CHECKED_IN (สัญญาเริ่มแล้ว)
// เรียก: bookingRepository.getMyBookings(), getContractsByUser()
// ส่งกลับ: MyBookingItem[]
export const getMyBookings = async (userId: string) => {
  const [bookings, userContracts] = await Promise.all([
    repo.getMyBookings(userId),
    repo.getContractsByUser(userId),
  ])
  return bookings.map((b) => {
    // ตรวจว่า booking นี้มีสัญญาแล้วหรือไม่ (ผ่าน bookingId หรือ roomId ตรงกัน)
    const hasContract = !!b.contract || userContracts.some(
      (c) => c.bookingId === b.id || (b.roomId !== null && c.roomId === b.roomId)
    )
    const status = (b.status === "CONFIRMED" && hasContract) ? "CHECKED_IN" : b.status
    return {
      bookingId: b.id,
      propertyName: b.property.name,
      roomTypeName: b.roomType.name,
      roomNumber: b.room?.roomNumber ?? null,
      firstName: b.user.firstName,
      lastName: b.user.lastName,
      moveInDate: toBkk(b.moveInDate),
      bookingFee: b.bookingFee,
      roomPrice: b.roomType.roomPrice,
      createdAt: toBkk(b.createdAt),
      status: status as any,
      canCancel: status === "PENDING" || status === "CONFIRMED",
    }
  })
}
