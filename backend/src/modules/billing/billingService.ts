// billingService.ts — business logic สำหรับ billing module
// รับข้อมูลจาก billingRouter ประมวลผลและส่งผลลัพธ์กลับ
// เรียกใช้ billingRepository สำหรับ query database

import * as repo from "./billingRepository"

// คืนค่าจำนวนวันในเดือน/ปีที่ระบุ
function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

// คำนวณจำนวนวันที่ผู้เช่าอยู่ในเดือนนั้นจริง
// กรณีเข้า/ออกกลางเดือน จะเฉลี่ยค่าเช่าตามสัดส่วนวัน
// ส่งกลับ: days, daysInMonth, isFullMonth, startDay, endDay
function getBillingDays(
  contract: { startDate: Date; endDate: Date },
  month: number,
  year: number
) {
  const daysInMonth = getDaysInMonth(month, year)

  // Normalize เป็น local midnight เพื่อตัด time component ออก
  const normalize = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

  const today = normalize(new Date())
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1

  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month - 1, daysInMonth)

  // เดือนปัจจุบันที่ยังไม่จบ ใช้วันนี้เป็น effective end
  const billingEnd = isCurrentMonth && today < monthEnd ? today : monthEnd

  const contractStart = normalize(contract.startDate)
  const contractEnd = normalize(contract.endDate)

  const effectiveStart = contractStart > monthStart ? contractStart : monthStart
  const effectiveEnd = contractEnd < billingEnd ? contractEnd : billingEnd

  if (effectiveEnd < effectiveStart) {
    return { days: 0, daysInMonth, isFullMonth: false, startDay: 0, endDay: 0 }
  }

  const days = Math.round(
    (effectiveEnd.getTime() - effectiveStart.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1

  return {
    days,
    daysInMonth,
    isFullMonth: days === daysInMonth,
    startDay: effectiveStart.getDate(),
    endDay: effectiveEnd.getDate(),
  }
}

// คำนวณยอดบิลทั้งหมดจากข้อมูลที่มี
// เต็มเดือน: คิดราคารายเดือนปกติ | ไม่เต็มเดือน: เฉลี่ยตามสัดส่วน (days/30)
// ส่งกลับ: roomRent, furnitureRent, total, items array พร้อมรายละเอียด
function calculateBill(data: {
  roomPrice: number
  furniturePrice?: number | null
  waterRate: number
  electricRate: number
  waterUsed: number
  electricUsed: number
  extraFees: { title: string; amount: number }[]
  additionalItems: { title: string; amount: number }[]
  days: number
  daysInMonth: number
  isFullMonth: boolean
}) {
  const ratio = data.days / 30

  const roomRent = data.isFullMonth
    ? data.roomPrice
    : Math.round(data.roomPrice * ratio)
  const furnitureRent = data.isFullMonth
    ? (data.furniturePrice ?? 0)
    : data.furniturePrice ? Math.round(data.furniturePrice * ratio) : 0
  const waterCharge = Math.round(data.waterUsed * data.waterRate)
  const electricCharge = Math.round(data.electricUsed * data.electricRate)
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
    { title: "ค่าเช่าห้อง", amount: roomRent },
  ]
  if (furnitureRent > 0)
    items.push({ title: "ค่าเช่าเฟอร์นิเจอร์", amount: furnitureRent })
  if (waterCharge > 0)
    items.push({
      title: `ค่าน้ำประปา (${data.waterUsed} หน่วย × ฿${data.waterRate})`,
      amount: waterCharge,
    })
  if (electricCharge > 0)
    items.push({
      title: `ค่าไฟฟ้า (${data.electricUsed} หน่วย × ฿${data.electricRate})`,
      amount: electricCharge,
    })
  data.extraFees.forEach((f) => items.push(f))
  data.additionalItems.forEach((i) => items.push(i))

  return { roomRent, furnitureRent, total, items }
}

