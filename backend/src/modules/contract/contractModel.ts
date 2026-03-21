export interface ContractListItem {
  contractId: string
  firstName: string
  lastName: string
  roomNumber: string
  contractType: ContractType
  status: ContractStatus
  startDate: Date
  endDate: Date
  duration: string
  pdfUrl: string | null
}

export interface ContractDetail {
  contractId: string
  contractType: ContractType
  status: ContractStatus
  startDate: Date
  endDate: Date
  createdAt: Date
  duration: string
  pdfUrl: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    phone: string | null
  }
  room: {
    roomNumber: string
    roomType: string
    roomPrice: number
  }
  vehicles: { plateNumber: string; type: string }[]
  financial: {
    securityDeposit: number
    advanceRent: number
    waterRate: number
    electricRate: number
    furniturePrice: number | null
  }
}

export interface CreateContractInput {
  bookingId?: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  lineId?: string
  houseNumber?: string
  soi?: string
  road?: string
  subDistrict?: string
  district?: string
  province?: string
  roomId: string
  startDate: string
  endDate: string
  securityDeposit: number
  pdfUrl?: string
  vehicles?: { plateNumber: string; type: string }[]
}

export interface UpdateContractInput {
  status?: ContractStatus
  moveOutNoticeDate?: string
  firstName?: string
  lastName?: string
  roomId?: string
  startDate?: string
  endDate?: string
  vehicles?: { plateNumber: string; type: string }[]
}

export interface ContractResponse {
  contractId: string
  contractType: ContractType
  roomNumber: string
  roomType: string
  startDate: Date
  endDate: Date
  securityDeposit: number
  pdfUrl?: string | null
  status: ContractStatus
}

export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
export type ContractType = "ONLINE" | "OFFLINE"
