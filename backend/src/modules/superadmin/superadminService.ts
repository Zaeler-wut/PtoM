import * as repo from "./superadminRepository"
import { hashPassword } from "../../utils/password"
import { generateAccessToken } from "../../utils/jwt"

export const getDashboard = () => repo.getDashboardStats()

export const getAdmins = () => repo.getAllAdmins()

export const createAdmin = async (data: {
  firstName: string
  lastName: string
  email: string
  password: string
  propertyLimit: number
}) => {
  if (!data.firstName?.trim()) throw new Error("firstName required")
  if (!data.lastName?.trim()) throw new Error("lastName required")
  if (!data.email?.trim()) throw new Error("email required")
  if (!data.password || data.password.length < 6)
    throw new Error("password must be at least 6 characters")

  const hashed = await hashPassword(data.password)
  return repo.createAdmin({ ...data, password: hashed })
}

export const updateLimit = (userId: string, propertyLimit: number) => {
  if (!propertyLimit || propertyLimit < 1) throw new Error("propertyLimit must be >= 1")
  return repo.updateAdminLimit(userId, propertyLimit)
}

export const setStatus = async (userId: string, isActive: boolean) => {
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  return repo.setUserStatus(userId, isActive)
}

export const resetPassword = async (userId: string, newPassword: string) => {
  if (!newPassword || newPassword.length < 6)
    throw new Error("password must be at least 6 characters")
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  const hashed = await hashPassword(newPassword)
  return repo.resetPassword(userId, hashed)
}

// Impersonate — คืน access token ของ user นั้นให้ superadmin ใช้
export const impersonate = async (userId: string) => {
  const user = await repo.findUserById(userId)
  if (!user) throw new Error("User not found")
  if (!user.isActive) throw new Error("User is inactive")
  // generate short-lived token (1h)
  const token = generateAccessToken({ id: user.id, role: user.role, email: user.email, firstName: '', lastName: '' })
  return { accessToken: token, userId: user.id, role: user.role }
}

export const getProperties = async () => {
  const rows = await repo.getAllProperties()
  return rows.map(p => ({
    id: p.id,
    name: p.name,
    address: p.address,
    createdAt: p.createdAt,
    totalRooms: p.rooms.length,
    admin: p.admins[0]?.user ?? null,
  }))
}

export const searchUsers = (q: string) => {
  if (!q?.trim()) throw new Error("query required")
  return repo.searchUsers(q.trim())
}
