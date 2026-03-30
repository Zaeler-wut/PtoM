import * as repo from "./moveOutRepository"

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

// ตรวจสอบว่าอยู่ครบตามระยะสัญญาไหม
function checkContractCompletion(
  startDate: Date,
  moveOutDate: Date,
  contractTermMonths: number
): { isComplete: boolean; actualMonths: number; expectedMonths: number } {
  const actualMonths =
    (moveOutDate.getFullYear() - startDate.getFullYear()) * 12 +
    (moveOutDate.getMonth() - startDate.getMonth())

  return {
    isComplete: actualMonths >= contractTermMonths,
    actualMonths,
    expectedMonths: contractTermMonths,
  }
}


// คำนวณบิลสุดท้าย (คิดตามรายวัน)
function calculateFinalBill(data: {
  roomPrice: number
  furniturePrice: number | null
  waterRate: number
  electricRate: number
  waterStart: number
  waterEnd: number
  electricStart: number
  electricEnd: number
  extraFees: { title: string; amount: number }[]
  additionalItems: { title: string; amount: number }[]
  billingStartDay: number
  billingEndDay: number
  month: number
  year: number
}) {
  const daysInMonth = getDaysInMonth(data.month, data.year)
  const days = data.billingEndDay - data.billingStartDay + 1
  const ratio = days / daysInMonth

  const waterUsed = Math.max(0, data.waterEnd - data.waterStart)
  const electricUsed = Math.max(0, data.electricEnd - data.electricStart)

  const roomRent = Math.round(data.roomPrice * ratio)
  const furnitureRent = data.furniturePrice
    ? Math.round(data.furniturePrice * ratio)
    : 0
  const waterCharge = Math.round(waterUsed * data.waterRate)
  const electricCharge = Math.round(electricUsed * data.electricRate)
  const extraTotal = data.extraFees.reduce((sum, f) => sum + f.amount, 0)
  const additionalTotal = data.additionalItems.reduce(
    (sum, i) => sum + i.amount,
    0
  )

  const total =
    roomRent +
    furnitureRent +
    waterCharge +
    electricCharge +
    extraTotal +
    additionalTotal

  const items: { title: string; amount: number }[] = [
    { title: `ค่าห้อง (คำนวณรายวัน)`, amount: roomRent },
  ]
  if (furnitureRent > 0)
    items.push({ title: "ค่าเฟอร์นิเจอร์ (คำนวณรายวัน)", amount: furnitureRent })
  if (waterCharge > 0)
    items.push({
      title: `ค่าน้ำ (${waterUsed} หน่วย)`,
      amount: waterCharge,
    })
  if (electricCharge > 0)
    items.push({
      title: `ค่าไฟ (${electricUsed} หน่วย)`,
      amount: electricCharge,
    })
  data.extraFees.forEach((f) => items.push(f))
  data.additionalItems.forEach((i) => items.push(i))

  return {
    days,
    daysInMonth,
    waterUsed,
    electricUsed,
    roomRent,
    furnitureRent,
    waterCharge,
    electricCharge,
    total,
    items,
  }
}

// ─────────────────────────────────────────
// 1. รายการแจ้งย้ายออก + บิลที่ออกแล้ว
// ─────────────────────────────────────────

export const getMoveOutList = async (
  propertyId: string,
  filters?: { year?: number; status?: string }
) => {
  const [contracts, bills] = await Promise.all([
    repo.getMoveOutContracts(propertyId),
    repo.getMoveOutBillsByProperty(propertyId),
  ])

  let pending = contracts.map((c) => ({
    contractId: c.id,
    firstName: c.user.firstName,
    lastName: c.user.lastName,
    phone: c.user.phone,
    roomNumber: c.room.roomNumber,
    roomType: c.room.roomType.name,
    status: c.status,
    moveOutDate: c.endDate,
  }))

  let completed = bills.map((b) => ({
    moveOutBillId: b.id,
    firstName: b.user.firstName,
    lastName: b.user.lastName,
    roomNumber: b.room.roomNumber,
    roomType: b.room.roomType.name,
    moveOutDate: b.moveOutDate,
    refundAmount: b.refundAmount,
    status: b.status,
  }))

  // กรองตามปี
  if (filters?.year) {
    pending = pending.filter(
      (c) => new Date(c.moveOutDate).getFullYear() === filters.year
    )
    completed = completed.filter(
      (b) => new Date(b.moveOutDate).getFullYear() === filters.year
    )
  }

  // กรองตามสถานะ (เฉพาะ completed)
  if (filters?.status) {
    completed = completed.filter((b) => b.status === filters.status)
  }

  return { pending, completed }
}

