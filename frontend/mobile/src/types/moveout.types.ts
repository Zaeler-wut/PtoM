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
  additionalItems: { title: string; amount: number }[]
  additionalTotal: number
  summary: {
    securityDeposit: number
    deductFinalBill: number
    deductDamage: number
    deductAdditional: number
    refundAmount: number
  }
  lastMeter: {
    prev: { waterMeter: number; electricMeter: number } | null
    current: { waterMeter: number; electricMeter: number } | null
  }
}

export interface CreateMoveOutBillResponse {
  moveOutBillId: string
  refundAmount: number
  totalCharge: number
  status: MoveOutBillStatus
}

export interface MoveOutBillDetail {
  moveOutBillId: string
  status: MoveOutBillStatus
  createdAt: string
  property: {
    name: string
    address: string | null
    bankName: string | null
    bankAccount: string | null
    bankHolder: string | null
    paymentQrUrl: string | null
    logoUrl: string | null
  }
  tenant: {
    firstName: string
    lastName: string
    roomNumber: string
    roomType: string
    moveOutDate: string
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
  additional: {
    items: { title: string; amount: number }[]
    total: number
  }
  summary: {
    securityDeposit: number
    deductFinalBill: number
    deductDamage: number
    deductAdditional: number
    refundAmount: number
  }
}
