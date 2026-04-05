export interface MyContractItem {
  contractId: string
  propertyName: string
  roomNumber: string
  contractDuration: string  // เช่น "12 เดือน"
  startDate: string
  endDate: string
  status: ContractStatus
  pdfUrl: string | null // กดดูรายละเอียด เปิด PDF
}

export type ContractStatus = "ACTIVE" | "MOVE_OUT_NOTICE" | "ENDED"
