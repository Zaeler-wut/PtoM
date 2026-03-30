export type MoveOutBillStatus = "DRAFT" | "CONFIRMED" | "COMPLETED"

export interface MoveOutPendingItem {
  contractId: string
  firstName: string
  lastName: string
  phone: string | null
  roomNumber: string
  roomType: string
  status: string
  moveOutDate: string
}

export interface MoveOutCompletedItem {
  moveOutBillId: string
  firstName: string
  lastName: string
  roomNumber: string
  roomType: string
  moveOutDate: string
  refundAmount: number
  status: MoveOutBillStatus
}

export interface MoveOutListResponse {
  pending: MoveOutPendingItem[]
  completed: MoveOutCompletedItem[]
}

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

export interface MoveOutPreviewResponse {
  tenant: {
    firstName: string
    lastName: string
    roomNumber: string
    roomType: string
  }
  contract: {
    startDate: string
    endDate: string
    securityDeposit: number
  }
  roomDetails: {
    roomPrice: number
    furniturePrice: number
    waterRate: number
    electricRate: number
  }
  completion: {
    isComplete: boolean
    actualMonths: number
    expectedMonths: number
  } | null
  finalBill: {
    billingPeriod: string
    daysInMonth: number
    days: number
    items: { title: string; amount: number }[]
    total: number
  }
  damageItems: { title: string; amount: number }[]
  damageTotal: number
  summary: {
    securityDeposit: number
    deductFinalBill: number
    deductDamage: number
    refundAmount: number
  }
}

export interface CreateMoveOutBillResponse {
  moveOutBillId: string
  refundAmount: number
  totalCharge: number
  status: MoveOutBillStatus
}
