// propertyRepository.ts (web) — query database สำหรับ property module
// ทุก function ติดต่อ Prisma โดยตรง ไม่มี business logic
// ถูกเรียกใช้จาก propertyService.ts เท่านั้น

import { prisma } from "../../lib/prisma"

// ดึง property ทั้งหมดที่ admin คนนี้ดูแล ผ่าน PropertyAdmin table
// include: rooms, bookings, images — ใช้สรุปสถิติใน PropertyListItem
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

// ดึงจำนวน property ที่ admin มีและ limit สูงสุดที่อนุญาต — ใช้ก่อน createProperty
export const getAdminPropertyLimit = async (userId: string) => {
  const [count, limit] = await Promise.all([
    prisma.propertyAdmin.count({ where: { userId } }),
    prisma.adminLimit.findUnique({ where: { userId }, select: { propertyLimit: true } }),
  ])
  return { count, limit: limit?.propertyLimit ?? null }
}

// สร้าง property ใหม่พร้อมผูก admin คนนี้เป็นเจ้าของ (PropertyAdmin record)
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

// ดึง property เดียวพร้อม images และ facilities — ใช้ใน getPropertyDetail และ validate ก่อน update/delete
export const getPropertyById = async (propertyId: string) => {
  return prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      images: true,
      facilities: { include: { facility: true } },
    },
  })
}

// อัพเดทข้อมูล property — ครอบคลุม fields ทั้งหมดรวม lat/lng/billNote/phone
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
      lat: data.lat,
      lng: data.lng,
      billNote: data.billNote,
      phone: data.phone,
    },
  })
}

// replace facilities ทั้งหมดของ property — ลบเก่าแล้ว upsert ใหม่
// Facility เป็น global table (upsert by name) แล้วผูกผ่าน PropertyFacility
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

// ลบ property พร้อม cascade ด้วยมือ (leaf → root) เพราะ Prisma ไม่ทำ cascade delete อัตโนมัติ
// ลำดับ: payment → billItem → bill → moveOutBillItem → moveOutBill → contract → meterImage → meterReading
//        → booking → room → roomTypeFee → roomTypeImage → roomFacility → roomType
//        → propertyFacility → propertyImage → propertyAdmin → property
export const deleteProperty = async (propertyId: string) => {
  const rooms = await prisma.room.findMany({ where: { propertyId }, select: { id: true } })
  const roomIds = rooms.map((r) => r.id)

  const contracts = await prisma.contract.findMany({ where: { roomId: { in: roomIds } }, select: { id: true } })
  const contractIds = contracts.map((c) => c.id)

  const moveOutBills = await prisma.moveOutBill.findMany({ where: { contractId: { in: contractIds } }, select: { id: true } })
  await prisma.moveOutBillItem.deleteMany({ where: { moveOutBillId: { in: moveOutBills.map((m) => m.id) } } })
  await prisma.moveOutBill.deleteMany({ where: { contractId: { in: contractIds } } })

  const bills = await prisma.bill.findMany({ where: { contractId: { in: contractIds } }, select: { id: true } })
  const billIds = bills.map((b) => b.id)
  await prisma.payment.deleteMany({ where: { billId: { in: billIds } } })
  await prisma.billItem.deleteMany({ where: { billId: { in: billIds } } })
  await prisma.bill.deleteMany({ where: { contractId: { in: contractIds } } })

  await prisma.contract.deleteMany({ where: { id: { in: contractIds } } })

  const meters = await prisma.meterReading.findMany({ where: { roomId: { in: roomIds } }, select: { id: true } })
  await prisma.meterImage.deleteMany({ where: { meterReadingId: { in: meters.map((m) => m.id) } } })
  await prisma.meterReading.deleteMany({ where: { roomId: { in: roomIds } } })

  await prisma.booking.deleteMany({ where: { propertyId } })
  await prisma.room.deleteMany({ where: { propertyId } })

  const roomTypes = await prisma.roomType.findMany({ where: { propertyId }, select: { id: true } })
  const roomTypeIds = roomTypes.map((rt) => rt.id)
  await prisma.roomTypeFee.deleteMany({ where: { roomTypeId: { in: roomTypeIds } } })
  await prisma.roomTypeImage.deleteMany({ where: { roomTypeId: { in: roomTypeIds } } })
  await prisma.roomFacility.deleteMany({ where: { roomTypeId: { in: roomTypeIds } } })
  await prisma.roomType.deleteMany({ where: { propertyId } })

  await prisma.propertyFacility.deleteMany({ where: { propertyId } })
  await prisma.propertyImage.deleteMany({ where: { propertyId } })
  await prisma.propertyAdmin.deleteMany({ where: { propertyId } })

  return prisma.property.delete({ where: { id: propertyId } })
}

// เพิ่มรูป property หลายรูปพร้อมกัน
export const addPropertyImages = async (propertyId: string, urls: string[]) => {
  return prisma.propertyImage.createMany({
    data: urls.map((url) => ({ propertyId, url })),
  })
}

// ลบรูป property ทีละรูป
export const deletePropertyImage = async (imageId: string) => {
  return prisma.propertyImage.delete({ where: { id: imageId } })
}

// ตั้งรูป cover — reset isCover ทุกรูปก่อนแล้วตั้งรูปที่เลือกเป็น cover
export const setCoverImage = async (propertyId: string, imageId: string) => {
  await prisma.propertyImage.updateMany({ where: { propertyId }, data: { isCover: false } })
  return prisma.propertyImage.update({ where: { id: imageId }, data: { isCover: true } })
}

// สร้าง room type ใหม่ — upsert facility by name แล้วผูกผ่าน RoomFacility
// images จำกัดสูงสุด 5 รูป (slice)
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

// ดึง room type ทั้งหมดของ property พร้อม images, fees, facilities และจำนวนห้อง
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

// ลบ room type — ลบ child records ใน $transaction ก่อน แล้วลบ roomType
export const deleteRoomType = async (roomTypeId: string) => {
  await prisma.$transaction([
    prisma.roomTypeImage.deleteMany({ where: { roomTypeId } }),
    prisma.roomTypeFee.deleteMany({ where: { roomTypeId } }),
    prisma.roomFacility.deleteMany({ where: { roomTypeId } }),
  ])
  return prisma.roomType.delete({ where: { id: roomTypeId } })
}

// ดึง room type เดียวพร้อมข้อมูลครบ — ใช้ validate ก่อน update/delete
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

// อัพเดท room type fields พื้นฐาน — facilities และ fees ใช้ function แยก
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

// replace facilities ของ room type ทั้งหมด — ลบเก่าแล้ว upsert ใหม่เหมือน property
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

// replace fees ของ room type ทั้งหมด — ลบเก่าแล้ว createMany ใหม่
export const updateRoomTypeFees = async (roomTypeId: string, fees: { title: string; amount: number }[]) => {
  await prisma.roomTypeFee.deleteMany({ where: { roomTypeId } })
  if (fees.length === 0) return
  await prisma.roomTypeFee.createMany({
    data: fees.map((f) => ({ roomTypeId, title: f.title, amount: f.amount })),
  })
}

// เพิ่มรูป room type หลายรูปพร้อมกัน
export const addRoomTypeImages = async (roomTypeId: string, urls: string[]) => {
  return prisma.roomTypeImage.createMany({ data: urls.map((url) => ({ roomTypeId, url })) })
}

// ลบรูป room type ทีละรูป
export const deleteRoomTypeImage = async (imageId: string) => {
  return prisma.roomTypeImage.delete({ where: { id: imageId } })
}
