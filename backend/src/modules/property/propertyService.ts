// propertyService.ts (web) — business logic สำหรับ property module ฝั่ง web admin
// รับข้อมูลจาก propertyRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ propertyRepository สำหรับ query database

import * as repo from "./propertyRepository"

// สร้าง property ใหม่ — ตรวจ limit ก่อนสร้าง
// limit = null หมายถึง admin ยังไม่ถูกกำหนดสิทธิ์ (AdminLimit ยังไม่มี)
// เรียก: propertyRepository.getAdminPropertyLimit(), createPropertyWithAdmin()
// ส่งกลับ: property record ที่สร้าง
export const createProperty = async (data: any) => {
  if (!data.userId) throw new Error("userId is required")
  if (!data.name) throw new Error("name is required")
  if (!data.address) throw new Error("address is required")

  const { count, limit } = await repo.getAdminPropertyLimit(data.userId)
  if (limit === null) {
    throw new Error("ไม่สามารถสร้างสถานที่ได้ กรุณาติดต่อผู้ดูแลระบบเพื่อกำหนดสิทธิ์")
  }
  if (count >= limit) {
    throw new Error(`ถึงขีดจำกัดการสร้างสถานที่แล้ว (${count}/${limit})`)
  }

  return repo.createPropertyWithAdmin(data)
}

// ดึง property ทั้งหมดของ admin พร้อมสรุปสถิติห้อง
// เรียก: propertyRepository.getAdminProperties()
// ส่งกลับ: PropertyListItem[]
export const getMyProperties = async (userId: string) => {
  const data = await repo.getAdminProperties(userId)
  return data.map((item) => {
    const p = item.property
    return {
      id: p.id,
      name: p.name,
      address: p.address,
      coverImage: p.images.find((img) => img.isCover)?.url || p.images[0]?.url || null,
      totalRooms: p.rooms.length,
      available: p.rooms.filter((r) => r.status === "AVAILABLE").length,
      occupied: p.rooms.filter((r) => r.status === "OCCUPIED").length,
      reserved: p.rooms.filter((r) => r.status === "RESERVED").length,
      bookingCount: p.bookings.filter((b) => b.status !== "CANCELLED").length,
    }
  })
}

// ดึงข้อมูล property ฉบับเต็ม — format facilities และ images
// เรียก: propertyRepository.getPropertyById()
// ส่งกลับ: PropertyDetail
export const getPropertyDetail = async (propertyId: string) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  console.log("raw facilities:", JSON.stringify(p.facilities))
  console.log("raw googleMap:", p.googleMap)
  return {
    id: p.id, name: p.name, address: p.address, googleMap: p.googleMap,
    description: p.description, priceMin: p.priceMin, priceMax: p.priceMax,
    contractTerm: p.contractTerm, preparingDays: p.preparingDays,
    bankName: p.bankName, bankAccount: p.bankAccount, bankHolder: p.bankHolder,
    paymentQrUrl: p.paymentQrUrl, logoUrl: p.logoUrl,
    lat: p.lat, lng: p.lng, billNote: p.billNote, phone: p.phone,
    facilities: p.facilities.map((f) => f.facility.name),
    images: p.images.map((img) => ({ id: img.id, url: img.url, isCover: img.isCover })),
  }
}

// แก้ไขข้อมูล property — อัพเดท facilities แยก (replace all) ถ้าส่งมาเป็น array
// เรียก: propertyRepository.updateProperty(), updatePropertyFacilities()
// ส่งกลับ: PropertyDetail ล่าสุดหลัง update
export const updateProperty = async (propertyId: string, data: any) => {
  console.log("updateProperty payload:", JSON.stringify(data))
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (data.priceMin !== undefined && data.priceMax !== undefined && data.priceMin > data.priceMax) {
    throw new Error("priceMin must not be greater than priceMax")
  }
  await repo.updateProperty(propertyId, data)
  if (Array.isArray(data.facilities)) {
    console.log("saving facilities:", data.facilities)
    await repo.updatePropertyFacilities(propertyId, data.facilities)
  } else {
    console.log("facilities not array:", data.facilities)
  }
  return getPropertyDetail(propertyId)
}

// ลบ property และทุกอย่างในนั้น (cascade ด้วยมือ)
// เรียก: propertyRepository.getPropertyById(), deleteProperty()
export const deleteProperty = async (propertyId: string) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  return repo.deleteProperty(propertyId)
}

// เพิ่มรูป property — validate property ก่อน
// เรียก: propertyRepository.addPropertyImages()
export const addPropertyImages = async (propertyId: string, urls: string[]) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (!urls?.length) throw new Error("urls is required")
  return repo.addPropertyImages(propertyId, urls)
}

// ลบรูป property — validate ว่ารูปนั้นเป็นของ property นี้
// เรียก: propertyRepository.deletePropertyImage()
export const deletePropertyImage = async (propertyId: string, imageId: string) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (!p.images.find((img) => img.id === imageId)) throw new Error("Image not found")
  return repo.deletePropertyImage(imageId)
}

// ตั้งรูป cover — validate property และ imageId ก่อน
// เรียก: propertyRepository.setCoverImage()
export const setCoverImage = async (propertyId: string, imageId: string) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (!p.images.find((img) => img.id === imageId)) throw new Error("Image not found in this property")
  return repo.setCoverImage(propertyId, imageId)
}

