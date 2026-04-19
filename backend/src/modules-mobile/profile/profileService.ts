import * as repo from "./profileRepository"
import type {
  ProfileResponse,
  UpdateProfileInput,
  UpdateProfileResponse,
} from "./profileModel"


export const getProfile = async (userId: string): Promise<ProfileResponse> => {
  const user = await repo.getUserProfile(userId)
  if (!user) throw new Error("User not found")

  console.log("[profile] contracts found:", user.contracts.length, user.contracts.map(c => ({ id: c.id, status: c.status, room: c.room.roomNumber })))

  // ห้องปัจจุบันทั้งหมด (อาจมีหลายห้องหลายที่)
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
    currentRooms,
    billSummary: { total, paid, unpaid },
  }
}

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
): Promise<UpdateProfileResponse> => {
  if (!data.firstName?.trim()) throw new Error("firstName is required")
  if (!data.lastName?.trim()) throw new Error("lastName is required")

  return repo.updateUserProfile(userId, data)
}
