import { prisma } from "../../lib/prisma"

// ── Dashboard ────────────────────────────────────────────────
export const getDashboardStats = async () => {
  const [totalAdmins, activeAdmins, totalUsers, totalProperties, totalRooms] =
    await Promise.all([
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({ where: { role: "ADMIN", isActive: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.property.count(),
      prisma.room.count(),
    ])

  const newThisMonth = await prisma.user.count({
    where: {
      role: "ADMIN",
      createdAt: { gte: new Date(new Date().setDate(1)) },
    },
  })

  return { totalAdmins, activeAdmins, totalUsers, totalProperties, totalRooms, newThisMonth }
}

// ── Admins ───────────────────────────────────────────────────
export const getAllAdmins = async () => {
  return prisma.user.findMany({
    where: { role: "ADMIN" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      createdAt: true,
      lastLogin: true,
      adminLimit: { select: { propertyLimit: true } },
      managedProperties: {
        select: { property: { select: { id: true, name: true } } },
      },
    },
  })
}

export const createAdmin = async (data: {
  firstName: string
  lastName: string
  email: string
  password: string
  propertyLimit: number
}) => {
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password,
      role: "ADMIN",
      adminLimit: {
        create: { propertyLimit: data.propertyLimit },
      },
    },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, isActive: true, createdAt: true,
      adminLimit: { select: { propertyLimit: true } },
    },
  })
}

export const updateAdminLimit = async (userId: string, propertyLimit: number) => {
  return prisma.adminLimit.upsert({
    where: { userId },
    update: { propertyLimit },
    create: { userId, propertyLimit },
  })
}

export const setUserStatus = async (userId: string, isActive: boolean) => {
  return prisma.user.update({
    where: { id: userId },
    data: { isActive },
    select: { id: true, isActive: true },
  })
}

export const resetPassword = async (userId: string, hashedPassword: string) => {
  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  })
}

export const findUserById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true, email: true },
  })
}

// ── Properties ───────────────────────────────────────────────
export const getAllProperties = async () => {
  return prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      address: true,
      createdAt: true,
      rooms: { select: { id: true } },
      admins: {
        select: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      },
    },
  })
}

// ── Users (Support) ──────────────────────────────────────────
export const searchUsers = async (q: string) => {
  return prisma.user.findMany({
    where: {
      role: "USER",
      OR: [
        { email: { contains: q, mode: "insensitive" } },
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true, firstName: true, lastName: true,
      email: true, isActive: true, createdAt: true, lastLogin: true,
    },
    take: 30,
  })
}