// ดึงภาพรวมบิลเดือนที่ระบุ — สำหรับแสดงตารางและ summary cards
// เดือนปัจจุบัน: เฉพาะสัญญา ACTIVE/MOVE_OUT_NOTICE | เดือนที่ผ่านมา: รวม ENDED ด้วย
// คำนวณ billStatus จาก DB: ถ้ายังไม่ส่งบิล → DRAFT (ไม่มีมิเตอร์) หรือ READY (มีมิเตอร์แล้ว)
// เรียก: billingRepository หลายฟังก์ชัน
// ส่งกลับ: summary object และ bills array เรียงตามเลขห้อง
export const getBillingSummary = async (
  propertyId: string,
  month: number,
  year: number
) => {
  // เดือนปัจจุบัน active only | เดือนที่ผ่านมา รวม ENDED (แสดงบิลย้อนหลัง)
  const now = new Date()
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month - 1
  const contracts = await repo.getContractsByPropertyForMonth(propertyId, month, year, isCurrentMonth)
  const existingBills = await repo.getBillsByProperty(propertyId, month, year)
  const billMap = new Map(existingBills.map((b) => [b.contractId, b]))

  let estimatedRevenue = 0

  const rows = await Promise.all(
    contracts.map(async (contract) => {
      const rt = contract.room.roomType
      const meter = await repo.getMeterReading(contract.roomId, month, year)
      const prevMeter = await repo.getPreviousMeterReading(contract.roomId, month, year)
      const existingBill = billMap.get(contract.id)

      const { days, daysInMonth, isFullMonth, startDay, endDay } = getBillingDays(contract, month, year)

      const waterPrev = prevMeter?.waterMeter ?? null
      const electricPrev = prevMeter?.electricMeter ?? null
      const waterCurrent = meter?.waterMeter ?? null
      const electricCurrent = meter?.electricMeter ?? null

      const waterUsed =
        waterPrev !== null && waterCurrent !== null ? Math.max(0, waterCurrent - waterPrev) : null
      const electricUsed =
        electricPrev !== null && electricCurrent !== null ? Math.max(0, electricCurrent - electricPrev) : null

      const hasMeter = waterCurrent !== null && electricCurrent !== null

      const extraFees = rt.fees.map((f) => ({ title: f.title, amount: f.amount }))
      const { total } = calculateBill({
        roomPrice: rt.roomPrice,
        furniturePrice: rt.furniturePrice,
        waterRate: rt.waterRate,
        electricRate: rt.electricRate,
        waterUsed: waterUsed ?? 0,
        electricUsed: electricUsed ?? 0,
        extraFees,
        additionalItems: [],
        days,
        daysInMonth,
        isFullMonth,
      })

      estimatedRevenue += total

      // ไม่มี bill ใน DB: DRAFT (ยังไม่ครบ) หรือ READY (กรอกมิเตอร์ครบแล้ว พร้อมส่ง)
      const billStatus = existingBill?.status ?? (hasMeter ? "READY" : "DRAFT")

      return {
        contractId: contract.id,
        contractStatus: contract.status,
        moveOutBillId: (contract as any).moveOutBills?.[0]?.id ?? null,
        roomNumber: contract.room.roomNumber,
        tenantName: `${contract.user.firstName} ${contract.user.lastName}`,
        billingCycle: isFullMonth
          ? `เต็มเดือน (${daysInMonth} วัน)`
          : `${startDay}-${endDay} (${days} วัน)`,
        waterPrev,
        waterCurrent,
        waterUsed,
        electricPrev,
        electricCurrent,
        electricUsed,
        total,
        billStatus,
        billId: existingBill?.id ?? null,
      }
    })
  )

  const sortedRows = rows.sort((a, b) =>
    a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true })
  )

  // นับจาก rows ที่แสดงจริงในตาราง เพื่อให้การ์ดตรงกับตาราง
  const incomplete = sortedRows.filter((r) => r.billStatus === "DRAFT").length
  const meterRecorded = sortedRows.filter((r) => r.billStatus === "READY").length
  const sent = sortedRows.filter(
    (r) => r.billStatus === "PENDING" || r.billStatus === "VERIFYING" || r.billStatus === "PAID"
  ).length
  const meterTotal = sortedRows.length

  return {
    summary: {
      incomplete,
      sent,
      meterRecorded,
      meterTotal,
      meterPercent: meterTotal > 0 ? Math.round((meterRecorded / meterTotal) * 100) : 0,
      estimatedRevenue,
    },
    bills: sortedRows,
  }
}

