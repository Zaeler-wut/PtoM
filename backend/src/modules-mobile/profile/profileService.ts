// profileService.ts (mobile) — business logic สำหรับ profile module ฝั่ง mobile
// รับข้อมูลจาก profileRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ profileRepository สำหรับ query database

import * as repo from "./profileRepository"
import type {
  ProfileResponse,
  UpdateProfileInput,
  UpdateProfileResponse,
} from "./profileModel"

// ดึงและ format ข้อมูลโปรไฟล์ tenant
// เรียก: profileRepository.getUserProfile()
// ส่งกลับ: ProfileResponse (ข้อมูลส่วนตัว + ห้องปัจจุบัน + สรุปบิล)
export const getProfile = async (userId: string): Promise<ProfileResponse> => {
  const user = await repo.getUserProfile(userId)
  if (!user) throw new Error("User not found")

  // map contract ทุกตัวเป็น CurrentRoomInfo — รวม monthlyRent จาก roomPrice + furniturePrice
  const currentRooms = user.contracts.map((contract) => {
    const rt = contract.room.roomType
    return {
      propertyName: contract.room.property.name,
      roomNumber: contract.room.roomNumber,
      roomType: rt.name,
      startDate: contract.startDate.toISOString().split("T")[0],
      monthlyRent: rt.roomPrice + (rt.furniturePrice ?? 0),
      roomPrice: rt.roomPrice,
      furniturePrice: rt.furniturePrice,
      status: contract.status,
    }
  })

  // นับบิลแต่ละสถานะ — unpaid = PENDING + VERIFYING รวมกัน
  const total = user.bills.length
  const paid = user.bills.filter((b) => b.status === "PAID").length
  const unpaid = user.bills.filter(
    (b) => b.status === "PENDING" || b.status === "VERIFYING"
  ).length

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    currentRooms,
    billSummary: { total, paid, unpaid },
  }
}

// อัพเดทข้อมูลส่วนตัว — validate ก่อนบันทึก
// เรียก: profileRepository.updateUserProfile()
// ส่งกลับ: UpdateProfileResponse (id, firstName, lastName, phone)
export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
): Promise<UpdateProfileResponse> => {
  if (!data.firstName?.trim()) throw new Error("firstName is required")
  if (!data.lastName?.trim()) throw new Error("lastName is required")

  return repo.updateUserProfile(userId, data)
}
