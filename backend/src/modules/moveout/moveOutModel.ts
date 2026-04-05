// LIST
export interface MoveOutListResponse {
  pending: MoveOutPendingItem[]
  completed: MoveOutCompletedItem[]
}

export interface MoveOutPendingItem {
  contractId: string
  firstName: string
  lastName: string
  phone: string | null
  roomNumber: string
  roomType: string
  status: string
  moveOutDate: Date
}

export interface MoveOutCompletedItem {
  moveOutBillId: string
  firstName: string
  lastName: string
  roomNumber: string
  roomType: string
  moveOutDate: Date
  refundAmount: number
  status: MoveOutBillStatus
}


// PREVIEW / CREATE INPUT


export interface MoveOutBillInput {
  moveOutDate: string
  billingStartDay: number
  billingEndDay: number
  waterStart: number
  waterEnd: number
  electricStart: number
  electricEnd: number
  damageItems?: { title: string; amount: number }[]
  additionalItems?: { title: string; amount: number }[]
}


// PREVIEW RESPONSE


export interface MoveOutPreviewResponse {
  tenant: {
    firstName: string
    lastName: string
    roomNumber: string
    roomType: string
  }
  contract: {
    startDate: Date
    endDate: Date
    securityDeposit: number
  }
  completion: ContractCompletion | null
  finalBill: {
    billingPeriod: string
    daysInMonth: number
    days: number
    items: { title: string; amount: number }[]
    total: number
  }
  damageItems: { title: string; amount: number }[]
  damageTotal: number
  summary: MoveOutSummary
}

export interface ContractCompletion {
  isComplete: boolean
  actualMonths: number
  expectedMonths: number
}

export interface MoveOutSummary {
  securityDeposit: number
  deductFinalBill: number
  deductDamage: number
  refundAmount: number
}


// DETAIL RESPONSE


export interface MoveOutBillDetail {
  moveOutBillId: string
  status: MoveOutBillStatus
  createdAt: Date
  tenant: {
    firstName: string
    lastName: string
    roomNumber: string
    roomType: string
    moveOutDate: Date
  }
  meter: {
    waterStart: number
    waterEnd: number
    waterUsed: number
    electricStart: number
    electricEnd: number
    electricUsed: number
  }
  finalBill: {
    items: { title: string; amount: number }[]
    total: number
  }
  damage: {
    items: { title: string; amount: number }[]
    total: number
  }
  summary: MoveOutSummary
}

export interface CreateMoveOutBillResponse {
  moveOutBillId: string
  refundAmount: number
  totalCharge: number
  status: MoveOutBillStatus
}

export type MoveOutBillStatus = "DRAFT" | "CONFIRMED" | "COMPLETED"
