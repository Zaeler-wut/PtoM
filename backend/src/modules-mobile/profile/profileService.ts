import * as repo from "./profileRepository"
import type {
  ProfileResponse,
  UpdateProfileInput,
  UpdateProfileResponse,
} from "./profileModel"

// ─────────────────────────────────────────
// 1. ดึงข้อมูลโปรไฟล์
// ─────────────────────────────────────────

export const getProfile = async (userId: string): Promise<ProfileResponse> => {
  const user = await repo.getUserProfile(userId)
  if (!user) throw new Error("User not found")

  // ห้องปัจจุบัน
  const activeContract = user.contracts[0] ?? null
  let currentRoom = null

  if (activeContract) {
    const rt = activeContract.room.roomType
    const monthlyRent = rt.roomPrice + (rt.furniturePrice ?? 0)

    currentRoom = {
      propertyName: activeContract.room.property.name,
      roomNumber: activeContract.room.roomNumber,
      roomType: rt.name,
      startDate: activeContract.startDate.toISOString().split("T")[0],
      monthlyRent,
      roomPrice: rt.roomPrice,
      furniturePrice: rt.furniturePrice,
    }
  }

  // สรุปบิล
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
    currentRoom,
    billSummary: { total, paid, unpaid },
  }
}

// ─────────────────────────────────────────
// 2. แก้ไขข้อมูลส่วนตัว
// ─────────────────────────────────────────

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
): Promise<UpdateProfileResponse> => {
  if (!data.firstName?.trim()) throw new Error("firstName is required")
  if (!data.lastName?.trim()) throw new Error("lastName is required")

  return repo.updateUserProfile(userId, data)
}
