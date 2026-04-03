export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
export type ContractType = "ONLINE" | "OFFLINE"

export interface ContractListItem {
  contractId: string
  firstName: string
  lastName: string
  roomNumber: string
  contractType: ContractType
  status: ContractStatus
  startDate: string
  endDate: string
  duration: string
  pdfUrl: string | null
}

export interface ContractDetail {
  contractId: string
  contractType: ContractType
  status: ContractStatus
  startDate: string
  endDate: string
  createdAt: string
  moveOutNoticeDate: string | null
  duration: string
  pdfUrl: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string | null
    lineId: string | null
    address: string | null
  }
  room: {
    roomId: string
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
  vehicles?: { plateNumber: string; type: string }[]
}

export interface UpdateContractInput {
  status?: ContractStatus
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
