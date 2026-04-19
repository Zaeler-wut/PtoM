export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"

export interface Tenant {
  contractId: string
  firstName: string
  lastName: string
  phone: string | null
  lineId: string | null
  roomNumber: string
  roomType: string
  contractStatus: ContractStatus
}

export interface TenantDetail {
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    lineId: string | null
    citizenId: string | null
    address: string | null
  }
  contract: {
    id: string
    roomNumber: string
    roomType: string
    floor: number | null
    startDate: string
    endDate: string
    status: ContractStatus
    securityDeposit: number
  }
  vehicles: { plateNumber: string; type: string }[]
}

export interface UpdateTenantPersonalInput {
  firstName: string
  lastName: string
  email: string
  phone?: string
  lineId?: string
  vehicles?: { plateNumber: string; type: string }[]
}
