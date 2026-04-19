// tenantService.ts — business logic สำหรับ tenant module
// รับข้อมูลจาก tenantRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ tenantRepository สำหรับ query database

import * as repo from "./tenantRepository"

// ดึงรายชื่อผู้เช่าที่มีสัญญา ACTIVE หรือ MOVE_OUT_NOTICE
// เรียก: tenantRepository.getTenantsByProperty()
// ส่งกลับ: array ของผู้เช่าพร้อมข้อมูลห้องและสถานะสัญญา
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

// แก้ไขข้อมูลส่วนตัวของผู้เช่า — อัปเดต user และยานพาหนะ
// เรียก: tenantRepository.getTenantDetail(), updateUserInfo(), replaceVehicles()
// ส่งกลับ: { success: true }
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
  // แทนที่ยานพาหนะทั้งหมดถ้ามีการส่ง vehicles มา
  if (Array.isArray(data.vehicles)) {
    await repo.replaceVehicles(contract.user.id, data.vehicles)
  }
  return { success: true }
}

// ดูรายละเอียดผู้เช่าจาก contractId — รวมข้อมูล user, สัญญา และยานพาหนะ
// เรียก: tenantRepository.getTenantDetail()
// ส่งกลับ: ข้อมูล user, สัญญา, และยานพาหนะ
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
