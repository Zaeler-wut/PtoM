import * as repo from "./contractRepository"

// HELPERS

function buildAddress(data: {
  houseNumber?: string
  soi?: string
  road?: string
  subDistrict?: string
  district?: string
  province?: string
}): string {
  return [
    data.houseNumber,
    data.soi ? `ซ.${data.soi}` : null,
    data.road ? `ถ.${data.road}` : null,
    data.subDistrict,
    data.district,
    data.province,
  ]
    .filter(Boolean)
    .join(" ")
}

function validateContractData(data: any) {
  if (!data.firstName?.trim()) throw new Error("firstName is required")
  if (!data.lastName?.trim()) throw new Error("lastName is required")
  if (!data.email?.trim()) throw new Error("email is required")
  if (!data.roomId) throw new Error("roomId is required")
  if (!data.startDate) throw new Error("startDate is required")
  if (!data.endDate) throw new Error("endDate is required")
  if (data.securityDeposit === undefined) throw new Error("securityDeposit is required")
  const startDate = new Date(data.startDate)
  const endDate = new Date(data.endDate)
  if (isNaN(startDate.getTime())) throw new Error("startDate is invalid")
  if (isNaN(endDate.getTime())) throw new Error("endDate is invalid")
  if (endDate <= startDate) throw new Error("endDate must be after startDate")
  return { startDate, endDate }
}

async function resolveUser(data: {
  email: string
  firstName: string
  lastName: string
  phone?: string
  lineId?: string
  address?: string
}) {
  const email = data.email.trim().toLowerCase()
  let user = await repo.findUserByEmail(email)
  if (user) {
    await repo.updateUserInfo(user.id, {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phone: data.phone,
      email,
      lineId: data.lineId,
      address: data.address,
    })
  } else {
    user = await repo.createTenantUser({
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email,
      phone: data.phone,
      lineId: data.lineId,
      address: data.address,
    })
  }
  return user
}


// CONTRACT LIST / DETAIL