// ─────────────────────────────────────────
// 2. Preview — คำนวณยอดก่อนสร้างบิล
// ─────────────────────────────────────────

export const getMoveOutPreview = async (
  contractId: string,
  propertyId: string,
  data: {
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
) => {
  const contract = await repo.getContractForMoveOut(contractId, propertyId)
  if (!contract) throw new Error("Contract not found or not in MOVE_OUT_NOTICE status")

  const rt = contract.room.roomType
  const moveOutDate = new Date(data.moveOutDate)
  if (isNaN(moveOutDate.getTime())) throw new Error("moveOutDate is invalid")

  // ── ตรวจสอบว่าอยู่ครบตามระยะสัญญา ──
  // คำนวณจาก startDate และ endDate ของสัญญาจริง
  const contractStart = new Date(contract.startDate)
  const contractEnd = new Date(contract.endDate)
  const contractTermMonths =
    (contractEnd.getFullYear() - contractStart.getFullYear()) * 12 +
    (contractEnd.getMonth() - contractStart.getMonth())
  const completion = contractTermMonths > 0
    ? checkContractCompletion(contract.startDate, moveOutDate, contractTermMonths)
    : null

  // ── เงินประกัน + ล่วงหน้า (ดึงจาก securityDeposit ของสัญญา) ──
  const securityDeposit = contract.securityDeposit

  // ── คำนวณบิลสุดท้าย ──
  const month = moveOutDate.getMonth() + 1
  const year = moveOutDate.getFullYear()

  const extraFees = rt.fees.map((f) => ({ title: f.title, amount: f.amount }))

  const bill = calculateFinalBill({
    roomPrice: rt.roomPrice,
    furniturePrice: rt.furniturePrice,
    waterRate: rt.waterRate,
    electricRate: rt.electricRate,
    waterStart: data.waterStart,
    waterEnd: data.waterEnd,
    electricStart: data.electricStart,
    electricEnd: data.electricEnd,
    extraFees,
    additionalItems: data.additionalItems ?? [],
    billingStartDay: data.billingStartDay,
    billingEndDay: data.billingEndDay,
    month,
    year,
  })

  // ── ค่าเสียหาย ──
  const damageTotal = (data.damageItems ?? []).reduce(
    (sum, i) => sum + i.amount,
    0
  )

  // ── ยอดคืนเงิน ──
  const refundAmount = securityDeposit - bill.total - damageTotal

  return {
    // ข้อมูลผู้เช่า
    tenant: {
      firstName: contract.user.firstName,
      lastName: contract.user.lastName,
      roomNumber: contract.room.roomNumber,
      roomType: rt.name,
    },
    // ข้อมูลสัญญา
    contract: {
      startDate: contract.startDate,
      endDate: contract.endDate,
      securityDeposit,
    },
    // ตรวจสอบครบสัญญา
    completion,
    // ราคาต่อหน่วยของห้อง
    roomDetails: {
      roomPrice: rt.roomPrice,
      furniturePrice: rt.furniturePrice ?? 0,
      waterRate: rt.waterRate,
      electricRate: rt.electricRate,
    },
    // บิลสุดท้าย
    finalBill: {
      billingPeriod: `${data.billingStartDay} - ${data.billingEndDay}`,
      daysInMonth: bill.daysInMonth,
      days: bill.days,
      items: bill.items,
      total: bill.total,
    },
    // ค่าเสียหาย
    damageItems: data.damageItems ?? [],
    damageTotal,
    // สรุปเงินคืน
    summary: {
      securityDeposit,
      deductFinalBill: -bill.total,
      deductDamage: -damageTotal,
      refundAmount,
    },
  }
}

// ─────────────────────────────────────────
// 3. สร้างบิลแจ้งออก
// ─────────────────────────────────────────

export const createMoveOutBill = async (
  contractId: string,
  propertyId: string,
  data: {
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
) => {
  const contract = await repo.getContractForMoveOut(contractId, propertyId)
  if (!contract) throw new Error("Contract not found or not in MOVE_OUT_NOTICE status")

  // เช็คว่ามี MoveOutBill อยู่แล้วไหม
  const { prisma } = await import("../../lib/prisma")
  const existing = await prisma.moveOutBill.findFirst({
    where: { contractId },
  })
  if (existing) throw new Error("MoveOutBill already exists for this contract")

  const rt = contract.room.roomType
  const moveOutDate = new Date(data.moveOutDate)
  if (isNaN(moveOutDate.getTime())) throw new Error("moveOutDate is invalid")

  const month = moveOutDate.getMonth() + 1
  const year = moveOutDate.getFullYear()

  const extraFees = rt.fees.map((f) => ({ title: f.title, amount: f.amount }))

  const bill = calculateFinalBill({
    roomPrice: rt.roomPrice,
    furniturePrice: rt.furniturePrice,
    waterRate: rt.waterRate,
    electricRate: rt.electricRate,
    waterStart: data.waterStart,
    waterEnd: data.waterEnd,
    electricStart: data.electricStart,
    electricEnd: data.electricEnd,
    extraFees,
    additionalItems: data.additionalItems ?? [],
    billingStartDay: data.billingStartDay,
    billingEndDay: data.billingEndDay,
    month,
    year,
  })

  const damageItems = data.damageItems ?? []
  const damageTotal = damageItems.reduce((sum, i) => sum + i.amount, 0)
  const refundAmount = contract.securityDeposit - bill.total - damageTotal

  // รวม items ทั้งหมด (บิลสุดท้าย + ค่าเสียหาย)
  const allItems = [
    ...bill.items,
    ...damageItems.map((i) => ({ title: `[ค่าเสียหาย] ${i.title}`, amount: i.amount })),
  ]

  const moveOutBill = await repo.createMoveOutBill({
    contractId: contract.id,
    roomId: contract.roomId,
    userId: contract.userId,
    moveOutDate,
    waterStart: data.waterStart,
    waterEnd: data.waterEnd,
    electricStart: data.electricStart,
    electricEnd: data.electricEnd,
    totalCharge: bill.total + damageTotal,
    refundAmount,
    items: allItems,
  })

  // อัพเดท contract → ENDED และห้อง → PREPARING
  await repo.endContract(contractId)
  await repo.setRoomPreparing(contract.roomId)

  return {
    moveOutBillId: moveOutBill.id,
    refundAmount,
    totalCharge: moveOutBill.totalCharge,
    status: moveOutBill.status,
  }
}

// ─────────────────────────────────────────
// 4. ดูรายละเอียดบิลแจ้งออก
// ─────────────────────────────────────────

export const getMoveOutBillDetail = async (
  moveOutBillId: string,
  propertyId: string
) => {
  const bill = await repo.getMoveOutBillById(moveOutBillId, propertyId)
  if (!bill) throw new Error("MoveOutBill not found")

  const rt = bill.room.roomType
  const waterUsed = Math.max(0, bill.waterEnd - bill.waterStart)
  const electricUsed = Math.max(0, bill.electricEnd - bill.electricStart)

  // แยก items ออกเป็น บิลสุดท้าย vs ค่าเสียหาย
  const finalBillItems = bill.items.filter(
    (item) => !item.title.startsWith("[ค่าเสียหาย]")
  )
  const damageItems = bill.items
    .filter((item) => item.title.startsWith("[ค่าเสียหาย]"))
    .map((item) => ({
      title: item.title.replace("[ค่าเสียหาย] ", ""),
      amount: item.amount,
    }))

  const finalBillTotal = finalBillItems.reduce((sum, i) => sum + i.amount, 0)
  const damageTotal = damageItems.reduce((sum, i) => sum + i.amount, 0)

  return {
    moveOutBillId: bill.id,
    status: bill.status,
    createdAt: bill.createdAt,
    // ข้อมูลผู้เช่า
    tenant: {
      firstName: bill.user.firstName,
      lastName: bill.user.lastName,
      roomNumber: bill.room.roomNumber,
      roomType: rt.name,
      moveOutDate: bill.moveOutDate,
    },
    // มิเตอร์
    meter: {
      waterStart: bill.waterStart,
      waterEnd: bill.waterEnd,
      waterUsed,
      electricStart: bill.electricStart,
      electricEnd: bill.electricEnd,
      electricUsed,
    },
    // บิลสุดท้าย
    finalBill: {
      items: finalBillItems.map((i) => ({ title: i.title, amount: i.amount })),
      total: finalBillTotal,
    },
    // ค่าเสียหาย
    damage: {
      items: damageItems,
      total: damageTotal,
    },
    // สรุปเงินคืน
    summary: {
      securityDeposit: bill.contract.securityDeposit,
      deductFinalBill: -finalBillTotal,
      deductDamage: -damageTotal,
      refundAmount: bill.refundAmount,
    },
  }
}