// สร้าง room type ใหม่ — validate name
// เรียก: propertyRepository.createRoomType()
export const createRoomType = async (propertyId: string, data: any) => {
  if (!data.name) throw new Error("name is required")
  return repo.createRoomType(propertyId, data)
}

// ดึง room type ทั้งหมดของ property — format fees label (name → title)
// เรียก: propertyRepository.getRoomTypesByProperty()
// ส่งกลับ: array ของ room type พร้อม roomCount
export const getRoomTypes = async (propertyId: string) => {
  const roomTypes = await repo.getRoomTypesByProperty(propertyId)
  return roomTypes.map((rt) => ({
    id: rt.id,
    name: rt.name,
    description: rt.description,
    size: rt.size,
    maxOccupants: rt.maxOccupants,
    roomPrice: rt.roomPrice,
    furniturePrice: rt.furniturePrice,
    waterRate: rt.waterRate,
    electricRate: rt.electricRate,
    bookingFee: rt.bookingFee,
    advanceRent: rt.advanceRent,
    securityDeposit: rt.securityDeposit,
    allowOnlineBooking: rt.allowOnlineBooking,
    roomCount: rt.rooms.length,
    fees: rt.fees.map((f) => ({ id: f.id, name: f.title, price: f.amount })),
    facilities: rt.facilities.map((f) => f.facility.name),
    images: rt.images.map((i) => ({ id: i.id, url: i.url })),
  }))
}

// ลบ room type — ป้องกันการลบถ้ามีห้องใช้ประเภทนี้อยู่
// เรียก: propertyRepository.getRoomTypeById(), deleteRoomType()
export const deleteRoomType = async (roomTypeId: string) => {
  const rt = await repo.getRoomTypeById(roomTypeId)
  if (!rt) throw new Error("RoomType not found")
  if (rt.rooms.length > 0) throw new Error("ไม่สามารถลบได้ มีห้องที่ใช้ประเภทนี้อยู่")
  return repo.deleteRoomType(roomTypeId)
}

// ดึงข้อมูล room type ฉบับเต็ม สำหรับหน้าแก้ไข
// เรียก: propertyRepository.getRoomTypeById()
// ส่งกลับ: RoomTypeDetail
export const getRoomTypeDetail = async (roomTypeId: string) => {
  const rt = await repo.getRoomTypeById(roomTypeId)
  if (!rt) throw new Error("RoomType not found")
  return {
    id: rt.id, name: rt.name, description: rt.description, size: rt.size,
    maxOccupants: rt.maxOccupants, price: rt.roomPrice, furniturePrice: rt.furniturePrice,
    waterRate: rt.waterRate, electricRate: rt.electricRate, bookingFee: rt.bookingFee,
    advanceRent: rt.advanceRent, securityDeposit: rt.securityDeposit,
    allowOnlineBooking: rt.allowOnlineBooking,
    images: rt.images.map((i) => ({ id: i.id, url: i.url })),
    fees: rt.fees.map((f) => ({ id: f.id, title: f.title, amount: f.amount })),
    facilities: rt.facilities.map((f) => f.facility.name),
  }
}

// แก้ไข room type — validate ค่าติดลบและ maxOccupants < 1
// อัพเดท facilities และ fees แยกถ้าส่งมา (replace all)
// เรียก: propertyRepository.updateRoomType(), updateRoomTypeFacilities(), updateRoomTypeFees()
export const updateRoomType = async (roomTypeId: string, data: any) => {
  const rt = await repo.getRoomTypeById(roomTypeId)
  if (!rt) throw new Error("RoomType not found")
  if (data.maxOccupants !== undefined && data.maxOccupants < 1) throw new Error("maxOccupants must be at least 1")
  if (data.roomPrice !== undefined && data.roomPrice < 0) throw new Error("roomPrice must not be negative")
  if (data.waterRate !== undefined && data.waterRate < 0) throw new Error("waterRate must not be negative")
  if (data.electricRate !== undefined && data.electricRate < 0) throw new Error("electricRate must not be negative")
  const updated = await repo.updateRoomType(roomTypeId, data)
  if (Array.isArray(data.facilities)) await repo.updateRoomTypeFacilities(roomTypeId, data.facilities)
  if (Array.isArray(data.fees)) {
    await repo.updateRoomTypeFees(roomTypeId, data.fees.filter((f: any) => f.title && f.amount !== undefined))
  }
  return updated
}

// เพิ่มรูป room type — จำกัดสูงสุด 5 รูป (นับจากที่มีอยู่แล้ว)
// เรียก: propertyRepository.addRoomTypeImages()
export const addRoomTypeImages = async (roomTypeId: string, urls: string[]) => {
  const rt = await repo.getRoomTypeById(roomTypeId)
  if (!rt) throw new Error("RoomType not found")
  if (!urls?.length) throw new Error("urls is required")
  const remaining = 5 - rt.images.length
  if (remaining <= 0) throw new Error("Maximum 5 images allowed")
  return repo.addRoomTypeImages(roomTypeId, urls.slice(0, remaining))
}

// ลบรูป room type — validate ว่ารูปนั้นเป็นของ room type นี้
// เรียก: propertyRepository.deleteRoomTypeImage()
export const deleteRoomTypeImage = async (roomTypeId: string, imageId: string) => {
  const rt = await repo.getRoomTypeById(roomTypeId)
  if (!rt) throw new Error("RoomType not found")
  if (!rt.images.find((img) => img.id === imageId)) throw new Error("Image not found in this room type")
  return repo.deleteRoomTypeImage(imageId)
}