export const getContracts = async (propertyId: string) => {
  const contracts = await repo.getContractsByProperty(propertyId)
  return contracts.map((c) => {
    const months = Math.round(
      (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
    )
    return {
      contractId: c.id,
      firstName: c.user.firstName,
      lastName: c.user.lastName,
      roomNumber: c.room.roomNumber,
      contractType: c.contractType,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      duration: `${months} เดือน`,
      pdfUrl: c.pdfUrl,
    }
  })
}

export const getContractDetail = async (contractId: string, propertyId: string) => {
  const c = await repo.getContractById(contractId, propertyId)
  if (!c) throw new Error("Contract not found")
  const months = Math.round(
    (c.endDate.getTime() - c.startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
  )
  const rt = c.room.roomType
  return {
    contractId: c.id,
    contractType: c.contractType,
    status: c.status,
    startDate: c.startDate,
    endDate: c.endDate,
    createdAt: c.createdAt,
    moveOutNoticeDate: c.moveOutNoticeDate ?? null,
    duration: `${months} เดือน`,
    pdfUrl: c.pdfUrl,
    user: {
      id: c.user.id,
      firstName: c.user.firstName,
      lastName: c.user.lastName,
      email: c.user.email,
      phone: c.user.phone,
      lineId: c.user.lineId,
      address: c.user.address,
    },
    room: {
      roomId: c.room.id,
      roomNumber: c.room.roomNumber,
      roomType: rt.name,
      roomPrice: rt.roomPrice,
    },
    vehicles: c.user.vehicles.map((v) => ({
      plateNumber: v.plateNumber,
      type: v.type,
    })),
    financial: {
      securityDeposit: c.securityDeposit,
      advanceRent: rt.advanceRent,
      waterRate: rt.waterRate,
      electricRate: rt.electricRate,
      furniturePrice: rt.furniturePrice,
    },
  }
}

export const uploadContractPdf = async (
  contractId: string,
  propertyId: string,
  pdfUrl: string
) => {
  const c = await repo.getContractById(contractId, propertyId)
  if (!c) throw new Error("Contract not found")
  if (!pdfUrl) throw new Error("pdfUrl is required")
  return repo.updateContractPdf(contractId, pdfUrl)
}

export const updateContract = async (
  contractId: string,
  propertyId: string,
  data: {
    status?: "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
    moveOutNoticeDate?: string
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    lineId?: string
    address?: string
    roomId?: string
    startDate?: string
    endDate?: string
    vehicles?: { plateNumber: string; type: string }[]
  }
) => {
  const c = await repo.getContractById(contractId, propertyId)
  if (!c) throw new Error("Contract not found")

  if (data.status) {
    const isStatusChanging = data.status !== c.status
    if (isStatusChanging) {
      const allowedTransitions: Record<string, string[]> = {
        ACTIVE: ["MOVE_OUT_NOTICE", "ENDED"],
        MOVE_OUT_NOTICE: ["ACTIVE", "ENDED"],
        ENDED: [],
      }
      if (!allowedTransitions[c.status]?.includes(data.status)) {
        throw new Error(`Cannot change status from ${c.status} to ${data.status}`)
      }
      if (data.status === "MOVE_OUT_NOTICE" && !data.moveOutNoticeDate) {
        throw new Error("moveOutNoticeDate is required when status is MOVE_OUT_NOTICE")
      }
    }
  }

  let startDate: Date | undefined
  let endDate: Date | undefined
  if (data.startDate) {
    startDate = new Date(data.startDate)
    if (isNaN(startDate.getTime())) throw new Error("startDate is invalid")
  }
  if (data.endDate) {
    endDate = new Date(data.endDate)
    if (isNaN(endDate.getTime())) throw new Error("endDate is invalid")
  }
  if (startDate && endDate && endDate <= startDate) {
    throw new Error("endDate must be after startDate")
  }

  await repo.updateUserInfo(c.userId, {
    firstName: data.firstName?.trim() ?? c.user.firstName,
    lastName: data.lastName?.trim() ?? c.user.lastName,
    email: data.email?.trim() ?? c.user.email,
    phone: data.phone?.trim() ?? c.user.phone ?? undefined,
    lineId: data.lineId?.trim() ?? c.user.lineId ?? undefined,
    address: data.address?.trim() ?? c.user.address ?? undefined,
  })

  if (Array.isArray(data.vehicles)) {
    await repo.replaceVehicles(c.userId, data.vehicles)
  }

  if (data.roomId && data.roomId !== c.roomId) {
    const newRoom = await repo.findRoomInProperty(data.roomId, propertyId)
    if (!newRoom) throw new Error("New room not found in this property")
    if (newRoom.status === "OCCUPIED") throw new Error("New room is already occupied")
    await repo.updateRoomStatus(c.roomId, "AVAILABLE")
    await repo.updateRoomStatus(data.roomId, "OCCUPIED")
  }

  if (data.status === "ENDED") {
    await repo.updateRoomStatus(c.roomId, "AVAILABLE")
  }

  const moveOutNoticeDate = data.moveOutNoticeDate
    ? new Date(data.moveOutNoticeDate)
    : undefined

  const updated = await repo.updateContract(contractId, {
    status: data.status,
    startDate,
    endDate,
    roomId: data.roomId,
    moveOutNoticeDate,
  })

  return {
    contractId: updated.id,
    status: updated.status,
    startDate: updated.startDate,
    endDate: updated.endDate,
    roomId: updated.roomId,
  }
}


// CREATE CONTRACT


export const createOnlineContract = async (propertyId: string, data: any) => {
  const { startDate, endDate } = validateContractData(data)
  const room = await repo.findRoomInProperty(data.roomId, propertyId)
  if (!room) throw new Error("Room not found in this property")
  if (room.status === "OCCUPIED") throw new Error("Room is already occupied")
  if (data.bookingId) {
    const existing = await repo.checkExistingContract(data.bookingId)
    if (existing) throw new Error("Contract already exists for this booking")
  }
  const address = buildAddress(data)
  const user = await resolveUser({ ...data, address })
  if (Array.isArray(data.vehicles)) await repo.replaceVehicles(user.id, data.vehicles)
  const contract = await repo.createContract({
    userId: user.id,
    roomId: data.roomId,
    bookingId: data.bookingId,
    startDate,
    endDate,
    securityDeposit: data.securityDeposit,
    contractType: "ONLINE",
    pdfUrl: data.pdfUrl,
  })
  await repo.updateRoomStatus(data.roomId, "OCCUPIED")
  if (data.bookingId) await repo.updateBookingStatus(data.bookingId)
  return {
    contractId: contract.id,
    contractType: contract.contractType,
    roomNumber: room.roomNumber,
    roomType: room.roomType.name,
    startDate: contract.startDate,
    endDate: contract.endDate,
    securityDeposit: contract.securityDeposit,
    status: contract.status,
  }
}

export const createOfflineContract = async (propertyId: string, data: any) => {
  const { startDate, endDate } = validateContractData(data)
  const room = await repo.findRoomInProperty(data.roomId, propertyId)
  if (!room) throw new Error("Room not found in this property")
  if (room.status === "OCCUPIED") throw new Error("Room is already occupied")
  const address = buildAddress(data)
  const user = await resolveUser({ ...data, address })
  if (Array.isArray(data.vehicles)) await repo.replaceVehicles(user.id, data.vehicles)
  const contract = await repo.createContract({
    userId: user.id,
    roomId: data.roomId,
    startDate,
    endDate,
    securityDeposit: data.securityDeposit,
    contractType: "OFFLINE",
    pdfUrl: data.pdfUrl,
  })
  await repo.updateRoomStatus(data.roomId, "OCCUPIED")
  return {
    contractId: contract.id,
    contractType: contract.contractType,
    roomNumber: room.roomNumber,
    roomType: room.roomType.name,
    startDate: contract.startDate,
    endDate: contract.endDate,
    securityDeposit: contract.securityDeposit,
    pdfUrl: contract.pdfUrl,
    status: contract.status,
  }
}