// ดึงค่าบริการคงที่ของห้อง (fees ที่ผูกกับ roomType)
// เรียก: prisma_getContract(), billingRepository ไม่มี (query inline)
// ส่งกลับ: roomNumber, fees array, total
export const getRoomFees = async (contractId: string, propertyId: string) => {
  const contract = await prisma_getContract(contractId, propertyId)
  if (!contract) throw new Error("Contract not found")

  const rt = contract.room.roomType
  const fees = rt.fees

  return {
    roomNumber: contract.room.roomNumber,
    fees: fees.map((f) => ({ title: f.title, amount: f.amount })),
    total: fees.reduce((sum, f) => sum + f.amount, 0),
  }
}

// helper query สัญญาพร้อม fees — ใช้ภายใน service เท่านั้น
async function prisma_getContract(contractId: string, propertyId: string) {
  const { prisma } = await import("../../lib/prisma")
  return prisma.contract.findFirst({
    where: { id: contractId, room: { propertyId } },
    include: {
      user: true,
      room: {
        include: { roomType: { include: { fees: true } } },
      },
    },
  })
}

// สร้างใบแจ้งหนี้ realtime — คำนวณจากมิเตอร์ปัจจุบัน ไม่ต้องรอส่งบิล
// ดึง additionalItems จากบิลที่มีอยู่ (ถ้ามี) เพื่อแสดงรายการพิเศษ
// เรียก: billingRepository หลายฟังก์ชัน
// ส่งกลับ: ข้อมูล property, ผู้เช่า, รายการค่าใช้จ่าย, ยอดรวม, ข้อมูลมิเตอร์
export const getInvoice = async (
  contractId: string,
  propertyId: string,
  month: number,
  year: number
) => {
  const contract = await prisma_getContract(contractId, propertyId)
  if (!contract) throw new Error("Contract not found")

  const property = await repo.getPropertyForInvoice(propertyId)
  if (!property) throw new Error("Property not found")

  const rt = contract.room.roomType
  const meter = await repo.getMeterReading(contract.roomId, month, year)
  const prevMeter = await repo.getPreviousMeterReading(
    contract.roomId,
    month,
    year
  )

  const { days, daysInMonth, isFullMonth, startDay, endDay } = getBillingDays(
    contract,
    month,
    year
  )

  const waterPrev = prevMeter?.waterMeter ?? 0
  const waterCurrent = meter?.waterMeter ?? 0
  const electricPrev = prevMeter?.electricMeter ?? 0
  const electricCurrent = meter?.electricMeter ?? 0
  const waterUsed = Math.max(0, waterCurrent - waterPrev)
  const electricUsed = Math.max(0, electricCurrent - electricPrev)

  const extraFees = rt.fees.map((f) => ({ title: f.title, amount: f.amount }))

  // ดึงรายการเพิ่มเติมจาก bill ที่มีอยู่ (ถ้ามี) — กรองเฉพาะ items ที่ไม่ใช่รายการหลัก
  const existingBill = await repo.getBillByContract(contractId, month, year)
  const additionalItems =
    existingBill?.items
      .filter(
        (item) =>
          !["ค่าเช่าห้อง", "ค่าเช่าเฟอร์นิเจอร์"].includes(item.title) &&
          !item.title.includes("ค่าน้ำ") &&
          !item.title.includes("ค่าไฟ") &&
          !extraFees.find((f) => f.title === item.title)
      )
      .map((item) => ({ title: item.title, amount: item.amount })) ?? []

  const { total, items } = calculateBill({
    roomPrice: rt.roomPrice,
    furniturePrice: rt.furniturePrice,
    waterRate: rt.waterRate,
    electricRate: rt.electricRate,
    waterUsed,
    electricUsed,
    extraFees,
    additionalItems,
    days,
    daysInMonth,
    isFullMonth,
  })

  const monthNamesFull = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ]
  const monthNamesShort = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.",
    "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.",
    "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ]

  const beYear = year + 543
  const beYearShort = beYear % 100

  let billingPeriod: string
  if (isFullMonth) {
    billingPeriod = `${monthNamesFull[month - 1]} ${beYear}`
  } else {
    const monthShort = monthNamesShort[month - 1]
    billingPeriod = `${startDay}-${endDay} ${monthShort} ${beYearShort}`
  }

  return {
    property: {
      name: property.name,
      address: property.address,
      bankName: property.bankName,
      bankAccount: property.bankAccount,
      bankHolder: property.bankHolder,
      paymentQrUrl: property.paymentQrUrl,
      logoUrl: property.logoUrl,
      billNote: property.billNote ?? null,
    },
    roomNumber: contract.room.roomNumber,
    roomType: rt.name,
    tenantName: `${contract.user.firstName} ${contract.user.lastName}`,
    billingPeriod,
    billingCycle: isFullMonth ? `เต็มเดือน (${daysInMonth} วัน)` : `${startDay}-${endDay} (${days} วัน)`,
    items,
    total,
    meter: {
      waterPrev,
      waterCurrent,
      waterUsed,
      electricPrev,
      electricCurrent,
      electricUsed,
    },
  }
}

