import { prisma } from "../../lib/prisma"

export const findByEmail = (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

export const createUser = (data: any) => {
  return prisma.user.create({ data })
}

export const updateLastLogin = (id: string) => {
  return prisma.user.update({
    where: { id },
    data: { lastLogin: new Date() }
  })
}

export const findById = (id: string) => {
  return prisma.user.findUnique({
    where: { id }
  })
}