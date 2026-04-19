// bookingService.ts — business logic สำหรับ booking module
// รับข้อมูลจาก bookingRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ bookingRepository สำหรับ query database

import * as repo from "./bookingRepository"
// checkExistingContract — ตรวจสอบว่า booking นี้มีสัญญาแล้วหรือยัง
import { checkExistingContract } from "../contract/contractRepository"

// ดึงรายการจองทั้งหมดของที่พัก
// คำนวณสถานะจริง: ถ้า CONFIRMED และมีสัญญาแล้ว → แสดงเป็น CHECKED_IN
// เรียก: bookingRepository.getBookingsByProperty()
// ส่งกลับ: array ของ booking พร้อมข้อมูลผู้จอง ห้อง และสถานะที่คำนวณแล้ว
export const getBookings = async (propertyId: string) => {
  const bookings = await repo.getBookingsByProperty(propertyId)
  return bookings.map((b) => {
    // ตรวจสอบว่ามีสัญญาเช่าที่ผูกกับ booking นี้แล้วหรือไม่
    const hasContract = !!b.contract || b.user.contracts.some(
      (c) => c.bookingId === b.id || (b.roomId !== null && c.roomId === b.roomId)
    )
    // CONFIRMED + มีสัญญา = ถือว่าเข้าอยู่แล้ว แสดงเป็น CHECKED_IN
    const status = (b.status === "CONFIRMED" && hasContract) ? "CHECKED_IN" : b.status
    return {
      bookingId: b.id,
      firstName: b.user.firstName,
      lastName: b.user.lastName,
      phone: b.user.phone,
      roomNumber: b.room?.roomNumber ?? "-",
      roomType: b.roomType.name,
      moveInDate: b.moveInDate,
      bookingFee: b.bookingFee,
      slipUrl: b.slipUrl,
      status,
    }
  })
}

// ดึงรายละเอียดการจองเดี่ยว
// เรียก: bookingRepository.getBookingDetail()
// ส่งกลับ: ข้อมูลการจองพร้อม advanceRent, securityDeposit จาก roomType
export const getBookingDetail = async (bookingId: string, propertyId: string) => {
  const booking = await repo.getBookingDetail(bookingId, propertyId)
  if (!booking) throw new Error("Booking not found")
  return {
    bookingId: booking.id,
    firstName: booking.user.firstName,
    lastName: booking.user.lastName,
    phone: booking.user.phone,
    roomNumber: booking.room?.roomNumber ?? "-",
    roomType: booking.roomType.name,
    bookingDate: booking.createdAt,
    moveInDate: booking.moveInDate,
    bookingFee: booking.bookingFee,
    advanceRent: booking.roomType.advanceRent,
    securityDeposit: booking.roomType.securityDeposit,
    slipUrl: booking.slipUrl,
    status: booking.status,
  }
}

// ดึงข้อมูล booking สำหรับกรอกสัญญาเช่า (contract-prefill)
// ตรวจสอบว่า booking อยู่ใน status CONFIRMED และยังไม่มีสัญญา
// เรียก: bookingRepository.getBookingForContract(), contractRepository.checkExistingContract()
// ส่งกลับ: ข้อมูลผู้เช่า ห้อง ค่าใช้จ่าย และยานพาหนะ สำหรับกรอกฟอร์มสัญญา
export const getBookingForContract = async (bookingId: string, propertyId: string) => {
  const booking = await repo.getBookingForContract(bookingId, propertyId)
  if (!booking) throw new Error("Booking not found or not confirmed")
  const existing = await checkExistingContract(bookingId)
  if (existing) throw new Error("Contract already exists for this booking")
  const rt = booking.roomType
  return {
    bookingId: booking.id,
    firstName: booking.user.firstName,
    lastName: booking.user.lastName,
    email: booking.user.email,
    phone: booking.user.phone,
    lineId: booking.user.lineId,
    address: booking.user.address,
    roomId: booking.room?.id ?? null,
    roomNumber: booking.room?.roomNumber ?? "-",
    roomType: rt.name,
    moveInDate: booking.moveInDate,
    securityDeposit: rt.securityDeposit,
    advanceRent: rt.advanceRent,
    totalDeposit: rt.securityDeposit + rt.advanceRent,
    vehicles: booking.user.vehicles.map((v) => ({
      plateNumber: v.plateNumber,
      type: v.type,
    })),
  }
}

