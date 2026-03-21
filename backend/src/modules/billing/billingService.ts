import * as repo from "./billingRepository"

// ─────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate()
}

// คำนวณจำนวนวันที่อยู่ในเดือนนั้น (กรณีเข้า/ออกกลางเดือน)
function getBillingDays(
  contract: { startDate: Date; endDate: Date },
  month: number,
  year: number
) {
  const daysInMonth = getDaysInMonth(month, year)
  const monthStart = new Date(year, month - 1, 1)
  const monthEnd = new Date(year, month - 1, daysInMonth)

  const effectiveStart =
    contract.startDate > monthStart ? contract.startDate : monthStart
  const effectiveEnd =
    contract.endDate < monthEnd ? contract.endDate : monthEnd

  const days =
    Math.floor(
      (effectiveEnd.getTime() - effectiveStart.getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1

  return { days, daysInMonth, isFullMonth: days === daysInMonth }
}

// คำนวณยอดบิลจากข้อมูลที่มี
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
}) {
  const ratio = data.days / data.daysInMonth

  const roomRent = Math.round(data.roomPrice * ratio)
  const furnitureRent = data.furniturePrice
    ? Math.round(data.furniturePrice * ratio)
    : 0
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

// ─────────────────────────────────────────
// 1. SUMMARY — cards + ตาราง
// ─────────────────────────────────────────

export const getBillingSummary = async (
  propertyId: string,
  month: number,
  year: number
) => {
  const contracts = await repo.getActiveContractsByProperty(propertyId)
  const existingBills = await repo.getBillsByProperty(propertyId, month, year)

  const billMap = new Map(
    existingBills.map((b) => [b.contractId, b])
  )

  let incomplete = 0
  let sent = 0
  let meterRecorded = 0
  let estimatedRevenue = 0

  const rows = await Promise.all(
    contracts.map(async (contract) => {
      const rt = contract.room.roomType
      const meter = await repo.getMeterReading(contract.roomId, month, year)
      const prevMeter = await repo.getPreviousMeterReading(
        contract.roomId,
        month,
        year
      )
      const existingBill = billMap.get(contract.id)

      const { days, daysInMonth, isFullMonth } = getBillingDays(
        contract,
        month,
        year
      )

      const waterPrev = prevMeter?.waterMeter ?? null
      const electricPrev = prevMeter?.electricMeter ?? null
      const waterCurrent = meter?.waterMeter ?? null
      const electricCurrent = meter?.electricMeter ?? null

      const waterUsed =
        waterPrev !== null && waterCurrent !== null
          ? Math.max(0, waterCurrent - waterPrev)
          : null
      const electricUsed =
        electricPrev !== null && electricCurrent !== null
          ? Math.max(0, electricCurrent - electricPrev)
          : null

      const hasMeter = waterCurrent !== null && electricCurrent !== null
      if (hasMeter) meterRecorded++

      // คำนวณยอด
      const extraFees = rt.fees.map((f) => ({
        title: f.title,
        amount: f.amount,
      }))

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
      })

      estimatedRevenue += total

      const billStatus = existingBill?.status ?? "DRAFT"
      if (billStatus === "PENDING" || billStatus === "VERIFYING" || billStatus === "PAID") {
        sent++
      }
      if (!hasMeter) incomplete++

      return {
        contractId: contract.id,
        roomNumber: contract.room.roomNumber,
        tenantName: `${contract.user.firstName} ${contract.user.lastName}`,
        billingCycle: isFullMonth
          ? `เต็มเดือน (${daysInMonth} วัน)`
          : `${days} วัน`,
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

  return {
    summary: {
      incomplete,
      sent,
      meterRecorded,
      meterTotal: contracts.length,
      meterPercent:
        contracts.length > 0
          ? Math.round((meterRecorded / contracts.length) * 100)
          : 0,
      estimatedRevenue,
    },
    bills: rows,
  }
}

// ─────────────────────────────────────────
// 2. ค่าบริการคงที่ของห้อง
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// 3. ใบแจ้งหนี้ (realtime ไม่ต้องรอส่งบิล)
// ─────────────────────────────────────────

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

  const { days, daysInMonth, isFullMonth } = getBillingDays(
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

  // ดึงรายการเพิ่มเติมจาก bill ที่มีอยู่ (ถ้ามี)
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
  })

  const monthNames = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน",
    "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม",
    "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
  ]

  return {
    // ข้อมูล property
    property: {
      name: property.name,
      address: property.address,
      bankName: property.bankName,
      bankAccount: property.bankAccount,
      bankHolder: property.bankHolder,
      paymentQrUrl: property.paymentQrUrl,
      logoUrl: property.logoUrl,
    },
    // ข้อมูลบิล
    roomNumber: contract.room.roomNumber,
    roomType: rt.name,
    tenantName: `${contract.user.firstName} ${contract.user.lastName}`,
    billingPeriod: `${monthNames[month - 1]} ${year + 543}`,
    billingCycle: isFullMonth ? `เต็มเดือน (${daysInMonth} วัน)` : `${days} วัน`,
    // รายการ
    items,
    total,
    // มิเตอร์
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

// ─────────────────────────────────────────
// 4. แก้ไขมิเตอร์ + รายการเพิ่มเติม
// ─────────────────────────────────────────

export const updateMeter = async (
  contractId: string,
  propertyId: string,
  month: number,
  year: number,
  data: {
    waterMeter: number
    electricMeter: number
    additionalItems?: { title: string; amount: number }[]
  }
) => {
  const contract = await prisma_getContract(contractId, propertyId)
  if (!contract) throw new Error("Contract not found")

  if (data.waterMeter < 0) throw new Error("waterMeter must not be negative")
  if (data.electricMeter < 0)
    throw new Error("electricMeter must not be negative")

  // บันทึก/อัพเดทมิเตอร์
  await repo.upsertMeterReading(contract.roomId, month, year, {
    waterMeter: data.waterMeter,
    electricMeter: data.electricMeter,
  })

  // ถ้ามี bill อยู่แล้ว → อัพเดท items ใหม่
  const existingBill = await repo.getBillByContract(contractId, month, year)
  if (existingBill && Array.isArray(data.additionalItems)) {
    const { prisma } = await import("../../lib/prisma")
    // ลบ additional items เดิม (เก็บเฉพาะ items หลัก)
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

// ─────────────────────────────────────────
// 5. ส่งบิลห้องเดียว
// ─────────────────────────────────────────

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

  const { days, daysInMonth } = getBillingDays(contract, month, year)

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

// ─────────────────────────────────────────
// 6. ส่งบิลทั้งหมด
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// 7. ตรวจสอบการชำระเงิน
// ─────────────────────────────────────────

export const getPayments = async (
  propertyId: string,
  month: number,
  year: number,
  statusFilter?: string
) => {
  const payments = await repo.getPaymentsByProperty(propertyId, month, year)

  const filtered = statusFilter
    ? payments.filter((p) => p.status === statusFilter)
    : payments

  return filtered.map((p) => ({
    paymentId: p.id,
    roomNumber: p.bill.room.roomNumber,
    tenantName: `${p.user.firstName} ${p.user.lastName}`,
    amount: p.amount,
    slipUrl: p.slipUrl,
    paidAt: p.createdAt,
    status: p.status,
  }))
}

// ─────────────────────────────────────────
// 8. ดูข้อมูล payment (popup)
// ─────────────────────────────────────────

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

  // ดึงข้อมูล verified by (admin ที่ยืนยัน) — ดูจาก updatedAt และ status
  return {
    paymentId: payment.id,
    roomNumber: payment.bill.room.roomNumber,
    roomType: payment.bill.room.roomType?.name,
    amount: payment.amount,
    slipUrl: payment.slipUrl,
    paidAt: payment.createdAt,
    status: payment.status,
    // verifiedAt และ verifiedBy จะเพิ่มได้เมื่อ schema มี field นี้
  }
}

// ─────────────────────────────────────────
// 9. ยืนยันการชำระเงิน → PAID
// ─────────────────────────────────────────

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

  // อัพเดท payment → CONFIRMED พร้อม verifiedAt และ verifiedBy
  await repo.updatePaymentConfirmed(paymentId, adminEmail)

  // อัพเดท bill → PAID
  await repo.updateBillStatus(payment.billId, "PAID")

  return { message: "Payment confirmed" }
}

// ─────────────────────────────────────────
// 10. ปฏิเสธการชำระเงิน → กลับเป็น PENDING
// ─────────────────────────────────────────

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

  // อัพเดท payment → REJECTED
  await repo.updatePaymentStatus(paymentId, "REJECTED")

  // อัพเดท bill → กลับเป็น PENDING
  await repo.updateBillStatus(payment.billId, "PENDING")

  return { message: "Payment rejected" }
}
