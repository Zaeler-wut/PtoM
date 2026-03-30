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
