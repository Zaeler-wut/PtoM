import { prisma } from "../../lib/prisma"


export type CreateUserData = {
  firstName: string
  lastName: string
  email: string
  password: string
  role: "USER" | "ADMIN"
}

// ค้นหา

export const findByEmail = (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  })
}

export const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  })
}



export const createUser = (data: CreateUserData) => {
  return prisma.user.create({
    data,
  })
}

export const updateLastLogin = (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() },
  })
}


export const saveRefreshToken = (userId: string, token: string) => {
  return prisma.refreshToken.create({
    data: {
      userId,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 วัน
    },
  })
}

export const findRefreshToken = (token: string) => {
  return prisma.refreshToken.findUnique({
    where: { token },
  })
}

export const revokeRefreshToken = (token: string) => {
  return prisma.refreshToken.update({
    where: { token },
    data: { revoked: true },
  })
}