export interface TenantListItem {
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
    startDate: Date
    endDate: Date
    status: ContractStatus
    securityDeposit: number
  }
  vehicles: VehicleItem[]
}

export interface VehicleItem {
  plateNumber: string
  type: string
}

export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
