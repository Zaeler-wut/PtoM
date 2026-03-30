import { prisma } from "../../lib/prisma"

export const getContractsByProperty = async (propertyId: string) => {
  return prisma.contract.findMany({
    where: { room: { propertyId } },
    include: {
      user: true,
      room: { include: { roomType: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export const getContractById = async (contractId: string, propertyId: string) => {
  return prisma.contract.findFirst({
    where: { id: contractId, room: { propertyId } },
    include: {
      user: { include: { vehicles: true } },
      room: { include: { roomType: true } },
    },
  })
}

export const checkExistingContract = async (bookingId: string) => {
  return prisma.contract.findUnique({ where: { bookingId } })
}

export const findRoomInProperty = async (roomId: string, propertyId: string) => {
  return prisma.room.findFirst({
    where: { id: roomId, propertyId },
    include: { roomType: true },
  })
}

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } })
}

export const createTenantUser = async (data: {
  firstName: string
  lastName: string
  email: string
  phone?: string
  lineId?: string
  address?: string
}) => {
  const bcrypt = await import("bcrypt")
  const tempPassword = await bcrypt.hash(Math.random().toString(36).slice(2), 12)
  return prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      lineId: data.lineId,
      address: data.address,
      password: tempPassword,
      role: "USER",
    },
  })
}

export const updateUserInfo = async (
  userId: string,
  data: {
    firstName: string
    lastName: string
    phone?: string
    email: string
    lineId?: string
    address?: string
  }
) => {
  return prisma.user.update({ where: { id: userId }, data })
}

export const replaceVehicles = async (
  userId: string,
  vehicles: { plateNumber: string; type: string }[]
) => {
  await prisma.vehicle.deleteMany({ where: { userId } })
  if (vehicles.length === 0) return
  await prisma.vehicle.createMany({
    data: vehicles.map((v) => ({ userId, plateNumber: v.plateNumber, type: v.type })),
  })
}

export const createContract = async (data: {
  userId: string
  roomId: string
  bookingId?: string
  startDate: Date
  endDate: Date
  securityDeposit: number
  contractType: "ONLINE" | "OFFLINE"
  pdfUrl?: string
}) => {
  return prisma.contract.create({
    data: {
      userId: data.userId,
      roomId: data.roomId,
      bookingId: data.bookingId,
      startDate: data.startDate,
      endDate: data.endDate,
      securityDeposit: data.securityDeposit,
      contractType: data.contractType,
      pdfUrl: data.pdfUrl,
      status: "ACTIVE",
    },
  })
}

export const updateContract = async (
  contractId: string,
  data: {
    status?: string
    startDate?: Date
    endDate?: Date
    roomId?: string
    moveOutNoticeDate?: Date
  }
) => {
  return prisma.contract.update({
    where: { id: contractId },
    data: {
      status: data.status as any,
      startDate: data.startDate,
      endDate: data.endDate,
      roomId: data.roomId,
      moveOutNoticeDate: data.moveOutNoticeDate,
    },
  })
}

export const updateContractPdf = async (contractId: string, pdfUrl: string) => {
  return prisma.contract.update({
    where: { id: contractId },
    data: { pdfUrl },
  })
}

export const updateRoomStatus = async (roomId: string, status: string = "OCCUPIED") => {
  return prisma.room.update({
    where: { id: roomId },
    data: { status: status as any },
  })
}

export const updateBookingStatus = async (bookingId: string) => {
  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CHECKED_IN" },
  })
}