// จับคู่ห้องว่างให้กับ booking อัตโนมัติ
// 1. ดึงข้อมูล booking และ preparingDays ของที่พัก
// 2. หาห้องที่พร้อมใช้ได้ ณ วันที่ moveInDate (AVAILABLE, PREPARING ที่พร้อมแล้ว, OCCUPIED ที่แจ้งออก)
// 3. Priority: ห้อง PREPARING/OCCUPIED-NOTICE ก่อน → AVAILABLE (เซฟห้องพร้อมไว้ให้คนเข้าเร็วกว่า)
// 4. assign ห้องเข้า booking และเปลี่ยนสถานะห้องเป็น RESERVED
// เรียก: bookingRepository หลายฟังก์ชัน
// ส่งกลับ: bookingId, roomId, roomNumber, assignedAt
export const assignRoom = async (bookingId: string, propertyId: string) => {
  const booking = await repo.getBookingDetail(bookingId, propertyId)
  if (!booking) throw new Error("Booking not found")
  if (booking.status !== "PENDING") throw new Error("Booking is not in PENDING status")
  if (!booking.moveInDate) throw new Error("moveInDate is required")

  const preparingDays = await repo.getPropertyPreparingDays(propertyId)
  const { availableRooms, preparingRooms } = await repo.getAvailableRoomsForDate(
    propertyId,
    booking.roomTypeId,
    new Date(booking.moveInDate),
    preparingDays
  )

  // Priority: ให้ PREPARING/OCCUPIED-NOTICE ก่อน เพื่อเซฟ AVAILABLE ไว้ให้คนเข้าเร็วกว่า
  const selectedRoom = preparingRooms[0] ?? availableRooms[0]
  if (!selectedRoom) throw new Error("No available room for this date")

  await repo.assignRoomToBooking(bookingId, selectedRoom.id)

  // ห้อง OCCUPIED ยังมีผู้เช่าอยู่ → ไม่เปลี่ยนสถานะ (ปล่อยให้กระบวนการ move-out จัดการ)
  // ห้อง AVAILABLE / PREPARING → เปลี่ยนเป็น RESERVED
  if (selectedRoom.status !== "OCCUPIED") {
    await repo.reserveRoom(selectedRoom.id)
  }

  return {
    bookingId,
    roomId: selectedRoom.id,
    roomNumber: selectedRoom.roomNumber,
    assignedAt: new Date(),
  }
}

// ยืนยัน booking (admin กด confirm)
// ถ้ายังไม่มีห้อง → auto assign ก่อนแล้วค่อย confirm
// ถ้ามีห้องแล้ว → confirm โดยตรง
// เรียก: bookingService.assignRoom() หรือ bookingRepository.confirmBooking()
// ส่งกลับ: { message: "Booking confirmed" }
export const confirmBooking = async (bookingId: string, propertyId: string) => {
  const booking = await repo.getBookingDetail(bookingId, propertyId)
  if (!booking) throw new Error("Booking not found")

  // ถ้ายังไม่มีห้อง → auto assign ก่อน
  if (!booking.roomId) {
    await assignRoom(bookingId, propertyId)
  } else {
    await repo.confirmBooking(bookingId)
  }

  return { message: "Booking confirmed" }
}

// ยกเลิก booking
// ตรวจสอบ: ไม่ใช่ CHECKED_IN และยังไม่มีสัญญาเช่า
// คืนสถานะห้องเป็น AVAILABLE ถ้ามีการ assign แล้ว
// เรียก: bookingRepository.cancelBooking(), bookingRepository.releaseRoom()
// ส่งกลับ: { message: "Booking cancelled" }
export const cancelBooking = async (bookingId: string, propertyId: string) => {
  const booking = await repo.getBookingDetail(bookingId, propertyId)
  if (!booking) throw new Error("Booking not found")
  if (booking.status === "CHECKED_IN") throw new Error("ไม่สามารถยกเลิกการจองที่เข้าอยู่แล้วได้")
  const existingContract = await checkExistingContract(bookingId)
  if (existingContract) throw new Error("ไม่สามารถยกเลิกการจองที่มีสัญญาเช่าแล้วได้")

  await repo.cancelBooking(bookingId)

  // คืน room ถ้ามีการ assign แล้ว
  if (booking.roomId) {
    await repo.releaseRoom(booking.roomId)
  }

  return { message: "Booking cancelled" }
}
