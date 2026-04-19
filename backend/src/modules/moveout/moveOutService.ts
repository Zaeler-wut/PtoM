// moveOutService.ts — business logic สำหรับ move-out module
// รับข้อมูลจาก moveOutRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ moveOutRepository สำหรับ query database

import * as repo from "./moveOutRepository"

// คืนค่าจำนวนวันในเดือน/ปีที่ระบุ
function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

// ตรวจสอบว่าผู้เช่าอยู่ครบตามระยะสัญญาหรือไม่
// ใช้เปรียบเทียบ startDate กับ moveOutDate (นับเป็นเดือน)
// ส่งกลับ: isComplete, actualMonths, expectedMonths
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

// คำนวณบิลสุดท้ายตามจำนวนวันจริง (billingStartDay ถึง billingEndDay)
// เฉลี่ยค่าเช่าและค่าบริการตามสัดส่วน days/daysInMonth
// ส่งกลับ: days, daysInMonth, waterUsed, electricUsed, roomRent, furnitureRent, total, items
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

// ดึงรายการแจ้งย้ายออก — แสดงทั้ง pending (รอดำเนินการ) และ completed (ออกบิลแล้ว)
// กรองตาม year และ status ถ้ามี
// เรียก: moveOutRepository.getMoveOutContracts(), getMoveOutBillsByProperty()
// ส่งกลับ: { pending: array, completed: array }
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
    moveOutDate: c.moveOutNoticeDate ?? c.endDate,
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

// คำนวณ preview บิลย้ายออก — ไม่บันทึกข้อมูลลง DB
// ตรวจสอบครบสัญญา, คำนวณบิลสุดท้าย, ค่าเสียหาย, ยอดเงินคืน
// เรียก: moveOutRepository.getContractForMoveOut(), getMeterReading(), getPreviousMeterReading()
// ส่งกลับ: ข้อมูลผู้เช่า, บิลสุดท้าย, ค่าเสียหาย, มิเตอร์ pre-fill, สรุปเงินคืน
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

  // คำนวณระยะสัญญา (เดือน) เพื่อตรวจสอบว่าอยู่ครบหรือไม่
  const contractStart = new Date(contract.startDate)
  const contractEnd = new Date(contract.endDate)
  const contractTermMonths =
    (contractEnd.getFullYear() - contractStart.getFullYear()) * 12 +
    (contractEnd.getMonth() - contractStart.getMonth())
  const completion = contractTermMonths > 0
    ? checkContractCompletion(contract.startDate, moveOutDate, contractTermMonths)
    : null

  const securityDeposit = contract.securityDeposit

  const month = moveOutDate.getMonth() + 1
  const year = moveOutDate.getFullYear()

  // ดึงมิเตอร์เดือนก่อนหน้าและปัจจุบันสำหรับ pre-fill ในฟอร์ม
  const prevMeter = await repo.getPreviousMeterReading(contract.roomId, month, year)
  const currentMeter = await repo.getMeterReading(contract.roomId, month, year)

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
    additionalItems: [],   // รายการเพิ่มเติมหักจากเงินประกัน ไม่รวมในบิลเดือน
    billingStartDay: data.billingStartDay,
    billingEndDay: data.billingEndDay,
    month,
    year,
  })

  const damageTotal = (data.damageItems ?? []).reduce((sum, i) => sum + i.amount, 0)
  const additionalTotal = (data.additionalItems ?? []).reduce((sum, i) => sum + i.amount, 0)

  // ยอดคืนเงิน = เงินประกัน - บิลสุดท้าย - ค่าเสียหาย - รายการเพิ่มเติม
  const refundAmount = securityDeposit - bill.total - damageTotal - additionalTotal

  return {
    tenant: {
      firstName: contract.user.firstName,
      lastName: contract.user.lastName,
      roomNumber: contract.room.roomNumber,
      roomType: rt.name,
    },
    contract: {
      startDate: contract.startDate,
      endDate: contract.endDate,
      securityDeposit,
    },
    completion,
    roomDetails: {
      roomPrice: rt.roomPrice,
      furniturePrice: rt.furniturePrice ?? 0,
      waterRate: rt.waterRate,
      electricRate: rt.electricRate,
    },
    finalBill: {
      billingPeriod: `${data.billingStartDay} - ${data.billingEndDay}`,
      daysInMonth: bill.daysInMonth,
      days: bill.days,
      items: bill.items,
      total: bill.total,
    },
    damageItems: data.damageItems ?? [],
    damageTotal,
    additionalItems: data.additionalItems ?? [],
    additionalTotal,
    summary: {
      securityDeposit,
      deductFinalBill: -bill.total,
      deductDamage: -damageTotal,
      deductAdditional: -additionalTotal,
      refundAmount,
    },
    // มิเตอร์สำหรับ pre-fill ในฟอร์ม: prev = start, current = end
    lastMeter: {
      prev: prevMeter ? { waterMeter: prevMeter.waterMeter, electricMeter: prevMeter.electricMeter } : null,
      current: currentMeter ? { waterMeter: currentMeter.waterMeter, electricMeter: currentMeter.electricMeter } : null,
    },
  }
}

