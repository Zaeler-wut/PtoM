import * as repo from "./propertyRepository"

export const createProperty = async (data: any) => {
  if (!data.userId) throw new Error("userId is required")
  if (!data.name) throw new Error("name is required")
  if (!data.address) throw new Error("address is required")
  return repo.createPropertyWithAdmin(data)
}

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

export const getPropertyDetail = async (propertyId: string) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  return {
    id: p.id, name: p.name, address: p.address, googleMap: p.googleMap,
    description: p.description, priceMin: p.priceMin, priceMax: p.priceMax,
    contractTerm: p.contractTerm, preparingDays: p.preparingDays,
    bankName: p.bankName, bankAccount: p.bankAccount, bankHolder: p.bankHolder,
    paymentQrUrl: p.paymentQrUrl, logoUrl: p.logoUrl,
    facilities: p.facilities.map((f) => f.facility.name),
    images: p.images.map((img) => ({ id: img.id, url: img.url, isCover: img.isCover })),
  }
}

export const updateProperty = async (propertyId: string, data: any) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (data.priceMin !== undefined && data.priceMax !== undefined && data.priceMin > data.priceMax) {
    throw new Error("priceMin must not be greater than priceMax")
  }
  const updated = await repo.updateProperty(propertyId, data)
  if (Array.isArray(data.facilities)) await repo.updatePropertyFacilities(propertyId, data.facilities)
  return updated
}

export const addPropertyImages = async (propertyId: string, urls: string[]) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (!urls?.length) throw new Error("urls is required")
  return repo.addPropertyImages(propertyId, urls)
}

export const deletePropertyImage = async (propertyId: string, imageId: string) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (!p.images.find((img) => img.id === imageId)) throw new Error("Image not found")
  return repo.deletePropertyImage(imageId)
}

export const setCoverImage = async (propertyId: string, imageId: string) => {
  const p = await repo.getPropertyById(propertyId)
  if (!p) throw new Error("Property not found")
  if (!p.images.find((img) => img.id === imageId)) throw new Error("Image not found in this property")
  return repo.setCoverImage(propertyId, imageId)
}

export const createRoomType = async (propertyId: string, data: any) => {
  if (!data.name) throw new Error("name is required")
  return repo.createRoomType(propertyId, data)
}

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

export const addRoomTypeImages = async (roomTypeId: string, urls: string[]) => {
  const rt = await repo.getRoomTypeById(roomTypeId)
  if (!rt) throw new Error("RoomType not found")
  if (!urls?.length) throw new Error("urls is required")
  const remaining = 5 - rt.images.length
  if (remaining <= 0) throw new Error("Maximum 5 images allowed")
  return repo.addRoomTypeImages(roomTypeId, urls.slice(0, remaining))
}

export const deleteRoomTypeImage = async (roomTypeId: string, imageId: string) => {
  const rt = await repo.getRoomTypeById(roomTypeId)
  if (!rt) throw new Error("RoomType not found")
  if (!rt.images.find((img) => img.id === imageId)) throw new Error("Image not found in this room type")
  return repo.deleteRoomTypeImage(imageId)
}