// บันทึก/แก้ไขมิเตอร์ — upsert เดือนปัจจุบัน และเดือนก่อนหน้า (ถ้าส่งมา)
// ถ้ามีบิลอยู่แล้วให้อัปเดต additionalItems ด้วย (replace ทั้งหมด)
// เรียก: billingRepository.upsertMeterReading(), getBillByContract()
// ส่งกลับ: { message: "Meter updated" }
export const updateMeter = async (
  contractId: string,
  propertyId: string,
  month: number,
  year: number,
  data: {
    waterMeter: number
    electricMeter: number
    waterPrev?: number
    electricPrev?: number
    additionalItems?: { title: string; amount: number }[]
  }
) => {
  const contract = await prisma_getContract(contractId, propertyId)
  if (!contract) throw new Error("Contract not found")

  if (data.waterMeter < 0) throw new Error("waterMeter must not be negative")
  if (data.electricMeter < 0)
    throw new Error("electricMeter must not be negative")

  // บันทึก/อัปเดตมิเตอร์เดือนปัจจุบัน
  await repo.upsertMeterReading(contract.roomId, month, year, {
    waterMeter: data.waterMeter,
    electricMeter: data.electricMeter,
  })

  // บันทึก/อัปเดตมิเตอร์เดือนก่อนหน้า (ถ้ามีส่งมา)
  if (data.waterPrev != null || data.electricPrev != null) {
    const prevMonth = month === 1 ? 12 : month - 1
    const prevYear = month === 1 ? year - 1 : year
    const prevReading = await repo.getPreviousMeterReading(contract.roomId, month, year)
    await repo.upsertMeterReading(contract.roomId, prevMonth, prevYear, {
      waterMeter: data.waterPrev ?? prevReading?.waterMeter ?? 0,
      electricMeter: data.electricPrev ?? prevReading?.electricMeter ?? 0,
    })
  }

  // ถ้ามี bill อยู่แล้ว → อัปเดต additionalItems ใหม่ (ลบเก่า สร้างใหม่)
  const existingBill = await repo.getBillByContract(contractId, month, year)
  if (existingBill && Array.isArray(data.additionalItems)) {
    const { prisma } = await import("../../lib/prisma")
    // ลบ additional items เดิม (เก็บเฉพาะ items หลักไว้)
    await prisma.billItem.deleteMany({
      where: {
        billId: existingBill.id,
        title: {
          notIn: [
            "ค่าเช่าห้อง",
            "ค่าเช่าเฟอร์นิเจอร์",
          ],
        },
      },
    })
    // เพิ่ม items ใหม่
    if (data.additionalItems.length > 0) {
      await prisma.billItem.createMany({
        data: data.additionalItems.map((item) => ({
          billId: existingBill.id,
          title: item.title,
          amount: item.amount,
        })),
      })
    }
  }

  return { message: "Meter updated" }
}