// สร้างบิลย้ายออกจริง — ตรวจสอบว่ายังไม่มีบิลก่อน
// หลังสร้าง: contract → ENDED, ห้อง → PREPARING
// รวม items ทั้งหมด: บิลสุดท้าย + ค่าเสียหาย (prefix "[ค่าเสียหาย]") + รายการเพิ่มเติม (prefix "[รายการเพิ่มเติม]")
// เรียก: moveOutRepository.createMoveOutBill(), endContract(), setRoomPreparing()
// ส่งกลับ: moveOutBillId, refundAmount, totalCharge, status (status 201)
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

  // ตรวจสอบว่ามี MoveOutBill อยู่แล้วหรือไม่
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
    additionalItems: [],   // รายการเพิ่มเติมหักจากเงินประกัน ไม่รวมในบิลเดือน
    billingStartDay: data.billingStartDay,
    billingEndDay: data.billingEndDay,
    month,
    year,
  })

  const damageItems = data.damageItems ?? []
  const additionalItems = data.additionalItems ?? []
  const damageTotal = damageItems.reduce((sum, i) => sum + i.amount, 0)
  const additionalTotal = additionalItems.reduce((sum, i) => sum + i.amount, 0)
  const refundAmount = contract.securityDeposit - bill.total - damageTotal - additionalTotal

  // รวม items ทั้งหมดพร้อม prefix เพื่อแยกกลุ่มเมื่อดูรายละเอียด
  const allItems = [
    ...bill.items,
    ...damageItems.map((i) => ({ title: `[ค่าเสียหาย] ${i.title}`, amount: i.amount })),
    ...additionalItems.map((i) => ({ title: `[รายการเพิ่มเติม] ${i.title}`, amount: i.amount })),
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
    totalCharge: bill.total + damageTotal + additionalTotal,
    refundAmount,
    items: allItems,
  })

  // อัปเดต contract เป็น ENDED และห้องเป็น PREPARING
  await repo.endContract(contractId)
  await repo.setRoomPreparing(contract.roomId)

  return {
    moveOutBillId: moveOutBill.id,
    refundAmount,
    totalCharge: moveOutBill.totalCharge,
    status: moveOutBill.status,
  }
}

// ดูรายละเอียดบิลย้ายออก — แยก items ออกเป็น 3 กลุ่มตาม prefix
// เรียก: moveOutRepository.getMoveOutBillById()
// ส่งกลับ: ข้อมูล property, ผู้เช่า, มิเตอร์, บิลสุดท้าย, ค่าเสียหาย, รายการเพิ่มเติม, สรุปเงินคืน
export const getMoveOutBillDetail = async (
  moveOutBillId: string,
  propertyId: string
) => {
  const bill = await repo.getMoveOutBillById(moveOutBillId, propertyId)
  if (!bill) throw new Error("MoveOutBill not found")

  const rt = bill.room.roomType
  const waterUsed = Math.max(0, bill.waterEnd - bill.waterStart)
  const electricUsed = Math.max(0, bill.electricEnd - bill.electricStart)

  // แยก items ออกเป็น 3 กลุ่มตาม prefix ที่ตั้งไว้ตอนสร้าง
  const finalBillItems = bill.items.filter(
    (item) => !item.title.startsWith("[ค่าเสียหาย]") && !item.title.startsWith("[รายการเพิ่มเติม]")
  )
  const damageItems = bill.items
    .filter((item) => item.title.startsWith("[ค่าเสียหาย]"))
    .map((item) => ({ title: item.title.replace("[ค่าเสียหาย] ", ""), amount: item.amount }))
  const additionalItems = bill.items
    .filter((item) => item.title.startsWith("[รายการเพิ่มเติม]"))
    .map((item) => ({ title: item.title.replace("[รายการเพิ่มเติม] ", ""), amount: item.amount }))

  const finalBillTotal = finalBillItems.reduce((sum, i) => sum + i.amount, 0)
  const damageTotal = damageItems.reduce((sum, i) => sum + i.amount, 0)
  const additionalTotal = additionalItems.reduce((sum, i) => sum + i.amount, 0)

  const property = bill.room.property

  return {
    moveOutBillId: bill.id,
    status: bill.status,
    createdAt: bill.createdAt,
    property: {
      name: property.name,
      address: property.address,
      bankName: property.bankName,
      bankAccount: property.bankAccount,
      bankHolder: property.bankHolder,
      paymentQrUrl: property.paymentQrUrl,
      logoUrl: property.logoUrl,
    },
    tenant: {
      firstName: bill.user.firstName,
      lastName: bill.user.lastName,
      roomNumber: bill.room.roomNumber,
      roomType: rt.name,
      moveOutDate: bill.moveOutDate,
    },
    meter: {
      waterStart: bill.waterStart,
      waterEnd: bill.waterEnd,
      waterUsed,
      electricStart: bill.electricStart,
      electricEnd: bill.electricEnd,
      electricUsed,
    },
    finalBill: {
      items: finalBillItems.map((i) => ({ title: i.title, amount: i.amount })),
      total: finalBillTotal,
    },
    damage: {
      items: damageItems,
      total: damageTotal,
    },
    additional: {
      items: additionalItems,
      total: additionalTotal,
    },
    summary: {
      securityDeposit: bill.contract.securityDeposit,
      deductFinalBill: -finalBillTotal,
      deductDamage: -damageTotal,
      deductAdditional: -additionalTotal,
      refundAmount: bill.refundAmount,
    },
  }
}
