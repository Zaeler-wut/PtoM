import { prisma } from "../../lib/prisma"

// ─────────────────────────────────────────
// PROPERTIES
// ─────────────────────────────────────────

export const getAdminProperties = async (userId: string) => {
  return prisma.propertyAdmin.findMany({
    where: { userId },
    include: {
      property: {
        include: { rooms: true, bookings: true, images: true },
      },
    },
  })
}

export const createPropertyWithAdmin = async (data: any) => {
  return prisma.property.create({
    data: {
      name: data.name,
      address: data.address,
      googleMap: data.googleMap,
      description: data.description,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      contractTerm: data.contractTerm,
      preparingDays: data.preparingDays ?? 3,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      bankHolder: data.bankHolder,
      paymentQrUrl: data.paymentQrUrl,
      logoUrl: data.logoUrl,
      admins: { create: { userId: data.userId } },
    },
  })
}

export const getPropertyById = async (propertyId: string) => {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      images: true,
      facilities: { include: { facility: true } },
    },
  })
}

export const updateProperty = async (propertyId: string, data: any) => {
  return prisma.property.update({
    where: { id: propertyId },
    data: {
      name: data.name,
      address: data.address,
      googleMap: data.googleMap,
      description: data.description,
      priceMin: data.priceMin,
      priceMax: data.priceMax,
      contractTerm: data.contractTerm,
      preparingDays: data.preparingDays,
      bankName: data.bankName,
      bankAccount: data.bankAccount,
      bankHolder: data.bankHolder,
      paymentQrUrl: data.paymentQrUrl,
      logoUrl: data.logoUrl,
    },
  })
}

export const updatePropertyFacilities = async (propertyId: string, facilityNames: string[]) => {
  await prisma.propertyFacility.deleteMany({ where: { propertyId } })
  if (facilityNames.length === 0) return
  const facilities = await Promise.all(
    facilityNames.map(async (name) => {
      let f = await prisma.facility.findUnique({ where: { name } })
      if (!f) f = await prisma.facility.create({ data: { name } })
      return f
    })
  )
  await prisma.propertyFacility.createMany({
    data: facilities.map((f) => ({ propertyId, facilityId: f.id })),
  })
}

export const addPropertyImages = async (propertyId: string, urls: string[]) => {
  return prisma.propertyImage.createMany({
    data: urls.map((url) => ({ propertyId, url })),
  })
}

export const deletePropertyImage = async (imageId: string) => {
  return prisma.propertyImage.delete({ where: { id: imageId } })
}

export const setCoverImage = async (propertyId: string, imageId: string) => {
  await prisma.propertyImage.updateMany({ where: { propertyId }, data: { isCover: false } })
  return prisma.propertyImage.update({ where: { id: imageId }, data: { isCover: true } })
}

// ─────────────────────────────────────────
// ROOM TYPES
// ─────────────────────────────────────────

export const createRoomType = async (propertyId: string, data: any) => {
  const facilities = await Promise.all(
    (data.facilities || []).map(async (name: string) => {
      let f = await prisma.facility.findUnique({ where: { name } })
      if (!f) f = await prisma.facility.create({ data: { name } })
      return f
    })
  )
  return prisma.roomType.create({
    data: {
      propertyId,
      name: data.name,
      description: data.description,
      size: data.size,
      maxOccupants: data.maxOccupants,
      roomPrice: data.roomPrice,
      furniturePrice: data.furniturePrice,
      bookingFee: data.bookingFee,
      advanceRent: data.advanceRent,
      securityDeposit: data.securityDeposit,
      waterRate: data.waterRate,
      electricRate: data.electricRate,
      allowOnlineBooking: data.allowOnlineBooking ?? true,
      facilities: { create: facilities.map((f) => ({ facilityId: f.id })) },
      images: { create: (data.images || []).slice(0, 5).map((url: string) => ({ url })) },
      fees: { create: (data.fees || []).map((f: any) => ({ title: f.title, amount: f.amount })) },
    },
  })
}

export const getRoomTypesByProperty = async (propertyId: string) => {
  return prisma.roomType.findMany({
    where: { propertyId },
    include: {
      images: true,
      fees: true,
      facilities: { include: { facility: true } },
      rooms: { select: { id: true } },
    },
    orderBy: { id: "asc" },
  })
}

export const deleteRoomType = async (roomTypeId: string) => {
  await prisma.$transaction([
    prisma.roomTypeImage.deleteMany({ where: { roomTypeId } }),
    prisma.roomTypeFee.deleteMany({ where: { roomTypeId } }),
    prisma.roomFacility.deleteMany({ where: { roomTypeId } }),
  ])
  return prisma.roomType.delete({ where: { id: roomTypeId } })
}

export const getRoomTypeById = async (roomTypeId: string) => {
  return prisma.roomType.findUnique({
    where: { id: roomTypeId },
    include: {
      images: true,
      fees: true,
      facilities: { include: { facility: true } },
      rooms: { select: { id: true } },
    },
  })
}

export const updateRoomType = async (roomTypeId: string, data: any) => {
  return prisma.roomType.update({
    where: { id: roomTypeId },
    data: {
      name: data.name,
      description: data.description,
      size: data.size,
      maxOccupants: data.maxOccupants,
      roomPrice: data.roomPrice,
      furniturePrice: data.furniturePrice,
      bookingFee: data.bookingFee,
      advanceRent: data.advanceRent,
      securityDeposit: data.securityDeposit,
      waterRate: data.waterRate,
      electricRate: data.electricRate,
      allowOnlineBooking: data.allowOnlineBooking,
    },
  })
}

export const updateRoomTypeFacilities = async (roomTypeId: string, facilityNames: string[]) => {
  await prisma.roomFacility.deleteMany({ where: { roomTypeId } })
  if (facilityNames.length === 0) return
  const facilities = await Promise.all(
    facilityNames.map(async (name) => {
      let f = await prisma.facility.findUnique({ where: { name } })
      if (!f) f = await prisma.facility.create({ data: { name } })
      return f
    })
  )
  await prisma.roomFacility.createMany({
    data: facilities.map((f) => ({ roomTypeId, facilityId: f.id })),
  })
}

export const updateRoomTypeFees = async (roomTypeId: string, fees: { title: string; amount: number }[]) => {
  await prisma.roomTypeFee.deleteMany({ where: { roomTypeId } })
  if (fees.length === 0) return
  await prisma.roomTypeFee.createMany({
    data: fees.map((f) => ({ roomTypeId, title: f.title, amount: f.amount })),
  })
}

export const addRoomTypeImages = async (roomTypeId: string, urls: string[]) => {
  return prisma.roomTypeImage.createMany({ data: urls.map((url) => ({ roomTypeId, url })) })
}

export const deleteRoomTypeImage = async (imageId: string) => {
  return prisma.roomTypeImage.delete({ where: { id: imageId } })
}