// ส่งบิลห้องเดียว — สร้างหรืออัปเดตบิลเป็น PENDING
// ถ้ามีบิลอยู่แล้ว → เพียงเปลี่ยน status เป็น PENDING
// ถ้ายังไม่มีบิล → สร้างใหม่พร้อม items
// เรียก: billingRepository หลายฟังก์ชัน
// ส่งกลับ: billId, total, status
export const sendBill = async (
  contractId: string,
  propertyId: string,
  month: number,
  year: number
) => {
  const contract = await prisma_getContract(contractId, propertyId)
  if (!contract) throw new Error("Contract not found")

  const rt = contract.room.roomType
  const meter = await repo.getMeterReading(contract.roomId, month, year)
  const prevMeter = await repo.getPreviousMeterReading(
    contract.roomId,
    month,
    year
  )

  if (!meter) throw new Error("Meter reading not found for this month")

  const { days, daysInMonth, isFullMonth } = getBillingDays(contract, month, year)

  const waterUsed = Math.max(
    0,
    (meter.waterMeter ?? 0) - (prevMeter?.waterMeter ?? 0)
  )
  const electricUsed = Math.max(
    0,
    (meter.electricMeter ?? 0) - (prevMeter?.electricMeter ?? 0)
  )

  const extraFees = rt.fees.map((f) => ({ title: f.title, amount: f.amount }))
  const existingBill = await repo.getBillByContract(contractId, month, year)

  // กรอง additionalItems จากบิลเดิม (ไม่รวมรายการหลัก)
  const additionalItems =
    existingBill?.items
      .filter(
        (item) =>
          !["ค่าเช่าห้อง", "ค่าเช่าเฟอร์นิเจอร์"].includes(item.title) &&
          !item.title.includes("ค่าน้ำ") &&
          !item.title.includes("ค่าไฟ") &&
          !extraFees.find((f) => f.title === item.title)
      )
      .map((item) => ({ title: item.title, amount: item.amount })) ?? []

  const { roomRent, furnitureRent, total, items } = calculateBill({
    roomPrice: rt.roomPrice,
    furniturePrice: rt.furniturePrice,
    waterRate: rt.waterRate,
    electricRate: rt.electricRate,
    waterUsed,
    electricUsed,
    extraFees,
    additionalItems,
    days,
    daysInMonth,
    isFullMonth,
  })

  if (existingBill) {
    // มีบิลแล้ว → เปลี่ยนเป็น PENDING
    await repo.updateBillStatus(existingBill.id, "PENDING")
    return { billId: existingBill.id, total, status: "PENDING" }
  }

  // สร้างบิลใหม่
  const bill = await repo.createBill({
    contractId: contract.id,
    roomId: contract.roomId,
    userId: contract.userId,
    month,
    year,
    roomRent,
    furnitureRent: furnitureRent > 0 ? furnitureRent : undefined,
    total,
    items,
  })

  return { billId: bill.id, total, status: "PENDING" }
}

// ส่งบิลทุกห้องพร้อมกัน — ใช้ Promise.allSettled เพื่อไม่ให้ห้องที่ส่งไม่ได้หยุด loop
// เรียก: billingRepository.getActiveContractsByProperty(), billingService.sendBill()
// ส่งกลับ: total, success, failed count
export const sendAllBills = async (
  propertyId: string,
  month: number,
  year: number
) => {
  const contracts = await repo.getActiveContractsByProperty(propertyId)

  const results = await Promise.allSettled(
    contracts.map((c) => sendBill(c.id, propertyId, month, year))
  )

  const success = results.filter((r) => r.status === "fulfilled").length
  const failed = results.filter((r) => r.status === "rejected").length

  return {
    total: contracts.length,
    success,
    failed,
  }
}

// admin อัปโหลดสลิปแทนผู้เช่า — ตรวจสอบ bill PENDING แล้วสร้าง payment record
// เรียก: billingRepository.createPaymentForBill(), updateBillStatus()
// ส่งกลับ: { success: true }
export const submitPaymentByAdmin = async (
  billId: string,
  propertyId: string,
  data: { slipUrl?: string }
) => {
  const { prisma } = await import("../../lib/prisma")
  const bill = await prisma.bill.findFirst({
    where: { id: billId, room: { propertyId } },
  })
  if (!bill) throw new Error("Bill not found")
  if (bill.status !== "PENDING") throw new Error("Bill is not in PENDING status")

  await repo.createPaymentForBill({
    billId,
    userId: bill.userId,
    amount: bill.total,
    slipUrl: data.slipUrl,
  })
  await repo.updateBillStatus(billId, "VERIFYING")
  return { success: true }
}

