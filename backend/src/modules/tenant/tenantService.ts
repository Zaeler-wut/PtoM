import * as repo from "./tenantRepository"

export const getTenants = async (propertyId: string) => {
  const contracts = await repo.getTenantsByProperty(propertyId)
  return contracts.map((c) => ({
    contractId: c.id,
    firstName: c.user.firstName,
    lastName: c.user.lastName,
    phone: c.user.phone,
    lineId: c.user.lineId,
    roomNumber: c.room.roomNumber,
    roomType: c.room.roomType.name,
    contractStatus: c.status,
  }))
}

export const updateTenantPersonalInfo = async (
  contractId: string,
  propertyId: string,
  data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    lineId?: string
    vehicles?: { plateNumber: string; type: string }[]
  }
) => {
  const contract = await repo.getTenantDetail(contractId, propertyId)
  if (!contract) throw new Error("Tenant not found")
  await repo.updateUserInfo(contract.user.id, data)
  if (Array.isArray(data.vehicles)) {
    await repo.replaceVehicles(contract.user.id, data.vehicles)
  }
  return { success: true }
}

export const getTenantDetail = async (contractId: string, propertyId: string) => {
  const contract = await repo.getTenantDetail(contractId, propertyId)
  if (!contract) throw new Error("Tenant not found")
  return {
    user: {
      id: contract.user.id,
      firstName: contract.user.firstName,
      lastName: contract.user.lastName,
      email: contract.user.email,
      phone: contract.user.phone,
      lineId: contract.user.lineId,
      citizenId: contract.user.citizenId,
      address: contract.user.address,
    },
    contract: {
      id: contract.id,
      roomNumber: contract.room.roomNumber,
      roomType: contract.room.roomType.name,
      floor: contract.room.floor,
      startDate: contract.startDate,
      endDate: contract.endDate,
      status: contract.status,
      securityDeposit: contract.securityDeposit,
    },
    vehicles: contract.user.vehicles.map((v) => ({
      plateNumber: v.plateNumber,
      type: v.type,
    })),
  }
}
