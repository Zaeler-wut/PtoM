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

// แยก items ออกเป็น ค่าไฟ / ค่าน้ำ / ค่าเช่า / ค่าบริการคงที่
function parseItems(items: { title: string; amount: number }[]) {
  let electricCharge = 0
  let waterCharge = 0
  const extraFees: { title: string; amount: number }[] = []

  items.forEach((item) => {
    if (item.title.includes("ค่าไฟ")) electricCharge = item.amount
    else if (item.title.includes("ค่าน้ำ")) waterCharge = item.amount
    else if (!item.title.includes("ค่าเช่า") && !item.title.includes("ค่าเฟอร์นิเจอร์")) {
      extraFees.push(item)
    }
  })

  return { electricCharge, waterCharge, extraFees }
}

// 1. ดึงรายการบิลทั้งหมด
export const getBills = async (userId: string): Promise<BillListResponse> => {
  const bills = await repo.getBillsByUser(userId)

  const totalUnpaid = bills
    .filter((b) => b.status === "PENDING" || b.status === "VERIFYING")
    .reduce((sum, b) => sum + b.total, 0)

  const billCards = bills.map((bill) => {
    const property = bill.contract.room.property
    const { electricCharge, waterCharge, extraFees } = parseItems(bill.items)

    return {
      billId: bill.id,
      propertyName: property.name,
      billingPeriod: formatBillingPeriod(bill.month, bill.year),
      firstName: bill.user?.firstName ?? "",
      lastName: bill.user?.lastName ?? "",
      roomNumber: bill.room.roomNumber,
      roomRent: bill.roomRent,
      electricCharge,
      waterCharge,
      extraFees,
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

// 3. ชำระเงิน + อัพโหลดสลิป
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