// ดึงรายการชำระเงิน — รวม PENDING bills ที่ยังไม่มีสลิปแสดงเป็น row ด้วย
// กรอง statusFilter ถ้ามี (PENDING/VERIFYING/CONFIRMED/REJECTED)
// เรียก: billingRepository.getPaymentsByProperty(), getPendingBillsWithoutPayment()
// ส่งกลับ: array ของ payment rows รวมทั้งสองกลุ่ม
export const getPayments = async (
  propertyId: string,
  month: number,
  year: number,
  statusFilter?: string
) => {
  const [payments, pendingBills] = await Promise.all([
    repo.getPaymentsByProperty(propertyId, month, year),
    repo.getPendingBillsWithoutPayment(propertyId, month, year),
  ])

  // บิล PENDING (ส่งแล้ว รอผู้เช่าชำระ) แสดงเป็นแถวใน payment tab
  const pendingRows = pendingBills.map((b) => ({
    paymentId: b.id,          // ใช้ billId แทน (ไม่มี payment record)
    roomNumber: b.room.roomNumber,
    tenantName: `${b.user.firstName} ${b.user.lastName}`,
    amount: b.total,
    slipUrl: null,
    paidAt: null,
    status: "PENDING" as const,
  }))

  // Payment records (ผู้เช่าส่งสลิปแล้ว)
  const paymentRows = payments.map((p) => ({
    paymentId: p.id,
    roomNumber: p.bill.room.roomNumber,
    tenantName: `${p.user.firstName} ${p.user.lastName}`,
    amount: p.amount,
    slipUrl: p.slipUrl,
    paidAt: p.createdAt,
    status: p.status,
  }))

  const all = [...pendingRows, ...paymentRows]
  const filtered = statusFilter ? all.filter((p) => p.status === statusFilter) : all
  return filtered
}

// ดูรายละเอียด payment เดี่ยว — ตรวจสอบว่าอยู่ใน property นี้ก่อนส่งกลับ
// เรียก: billingRepository.getPaymentById()
// ส่งกลับ: paymentId, roomNumber, roomType, amount, slipUrl, paidAt, status
export const getPaymentDetail = async (
  paymentId: string,
  propertyId: string
) => {
  const payment = await repo.getPaymentById(paymentId)
  if (!payment) throw new Error("Payment not found")

  // เช็คว่า payment อยู่ใน property นี้
  if (payment.bill.room.propertyId !== propertyId) {
    throw new Error("Payment not found")
  }

  return {
    paymentId: payment.id,
    roomNumber: payment.bill.room.roomNumber,
    roomType: payment.bill.room.roomType?.name,
    amount: payment.amount,
    slipUrl: payment.slipUrl,
    paidAt: payment.createdAt,
    status: payment.status,
  }
}

// ยืนยันการชำระเงิน — เปลี่ยน payment เป็น CONFIRMED และบิลเป็น PAID
// บันทึก verifiedAt และ verifiedBy (email ของ admin ที่ยืนยัน)
// เรียก: billingRepository.updatePaymentConfirmed(), updateBillStatus()
// ส่งกลับ: { message: "Payment confirmed" }
export const confirmPayment = async (
  paymentId: string,
  propertyId: string,
  adminEmail: string
) => {
  const payment = await repo.getPaymentById(paymentId)
  if (!payment) throw new Error("Payment not found")
  if (payment.bill.room.propertyId !== propertyId) {
    throw new Error("Payment not found")
  }
  if (payment.status !== "VERIFYING") {
    throw new Error("Payment is not in VERIFYING status")
  }

  // อัปเดต payment เป็น CONFIRMED พร้อม verifiedAt และ verifiedBy
  await repo.updatePaymentConfirmed(paymentId, adminEmail)
  // อัปเดต bill เป็น PAID
  await repo.updateBillStatus(payment.billId, "PAID")

  return { message: "Payment confirmed" }
}

// ปฏิเสธการชำระเงิน — เปลี่ยน payment เป็น REJECTED และบิลกลับเป็น PENDING
// เรียก: billingRepository.updatePaymentStatus(), updateBillStatus()
// ส่งกลับ: { message: "Payment rejected" }
export const rejectPayment = async (
  paymentId: string,
  propertyId: string
) => {
  const payment = await repo.getPaymentById(paymentId)
  if (!payment) throw new Error("Payment not found")
  if (payment.bill.room.propertyId !== propertyId) {
    throw new Error("Payment not found")
  }
  if (payment.status !== "VERIFYING") {
    throw new Error("Payment is not in VERIFYING status")
  }

  // อัปเดต payment เป็น REJECTED และบิลกลับเป็น PENDING
  await repo.updatePaymentStatus(paymentId, "REJECTED")
  await repo.updateBillStatus(payment.billId, "PENDING")

  return { message: "Payment rejected" }
}

// ดึงเดือนที่มีบิลในที่พักนี้ — ใช้สำหรับ dropdown เลือกเดือน
// เรียก: billingRepository.getAvailableBillingMonths()
// ส่งกลับ: array ของ { month, year } distinct เรียงจากล่าสุด
export const getAvailableMonths = async (propertyId: string) => {
  return repo.getAvailableBillingMonths(propertyId)
}
