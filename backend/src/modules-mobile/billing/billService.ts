import * as repo from "./billRepository"
import type {
  BillListResponse,
  BillPaymentInfoResponse,
  SubmitPaymentInput,
  SubmitPaymentResponse,
} from "./billModel"

// HELPERS
const MONTH_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
]

function formatBillingPeriod(
  month: number | null,
  year: number | null,
  startDay?: number,
  endDay?: number
): string {
  if (!month || !year) return "-"
  const m = MONTH_TH[month - 1]
  const y = year + 543
  const start = startDay ?? 1
  const end = endDay ?? new Date(year, month, 0).getDate()
  return `${start.toString().padStart(2, "0")} - ${end.toString().padStart(2, "0")} ${m} ${y}`
}

// ทำความสะอาด title: ตัด " × ฿X" ออก
function cleanItemTitle(title: string): string {
  return title.replace(/ × ฿[\d.]+/g, "")
}

// 1. ดึงรายการบิลทั้งหมด
export const getBills = async (userId: string): Promise<BillListResponse> => {
  const bills = await repo.getBillsByUser(userId)

  const totalUnpaid = bills
    .filter((b) => b.status === "PENDING" || b.status === "VERIFYING")
    .reduce((sum, b) => sum + b.total, 0)

  const billCards = bills.map((bill) => {
    const property = bill.contract.room.property
    const items = bill.items.map((i) => ({
      title: cleanItemTitle(i.title),
      amount: i.amount,
    }))

    return {
      billId: bill.id,
      propertyName: property.name,
      billingPeriod: formatBillingPeriod(bill.month, bill.year),
      firstName: bill.user?.firstName ?? "",
      lastName: bill.user?.lastName ?? "",
      roomNumber: bill.room.roomNumber,
      items,
      total: bill.total,
      status: bill.status as any,
      dueDate: null,
      pdfUrl: bill.pdfUrl,
    }
  })

  return { totalUnpaid, bills: billCards }
}

// 2. ดึงข้อมูลสำหรับหน้าชำระเงิน
export const getBillPaymentInfo = async (
  billId: string,
  userId: string
): Promise<BillPaymentInfoResponse> => {
  const bill = await repo.getBillById(billId, userId)
  if (!bill) throw new Error("Bill not found")

  if (bill.status === "PAID") throw new Error("Bill is already paid")

  const property = bill.contract.room.property

  return {
    billId: bill.id,
    propertyName: property.name,
    billingPeriod: formatBillingPeriod(bill.month, bill.year),
    total: bill.total,
    paymentQrUrl: property.paymentQrUrl,
    bankName: property.bankName,
    bankAccount: property.bankAccount,
    bankHolder: property.bankHolder,
    items: bill.items.map((i) => ({ title: i.title, amount: i.amount })),
  }
}

// 3. ดึงข้อมูลครบสำหรับ PDF
export const getBillDetail = async (billId: string, userId: string) => {
  const bill = await repo.getBillDetailById(billId, userId)
  if (!bill) throw new Error("Bill not found")

  const property = bill.contract.room.property
  const [meter, prevMeter] = await Promise.all([
    repo.getMeterReading(bill.roomId, bill.month!, bill.year!),
    repo.getPreviousMeterReading(bill.roomId, bill.month!, bill.year!),
  ])

  const waterPrev = prevMeter?.waterMeter ?? 0
  const waterCurrent = meter?.waterMeter ?? 0
  const electricPrev = prevMeter?.electricMeter ?? 0
  const electricCurrent = meter?.electricMeter ?? 0

  const today = new Date()
  const dateStr = new Intl.DateTimeFormat("th-TH", { timeZone: "Asia/Bangkok", day: "numeric", month: "long", year: "numeric" }).format(today)

  return {
    billId: bill.id,
    billingPeriod: formatBillingPeriod(bill.month, bill.year),
    property: {
      name: property.name,
      address: property.address ?? "",
      bankName: property.bankName ?? "",
      bankAccount: property.bankAccount ?? "",
      bankHolder: property.bankHolder ?? "",
      paymentQrUrl: property.paymentQrUrl ?? null,
      logoUrl: property.logoUrl ?? null,
      billNote: property.billNote ?? null,
    },
    roomNumber: bill.room.roomNumber,
    roomTypeName: bill.room.roomType.name,
    tenantName: `${bill.user?.firstName ?? ""} ${bill.user?.lastName ?? ""}`.trim(),
    items: bill.items.map((i) => ({ title: i.title, amount: i.amount })),
    total: bill.total,
    meter: { waterPrev, waterCurrent, electricPrev, electricCurrent },
    dateStr,
    issuerName: (() => {
      const admin = property.admins?.[0]?.user
      if (!admin) return ""
      return `${admin.firstName} ${admin.lastName}`.trim()
    })(),
  }
}

// 4. ชำระเงิน + อัพโหลดสลิป
export const submitPayment = async (
  billId: string,
  userId: string,
  data: SubmitPaymentInput
): Promise<SubmitPaymentResponse> => {
  if (!data.slipUrl) throw new Error("slipUrl is required")
  if (!data.amount || data.amount <= 0) throw new Error("amount is required")

  const bill = await repo.getBillById(billId, userId)
  if (!bill) throw new Error("Bill not found")
  if (bill.status === "PAID") throw new Error("Bill is already paid")
  if (bill.status === "VERIFYING") throw new Error("Payment is already submitted and under review")

  const payment = await repo.createPayment({
    userId,
    billId,
    amount: data.amount,
    slipUrl: data.slipUrl,
  })

  // อัพเดท bill → VERIFYING
  await repo.updateBillStatus(billId, "VERIFYING")

  const property = bill.contract.room.property

  return {
    paymentId: payment.id,
    propertyName: property.name,
    billingPeriod: formatBillingPeriod(bill.month, bill.year),
    amount: payment.amount,
    status: "VERIFYING",
  }
}
