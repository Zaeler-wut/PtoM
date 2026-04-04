import { useState } from "react"
import { useParams } from "react-router-dom"
import {
  RiReceiptLine, RiCheckboxCircleLine, RiAlarmWarningLine,
  RiSendPlaneLine, RiMoneyDollarCircleLine, RiPercentLine,
  RiSearchLine, RiFilterLine, RiEyeLine, RiCloseLine,
  RiCheckLine, RiCloseFill, RiImageLine,
  RiEditLine, RiFileTextLine, RiDropLine, RiFlashlightLine,
  RiCalendarLine, RiInformationLine, RiAlertLine, RiTimeLine, RiUpload2Line,
} from "react-icons/ri"
import { SelectInput } from "../../components/shared/SelectInput"
import { Modal } from "../../components/shared/Modal"
import { useToast } from "../../components/shared/Toast"

// ── Types ──────────────────────────────────────────────────────────────────
type BillStatus = "INCOMPLETE" | "READY" | "PENDING" | "VERIFYING" | "PAID"
type PaymentStatus = "PENDING" | "VERIFYING" | "CONFIRMED" | "REJECTED"

interface MockBill {
  id: string
  roomNumber: string
  tenantName: string
  billingDays: number
  billingStartDay?: number   // ถ้ามี = บิลบางส่วน เช่น 1-15
  contractType?: string
  waterPrev: number
  waterCurr: number | null
  electricPrev: number
  electricCurr: number | null
  waterRate: number
  electricRate: number
  roomPrice: number
  furniturePrice: number
  extraFees: { title: string; amount: number }[]        // ค่าบริการคงที่รายเดือน
  additionalFees: { title: string; amount: number }[]   // ค่าใช้จ่ายเพิ่มเติมครั้งเดียว
  total: number
  status: BillStatus
}

interface MockPayment {
  id: string
  roomNumber: string
  tenantName: string
  amount: number
  slipUrl: string | null
  transferDate: string | null
  verifiedAt: string | null
  verifiedBy: string | null
  note: string
  status: PaymentStatus
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_BILLS: MockBill[] = [
  {
    id: "b1", roomNumber: "101", tenantName: "สมชาย ใจดี", billingDays: 31,
    waterPrev: 1250, waterCurr: 1268, electricPrev: 5420, electricCurr: 5542,
    waterRate: 18, electricRate: 7,
    roomPrice: 3500, furniturePrice: 0,
    extraFees: [{ title: "ค่าขยะ", amount: 100 }, { title: "ค่าส่วนกลาง", amount: 200 }, { title: "ค่าอินเทอร์เน็ต", amount: 200 }],
    additionalFees: [{ title: "ล้างแอร์", amount: 500 }],
    total: 5178, status: "PAID",
  },
  {
    id: "b2", roomNumber: "103", tenantName: "สมหญิง รักษ์ดี", billingDays: 31,
    waterPrev: 2100, waterCurr: 2122, electricPrev: 8650, electricCurr: 8832,
    waterRate: 18, electricRate: 7,
    roomPrice: 5000, furniturePrice: 360, extraFees: [],
    additionalFees: [],
    total: 7170, status: "VERIFYING",
  },
  {
    id: "b3", roomNumber: "201", tenantName: "วิชัย มั่นคง",
    billingDays: 15, billingStartDay: 1,
    waterPrev: 1580, waterCurr: null, electricPrev: 6240, electricCurr: null,
    waterRate: 18, electricRate: 7,
    roomPrice: 1500, furniturePrice: 0, extraFees: [],
    additionalFees: [],
    total: 1750, status: "INCOMPLETE",
  },
  {
    id: "b4", roomNumber: "204", tenantName: "ประภา สว่างไสว", billingDays: 31,
    waterPrev: 3200, waterCurr: 3285, electricPrev: 12500, electricCurr: null,
    waterRate: 18, electricRate: 7,
    roomPrice: 6500, furniturePrice: 0, extraFees: [{ title: "ค่าที่จอดรถ", amount: 320 }],
    additionalFees: [],
    total: 8030, status: "INCOMPLETE",
  },
  {
    id: "b5", roomNumber: "301", tenantName: "ธนพล สุขสบาย", billingDays: 31,
    waterPrev: 680, waterCurr: 700, electricPrev: 4100, electricCurr: 4250,
    waterRate: 18, electricRate: 7,
    roomPrice: 3500, furniturePrice: 330, extraFees: [],
    additionalFees: [],
    total: 5240, status: "PENDING",
  },
]

const MOCK_PAYMENTS: MockPayment[] = [
  {
    id: "p1", roomNumber: "101", tenantName: "สมชาย ใจดี",
    amount: 4678, slipUrl: null, transferDate: null, verifiedAt: null, verifiedBy: null,
    note: "", status: "PENDING",
  },
  {
    id: "p2", roomNumber: "104", tenantName: "ประสาร สาวใต้",
    amount: 8030, slipUrl: null, transferDate: null, verifiedAt: null, verifiedBy: null,
    note: "", status: "PENDING",
  },
  {
    id: "p3", roomNumber: "103", tenantName: "สมศรี จิตรดี",
    amount: 7170,
    slipUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    transferDate: "2026-03-02", verifiedAt: null, verifiedBy: null,
    note: "", status: "VERIFYING",
  },
  {
    id: "p4", roomNumber: "301", tenantName: "สมชาย ใจดี (ห้อง 301)",
    amount: 5240,
    slipUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    transferDate: "2026-03-05", verifiedAt: null, verifiedBy: null,
    note: "", status: "VERIFYING",
  },
  {
    id: "p5", roomNumber: "201", tenantName: "วิริยะ ยืนยง",
    amount: 1750,
    slipUrl: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400",
    transferDate: "2026-03-01", verifiedAt: "2026-03-01", verifiedBy: "admin@example.com",
    note: "ตรวจสอบแล้ว ถูกต้อง", status: "CONFIRMED",
  },
]

// ── Constants ──────────────────────────────────────────────────────────────
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

const BILL_STATUS_FILTER = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "INCOMPLETE", label: "ข้อมูลไม่ครบ" },
  { value: "READY", label: "พร้อมส่ง" },
  { value: "PENDING", label: "รอชำระ" },
  { value: "VERIFYING", label: "รอตรวจสอบ" },
  { value: "PAID", label: "ชำระแล้ว" },
]

const PAYMENT_STATUS_FILTER = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "PENDING", label: "รอชำระ" },
  { value: "VERIFYING", label: "รอตรวจสอบ" },
  { value: "CONFIRMED", label: "ชำระแล้ว" },
  { value: "REJECTED", label: "ปฏิเสธ" },
]

// ── Bill Status Badge ──────────────────────────────────────────────────────
const BILL_STATUS_CONFIG: Record<BillStatus, { label: string; className: string; icon: React.ElementType }> = {
  INCOMPLETE: { label: "ข้อมูลไม่ครบ", className: "bg-red-50 text-red-600 border-red-200",       icon: RiAlertLine },
  READY:      { label: "พร้อมส่ง",     className: "bg-blue-50 text-blue-700 border-blue-200",     icon: RiFileTextLine },
  PENDING:    { label: "รอชำระ",       className: "bg-orange-50 text-orange-700 border-orange-200", icon: RiTimeLine },
  VERIFYING:  { label: "รอตรวจสอบ",    className: "bg-orange-50 text-orange-700 border-orange-200", icon: RiTimeLine },
  PAID:       { label: "ชำระแล้ว",     className: "bg-green-50 text-green-700 border-green-200",  icon: RiCheckboxCircleLine },
}

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING:   { label: "รอชำระ",       className: "bg-orange-50 text-orange-700 border-orange-200" },
  VERIFYING: { label: "รอตรวจสอบ",    className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "ชำระแล้ว",     className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED:  { label: "ปฏิเสธ",       className: "bg-red-50 text-red-700 border-red-200" },
}

function BillStatusBadge({ status }: { status: BillStatus }) {
  const c = BILL_STATUS_CONFIG[status]
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${c.className}`}>
      <Icon size={12} />
      {c.label}
    </span>
  )
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const c = PAYMENT_STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.className}`}>
      {c.label}
    </span>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
  return `฿${n.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function fmtDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })
}

function SummaryCard({ title, value, subtitle, icon: Icon, colors }: {
  title: string; value: string; subtitle?: string
  icon: React.ElementType; colors: string
}) {
  return (
    <div className={`rounded-2xl p-5 border relative overflow-hidden ${colors}`}>
      <p className="text-xs font-medium opacity-70 mb-1">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
      {subtitle && <p className="text-xs mt-0.5 opacity-60">{subtitle}</p>}
      <div className="absolute -right-2 -bottom-2 opacity-10">
        <Icon size={80} />
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BillingPage() {
  useParams<{ propertyId: string }>()
  const { toast } = useToast()

  const [tab, setTab] = useState<"BILLING" | "PAYMENT">("BILLING")
  const [selectedMonth, setSelectedMonth] = useState(3) // มีนาคม
  const [selectedYear] = useState(2026)
  const [billFilter, setBillFilter] = useState("ALL")
  const [paymentFilter, setPaymentFilter] = useState("ALL")
  const [billSearch, setBillSearch] = useState("")
  const [paymentSearch, setPaymentSearch] = useState("")

  // bill state (mock mutations)
  const [bills, setBills] = useState<MockBill[]>(MOCK_BILLS)
  const [payments, setPayments] = useState<MockPayment[]>(MOCK_PAYMENTS)

  // modals
  const [selectedPayment, setSelectedPayment] = useState<MockPayment | null>(null)
  const [selectedBill, setSelectedBill] = useState<MockBill | null>(null)
  const [editBill, setEditBill] = useState<MockBill | null>(null)
  const [fixedFeeBill, setFixedFeeBill] = useState<MockBill | null>(null)
  const [uploadSlipPayment, setUploadSlipPayment] = useState<MockPayment | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")

  // ── Computed ──
  const monthOptions = THAI_MONTHS.map((m, i) => ({ value: String(i + 1), label: `${m} ${selectedYear + 543}` }))

  const filteredBills = bills.filter((b) => {
    const matchSearch = b.tenantName.includes(billSearch) || b.roomNumber.includes(billSearch)
    const matchStatus = billFilter === "ALL" || b.status === billFilter
    return matchSearch && matchStatus
  })

  const filteredPayments = payments.filter((p) => {
    const matchSearch = p.tenantName.includes(paymentSearch) || p.roomNumber.includes(paymentSearch)
    const matchStatus = paymentFilter === "ALL" || p.status === paymentFilter
    return matchSearch && matchStatus
  })

  // ── Summary counts ──
  const incompleteCount = bills.filter((b) => b.status === "INCOMPLETE").length
  const sentCount       = bills.filter((b) => ["PENDING", "VERIFYING", "PAID"].includes(b.status)).length
  const readyCount      = bills.filter((b) => b.status !== "INCOMPLETE").length
  const totalEstimate  = bills.reduce((s, b) => s + b.total, 0)
  const unpaidCount   = payments.filter((p) => p.status === "PENDING").length
  const paidAmount    = payments.filter((p) => p.status === "CONFIRMED").reduce((s, p) => s + p.amount, 0)

  // ── Actions (mock) ──
  const handleSendBill = (bill: MockBill) => {
    setBills((prev) => prev.map((b) => b.id === bill.id ? { ...b, status: "PENDING" } : b))
    toast(`ส่งบิลห้อง ${bill.roomNumber} สำเร็จ`, "success")
  }

  const handleApprove = (payment: MockPayment) => {
    setPayments((prev) => prev.map((p) =>
      p.id === payment.id
        ? { ...p, status: "CONFIRMED", verifiedAt: new Date().toISOString().split("T")[0], verifiedBy: "admin@example.com" }
        : p
    ))
    setBills((prev) => prev.map((b) => b.roomNumber === payment.roomNumber ? { ...b, status: "PAID" } : b))
    toast(`อนุมัติการชำระเงินห้อง ${payment.roomNumber} สำเร็จ`, "success")
    setSelectedPayment(null)
  }

  const handleReject = (id: string) => {
    setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: "REJECTED" } : p))
    toast("ปฏิเสธการชำระเงินแล้ว", "success")
    setRejectId(null)
    setRejectNote("")
    setSelectedPayment(null)
  }


  return (
    <div className="bg-purple-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ออกบิลรายเดือน</h1>
          <p className="text-sm text-gray-500 mt-1">
            จัดการออกบิลรายเดือนสำหรับผู้เช่า ตรวจสอบมิเตอร์ และตรวจสอบการชำระเงิน
          </p>
        </div>

        {/* Row 1: Month dropdown only */}
        <div className="mb-4">
          <div className="w-52">
            <SelectInput
              options={monthOptions}
              value={String(selectedMonth)}
              onValueChange={(v) => setSelectedMonth(Number(v))}
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border border-gray-200 rounded-xl p-1 bg-gray-50 w-full sm:max-w-lg mb-4">
          <button
            onClick={() => setTab("BILLING")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium transition-colors ${
              tab === "BILLING"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <RiReceiptLine size={16} /> ออกบิล
          </button>
          <button
            onClick={() => setTab("PAYMENT")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium transition-colors ${
              tab === "PAYMENT"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <RiCheckboxCircleLine size={16} /> ตรวจสอบการชำระเงิน
          </button>
        </div>

        {/* ── Tab: ออกบิล ── */}
        {tab === "BILLING" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                title="ข้อมูลไม่ครบ"
                value={`${incompleteCount} บิล`}
                icon={RiAlarmWarningLine}
                colors="bg-red-50 border-red-200 text-red-700"
              />
              <SummaryCard
                title="ส่งแล้ว"
                value={`${sentCount} บิล`}
                icon={RiSendPlaneLine}
                colors="bg-blue-50 border-blue-200 text-blue-800"
              />
              <SummaryCard
                title="ข้อมูลครบแล้ว"
                value={`${Math.round((readyCount / bills.length) * 100)}%`}
                subtitle={`${readyCount}/${bills.length}`}
                icon={RiPercentLine}
                colors="bg-purple-50 border-purple-200 text-purple-800"
              />
              <SummaryCard
                title="รายได้คาดการณ์"
                value={fmtCurrency(totalEstimate)}
                icon={RiMoneyDollarCircleLine}
                colors="bg-green-50 border-green-200 text-green-800"
              />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-4">
              {/* Action buttons row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setBills((prev) => prev.map((b) =>
                      b.status === "READY" ? { ...b, status: "PENDING" } : b
                    ))
                    toast("ยืนยันและส่งบิลทั้งหมดสำเร็จ", "success")
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  <RiSendPlaneLine size={15} /> ยืนยันและส่งบิลทั้งหมด
                </button>
                <button
                  onClick={() => toast("กำลังสร้างไฟล์ใบแจ้งหนี้ทั้งหมด...", "success")}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <RiFileTextLine size={15} /> โหลดใบแจ้งหนี้ทั้งหมด
                </button>
              </div>
              {/* Search + filter row */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
                  <RiSearchLine className="text-gray-400 flex-shrink-0" size={18} />
                  <input
                    type="text"
                    value={billSearch}
                    onChange={(e) => setBillSearch(e.target.value)}
                    placeholder="ค้นหาชื่อผู้เช่า หรือเลขห้อง..."
                    className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <RiFilterLine className="text-gray-400 flex-shrink-0" size={18} />
                  <div className="w-48">
                    <SelectInput
                      options={BILL_STATUS_FILTER}
                      value={billFilter}
                      onValueChange={setBillFilter}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-base font-semibold text-gray-700">
                  รายการบิล — {THAI_MONTHS[selectedMonth - 1]} {selectedYear + 543} ({filteredBills.length} รายการ)
                </p>
              </div>
              <div className="mx-6 mb-5 mt-4 rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">ห้อง</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">ชื่อผู้เช่า</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">รอบบิล</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <RiDropLine size={11} className="text-blue-400" />
                          <RiFlashlightLine size={11} className="text-yellow-500" />
                          <span>ก่อนหน้า</span>
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <RiDropLine size={11} className="text-blue-400" />
                          <RiFlashlightLine size={11} className="text-yellow-500" />
                          <span>ล่าสุด</span>
                        </div>
                      </th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">หน่วยที่ใช้</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">ค่าบริการคงที่</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">ยอดรวม</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">สถานะ</th>
                      <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-sm text-gray-400 text-center">ไม่พบรายการ</td>
                      </tr>
                    ) : filteredBills.map((bill) => {
                      const waterUnits = bill.waterCurr != null ? bill.waterCurr - bill.waterPrev : null
                      const electricUnits = bill.electricCurr != null ? bill.electricCurr - bill.electricPrev : null
                      const isPartial = bill.billingStartDay != null
                      const billingLabel = isPartial
                        ? `${bill.billingStartDay}-${bill.billingStartDay! + bill.billingDays - 1} ${THAI_MONTHS[selectedMonth - 1].slice(0, 3)}. (${bill.billingDays} วัน)`
                        : `${THAI_MONTHS[selectedMonth - 1]} (${bill.billingDays} วัน)`

                      return (
                        <tr key={bill.id} className="hover:bg-gray-50 transition-colors">

                          {/* ห้อง */}
                          <td className="px-3 py-3 text-center text-sm font-semibold text-gray-800 whitespace-nowrap">
                            {bill.roomNumber}
                          </td>

                          {/* ชื่อผู้เช่า */}
                          <td className="px-3 py-3 text-left text-sm text-gray-700 whitespace-nowrap">
                            {bill.tenantName}
                          </td>

                          {/* รอบบิล */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            {isPartial ? (
                              <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
                                <RiCalendarLine size={11} />{billingLabel}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-600">{billingLabel}</span>
                            )}
                          </td>

                          {/* มิเตอร์ก่อนหน้า */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="space-y-0.5 flex flex-col items-center">
                              <div className="flex items-center gap-1 text-xs text-gray-700">
                                <RiDropLine size={11} className="text-blue-400 flex-shrink-0" />
                                <span className="font-medium">{bill.waterPrev.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-gray-700">
                                <RiFlashlightLine size={11} className="text-yellow-500 flex-shrink-0" />
                                <span className="font-medium">{bill.electricPrev.toLocaleString()}</span>
                              </div>
                            </div>
                          </td>

                          {/* มิเตอร์ล่าสุด */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="space-y-0.5 flex flex-col items-center">
                              <div className="flex items-center gap-1 text-xs">
                                <RiDropLine size={11} className="text-blue-400 flex-shrink-0" />
                                {bill.waterCurr != null
                                  ? <span className="font-medium text-gray-700">{bill.waterCurr.toLocaleString()}</span>
                                  : <span className="text-gray-400">-</span>}
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <RiFlashlightLine size={11} className="text-yellow-500 flex-shrink-0" />
                                {bill.electricCurr != null
                                  ? <span className="font-medium text-gray-700">{bill.electricCurr.toLocaleString()}</span>
                                  : <span className="text-gray-400">-</span>}
                              </div>
                            </div>
                          </td>

                          {/* หน่วยที่ใช้ */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="space-y-0.5 flex flex-col items-center">
                              <div className="flex items-center gap-1 text-xs">
                                <RiDropLine size={11} className="text-blue-400 flex-shrink-0" />
                                <span className="font-medium text-gray-700">{waterUnits ?? 0}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <RiFlashlightLine size={11} className="text-yellow-500 flex-shrink-0" />
                                <span className="font-medium text-gray-700">{electricUnits ?? 0}</span>
                              </div>
                            </div>
                          </td>

                          {/* ค่าคงที่ */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <button
                              onClick={() => setFixedFeeBill(bill)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                              title="ดูรายละเอียดค่าบริการคงที่"
                            >
                              <RiInformationLine size={16} />
                            </button>
                          </td>

                          {/* ยอดรวม */}
                          <td className="px-3 py-3 text-left whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-900">{fmtCurrency(bill.total)}</span>
                          </td>

                          {/* สถานะ */}
                          <td className="px-3 py-3 text-center whitespace-nowrap">
                            <BillStatusBadge status={bill.status} />
                          </td>

                          {/* จัดการ */}
                          <td className="px-3 py-3 whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setEditBill(bill)} title="แก้ไข"
                                className="text-gray-400 hover:text-gray-700 transition-colors">
                                <RiEditLine size={15} />
                              </button>
                              <button onClick={() => setSelectedBill(bill)} title="ดูใบแจ้งหนี้"
                                className="text-gray-400 hover:text-gray-700 transition-colors">
                                <RiFileTextLine size={15} />
                              </button>
                              <button onClick={() => handleSendBill(bill)} title="ส่งบิล"
                                className="text-purple-400 hover:text-purple-700 transition-colors">
                                <RiSendPlaneLine size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* ── Tab: ตรวจสอบการชำระเงิน ── */}
        {tab === "PAYMENT" && (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <SummaryCard
                title="ยังไม่ชำระ"
                value={`${unpaidCount} บิล`}
                icon={RiAlarmWarningLine}
                colors="bg-orange-50 border-orange-200 text-orange-800"
              />
              <SummaryCard
                title="รอตรวจสอบ"
                value={`${payments.filter((p) => p.status === "VERIFYING").length} บิล`}
                icon={RiReceiptLine}
                colors="bg-yellow-50 border-yellow-200 text-yellow-800"
              />
              <SummaryCard
                title="ชำระแล้ว"
                value={`${payments.filter((p) => p.status === "CONFIRMED").length} บิล`}
                icon={RiCheckboxCircleLine}
                colors="bg-green-50 border-green-200 text-green-800"
              />
              <SummaryCard
                title="รายได้ที่ได้รับ"
                value={fmtCurrency(paidAmount)}
                icon={RiMoneyDollarCircleLine}
                colors="bg-purple-50 border-purple-200 text-purple-800"
              />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
                <RiSearchLine className="text-gray-400 flex-shrink-0" size={18} />
                <input
                  type="text"
                  value={paymentSearch}
                  onChange={(e) => setPaymentSearch(e.target.value)}
                  placeholder="ค้นหาชื่อผู้เช่า หรือเลขห้อง..."
                  className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <RiFilterLine className="text-gray-400 flex-shrink-0" size={18} />
                <div className="w-48">
                  <SelectInput
                    options={PAYMENT_STATUS_FILTER}
                    value={paymentFilter}
                    onValueChange={setPaymentFilter}
                  />
                </div>
              </div>
            </div>

            {/* Payment Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-base font-semibold text-gray-700">
                  รายการชำระเงิน — {THAI_MONTHS[selectedMonth - 1]} {selectedYear + 543} ({filteredPayments.length} รายการ)
                </p>
              </div>
              <div className="overflow-x-auto mx-6 mb-5 mt-4 rounded-xl border border-gray-200">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-gray-50/50 border-b border-gray-200">
                    <tr>
                      {["ห้อง", "ชื่อผู้เช่า", "ยอดเงิน", "หลักฐานสลิป", "วันที่โอน", "สถานะ", "จัดการ"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-sm text-gray-400 text-center">ไม่พบรายการ</td>
                      </tr>
                    ) : filteredPayments.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 whitespace-nowrap">
                          {pmt.roomNumber}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">
                          {pmt.tenantName}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">
                          {fmtCurrency(pmt.amount)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {pmt.slipUrl ? (
                            <button
                              onClick={() => setSelectedPayment(pmt)}
                              className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-700 font-medium"
                            >
                              <RiImageLine size={13} /> ดูสลิป
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">
                          {fmtDate(pmt.transferDate)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <PaymentStatusBadge status={pmt.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {pmt.status === "VERIFYING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(pmt)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors"
                                >
                                  <RiCheckLine size={12} /> อนุมัติ
                                </button>
                                <button
                                  onClick={() => { setRejectId(pmt.id); setSelectedPayment(null) }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <RiCloseFill size={12} /> ปฏิเสธ
                                </button>
                              </>
                            )}
                            {pmt.status === "PENDING" && (
                              <button
                                onClick={() => setUploadSlipPayment(pmt)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                <RiUpload2Line size={12} /> อัพโหลดสลิป
                              </button>
                            )}
                            {pmt.status === "CONFIRMED" && (
                              <button
                                onClick={() => setSelectedPayment(pmt)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                <RiEyeLine size={12} /> ดูข้อมูล
                              </button>
                            )}
                            {pmt.status === "REJECTED" && (
                              <span className="text-xs text-gray-400 italic">ถูกปฏิเสธ</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Upload Slip Modal ── */}
      {uploadSlipPayment && (
        <UploadSlipModal
          payment={uploadSlipPayment}
          onClose={() => setUploadSlipPayment(null)}
          onSuccess={(slipUrl: string) => {
            setPayments((prev) => prev.map((p) =>
              p.id === uploadSlipPayment.id
                ? { ...p, slipUrl, transferDate: new Date().toISOString().split("T")[0], status: "VERIFYING" }
                : p
            ))
            toast(`อัพโหลดสลิปห้อง ${uploadSlipPayment.roomNumber} สำเร็จ`, "success")
            setUploadSlipPayment(null)
          }}
        />
      )}

      {/* ── Edit Bill Modal ── */}
      {editBill && (
        <EditBillModal
          bill={editBill}
          onClose={() => setEditBill(null)}
          onSave={(updated: MockBill) => {
            setBills((prev) => prev.map((b) => b.id === updated.id ? updated : b))
            toast(`บันทึกข้อมูลห้อง ${updated.roomNumber} สำเร็จ`, "success")
            setEditBill(null)
          }}
        />
      )}

      {/* ── Fixed Fee Detail Modal ── */}
      {fixedFeeBill && (
        <FixedFeeDetailModal
          bill={fixedFeeBill}
          onClose={() => setFixedFeeBill(null)}
        />
      )}

      {/* ── Bill Detail Modal ── */}
      {selectedBill && (
        <BillDetailModal
          bill={selectedBill}
          onClose={() => setSelectedBill(null)}
        />
      )}

      {/* ── Payment Detail Modal ── */}
      {selectedPayment && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onApprove={handleApprove}
          onReject={(id) => { setRejectId(id); setSelectedPayment(null) }}
        />
      )}

      {/* ── Reject Confirm Modal ── */}
      {rejectId && (
        <Modal
          open
          onOpenChange={(o) => { if (!o) { setRejectId(null); setRejectNote("") } }}
          title="ปฏิเสธการชำระเงิน"
          description="กรุณาระบุเหตุผลในการปฏิเสธ"
          size="sm"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">หมายเหตุ</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="ระบุเหตุผล เช่น หลักฐานไม่ชัดเจน..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setRejectId(null); setRejectNote("") }}
                className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleReject(rejectId)}
                className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-xl hover:bg-red-700 transition-colors"
              >
                ยืนยันการปฏิเสธ
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Edit Bill Modal ───────────────────────────────────────────────────────
function EditBillModal({ bill, onClose, onSave }: {
  bill: MockBill
  onClose: () => void
  onSave: (updated: MockBill) => void
}) {
  const [waterPrev, setWaterPrev] = useState<string>(String(bill.waterPrev))
  const [waterCurr, setWaterCurr] = useState<string>(bill.waterCurr != null ? String(bill.waterCurr) : "")
  const [electricPrev, setElectricPrev] = useState<string>(String(bill.electricPrev))
  const [electricCurr, setElectricCurr] = useState<string>(bill.electricCurr != null ? String(bill.electricCurr) : "")
  const [additionalFees, setAdditionalFees] = useState(bill.additionalFees)

  const wPrev = waterPrev !== "" ? Number(waterPrev) : bill.waterPrev
  const wCurr = waterCurr !== "" ? Number(waterCurr) : null
  const ePrev = electricPrev !== "" ? Number(electricPrev) : bill.electricPrev
  const eCurr = electricCurr !== "" ? Number(electricCurr) : null
  const waterUnits = wCurr != null ? wCurr - wPrev : null
  const electricUnits = eCurr != null ? eCurr - ePrev : null
  const waterCharge = waterUnits != null ? waterUnits * bill.waterRate : 0
  const electricCharge = electricUnits != null ? electricUnits * bill.electricRate : 0
  const fixedTotal = bill.extraFees.reduce((s, f) => s + f.amount, 0)
  const additionalTotal = additionalFees.reduce((s, f) => s + f.amount, 0)
  const total = bill.roomPrice + bill.furniturePrice + waterCharge + electricCharge + fixedTotal + additionalTotal

  const handleSave = () => {
    const newStatus: BillStatus =
      wCurr != null && eCurr != null
        ? bill.status === "INCOMPLETE" ? "READY" : bill.status
        : "INCOMPLETE"
    onSave({ ...bill, waterPrev: wPrev, waterCurr: wCurr, electricPrev: ePrev, electricCurr: eCurr, additionalFees, total, status: newStatus })
  }

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={`แก้ไขบิล — ห้อง ${bill.roomNumber}`}
      description={bill.tenantName}
      size="md"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

        {/* Water meter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <RiDropLine size={16} className="text-blue-500" />
            <p className="text-sm font-semibold text-gray-800">มิเตอร์น้ำ</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">เดือนก่อนหน้า</label>
              <input type="number" value={waterPrev} onChange={(e) => setWaterPrev(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">เดือนล่าสุด</label>
              <input type="number" value={waterCurr} onChange={(e) => setWaterCurr(e.target.value)}
                placeholder="กรอกมิเตอร์ล่าสุด"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            หน่วยที่ใช้: <span className="font-semibold text-gray-700">{waterUnits != null ? `${waterUnits} หน่วย` : "—"}</span>
          </p>
        </div>

        {/* Electric meter */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <RiFlashlightLine size={16} className="text-yellow-500" />
            <p className="text-sm font-semibold text-gray-800">มิเตอร์ไฟฟ้า</p>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">เดือนก่อนหน้า</label>
              <input type="number" value={electricPrev} onChange={(e) => setElectricPrev(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-yellow-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">เดือนล่าสุด</label>
              <input type="number" value={electricCurr} onChange={(e) => setElectricCurr(e.target.value)}
                placeholder="กรอกมิเตอร์ล่าสุด"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            หน่วยที่ใช้: <span className="font-semibold text-gray-700">{electricUnits != null ? `${electricUnits} หน่วย` : "—"}</span>
          </p>
        </div>

        {/* ค่าบริการคงที่ (read-only) + ค่าใช้จ่ายเพิ่มเติม (editable) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-800">รายการค่าบริการ</p>
            <button
              onClick={() => setAdditionalFees((prev) => [...prev, { title: "", amount: 0 }])}
              className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              + เพิ่มรายการ
            </button>
          </div>
          <div className="space-y-2">
            {additionalFees.map((fee, idx) => (
              <div key={`add-${idx}`} className="flex items-center gap-2">
                <input type="text" value={fee.title} placeholder="ชื่อรายการ"
                  onChange={(e) => setAdditionalFees((prev) => prev.map((f, i) => i === idx ? { ...f, title: e.target.value } : f))}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                <input type="number" value={fee.amount} placeholder="0"
                  onChange={(e) => setAdditionalFees((prev) => prev.map((f, i) => i === idx ? { ...f, amount: Number(e.target.value) } : f))}
                  className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400" />
                <button onClick={() => setAdditionalFees((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <RiCloseLine size={16} />
                </button>
              </div>
            ))}
            {additionalFees.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-3">ไม่มีรายการเพิ่มเติม</p>
            )}
          </div>
        </div>

        {/* Summary card */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>ค่าเช่า:</span>
            <span>{fmtCurrency(bill.roomPrice)}</span>
          </div>
          {bill.furniturePrice > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>ค่าเฟอร์นิเจอร์:</span>
              <span>{fmtCurrency(bill.furniturePrice)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-gray-600">
            <span>ค่าน้ำ (฿{bill.waterRate}/หน่วย):</span>
            <span>{fmtCurrency(waterCharge)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>ค่าไฟ (฿{bill.electricRate}/หน่วย):</span>
            <span>{fmtCurrency(electricCharge)}</span>
          </div>
          {bill.extraFees.map((fee, idx) => (
            <div key={`sf-${idx}`} className="flex justify-between text-sm text-gray-600">
              <span>{fee.title}:</span>
              <span>{fmtCurrency(fee.amount)}</span>
            </div>
          ))}
          {additionalFees.map((fee, idx) => (
            <div key={`af-${idx}`} className="flex justify-between text-sm text-gray-600">
              <span>{fee.title || `รายการที่ ${idx + 1}`}:</span>
              <span>{fmtCurrency(fee.amount)}</span>
            </div>
          ))}
          <div className="border-t border-green-200 pt-2 mt-1 flex flex-col items-start gap-0.5">
            <span className="text-sm font-bold text-gray-800">ยอดรวมทั้งสิ้น:</span>
            <span className="text-xl font-bold text-green-600">{fmtCurrency(total)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleSave}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
            บันทึก
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Upload Slip Modal ─────────────────────────────────────────────────────
function UploadSlipModal({ payment, onClose, onSuccess }: {
  payment: MockPayment
  onClose: () => void
  onSuccess: (slipUrl: string) => void
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split("T")[0])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = () => {
    if (!selectedFile) return
    // mock: ใช้ preview URL แทน Cloudinary
    onSuccess(preview!)
  }

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="อัพโหลดสลิปการชำระเงิน"
      description={`ห้อง ${payment.roomNumber} — ${payment.tenantName}`}
      size="sm"
    >
      <div className="space-y-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>ยอดที่ต้องชำระ</span>
          <span className="font-bold text-gray-900">{fmtCurrency(payment.amount)}</span>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">วันที่โอนเงิน</label>
          <input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">สลิปการโอนเงิน</label>
          <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
            selectedFile ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:border-purple-300"
          }`}>
            {preview ? (
              <img src={preview} alt="slip preview" className="w-full max-h-52 object-contain rounded-xl p-1" />
            ) : (
              <div className="py-8 text-center">
                <RiUpload2Line className="mx-auto text-gray-300 mb-2" size={28} />
                <p className="text-sm text-gray-500">คลิกเพื่อเลือกรูปสลิป</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedFile}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RiUpload2Line size={14} /> ยืนยันอัพโหลด
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Fixed Fee Detail Modal ────────────────────────────────────────────────
function FixedFeeDetailModal({ bill, onClose }: { bill: MockBill; onClose: () => void }) {
  const items = bill.extraFees
  const total = items.reduce((s, i) => s + i.amount, 0)

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="รายละเอียดค่าบริการคงที่"
      description={`ห้อง ${bill.roomNumber}`}
      size="sm"
    >
      <div className="space-y-3">
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-gray-600">
              <span>{item.title}:</span>
              <span>{fmtCurrency(item.amount)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold text-gray-900">
          <span>รวมค่าบริการคงที่:</span>
          <span>{fmtCurrency(total)}</span>
        </div>
        <div className="flex justify-end pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Bill Detail Modal ──────────────────────────────────────────────────────
function BillDetailModal({ bill, onClose }: { bill: MockBill; onClose: () => void }) {
  const waterUnits = bill.waterCurr != null ? bill.waterCurr - bill.waterPrev : null
  const electricUnits = bill.electricCurr != null ? bill.electricCurr - bill.electricPrev : null
  const waterCharge = waterUnits != null ? waterUnits * bill.waterRate : 0
  const electricCharge = electricUnits != null ? electricUnits * bill.electricRate : 0

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={`รายละเอียดบิล — ห้อง ${bill.roomNumber}`}
      description={bill.tenantName}
      size="md"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* Header info */}
        <div className="flex items-center justify-between">
          <BillStatusBadge status={bill.status} />
          <span className="text-xs text-gray-400">{bill.contractType} · {bill.billingDays} วัน</span>
        </div>

        <div className="border-t border-gray-100" />

        {/* Meter section */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">ข้อมูลมิเตอร์</p>
          <div className="grid grid-cols-2 gap-3">
            {/* Water */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <p className="text-xs font-medium text-blue-600 mb-2">มิเตอร์น้ำ</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between"><span>มิเตอร์เดิม</span><span>{bill.waterPrev.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>มิเตอร์ใหม่</span><span className="font-medium">{bill.waterCurr?.toLocaleString() ?? "—"}</span></div>
                <div className="flex justify-between border-t border-blue-100 pt-1 mt-1 font-semibold text-blue-700">
                  <span>ใช้ {waterUnits ?? "—"} หน่วย × ฿{bill.waterRate}</span>
                  <span>฿{waterCharge.toLocaleString()}</span>
                </div>
              </div>
            </div>
            {/* Electric */}
            <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
              <p className="text-xs font-medium text-yellow-600 mb-2">มิเตอร์ไฟฟ้า</p>
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex justify-between"><span>มิเตอร์เดิม</span><span>{bill.electricPrev.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>มิเตอร์ใหม่</span><span className="font-medium">{bill.electricCurr?.toLocaleString() ?? "—"}</span></div>
                <div className="flex justify-between border-t border-yellow-100 pt-1 mt-1 font-semibold text-yellow-700">
                  <span>ใช้ {electricUnits ?? "—"} หน่วย × ฿{bill.electricRate}</span>
                  <span>฿{electricCharge.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100" />

        {/* Cost breakdown */}
        <div>
          <p className="text-sm font-semibold text-gray-800 mb-3">สรุปค่าใช้จ่าย</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>ค่าเช่าห้อง</span><span>฿{bill.roomPrice.toLocaleString()}</span>
            </div>
            {bill.furniturePrice > 0 && (
              <div className="flex justify-between text-sm text-gray-600">
                <span>ค่าเฟอร์นิเจอร์</span><span>฿{bill.furniturePrice.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm text-gray-600">
              <span>ค่าน้ำ ({waterUnits} หน่วย)</span><span>฿{waterCharge.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>ค่าไฟ ({electricUnits} หน่วย)</span><span>฿{electricCharge.toLocaleString()}</span>
            </div>
            {bill.extraFees.map((f, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600">
                <span>{f.title}</span><span>฿{f.amount.toLocaleString()}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-gray-200 pt-2 mt-1">
              <span>ยอดรวมสุทธิ</span>
              <span className="text-purple-700">{`฿${bill.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ปิด
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Payment Detail Modal ───────────────────────────────────────────────────
function PaymentDetailModal({ payment, onClose, onApprove, onReject }: {
  payment: MockPayment
  onClose: () => void
  onApprove: (p: MockPayment) => void
  onReject: (id: string) => void
}) {
  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={`รายละเอียดการชำระเงิน — ห้อง ${payment.roomNumber}`}
      description={payment.tenantName}
      size="md"
    >
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="flex items-center justify-between">
          <PaymentStatusBadge status={payment.status} />
        </div>

        {/* Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">ห้อง</p>
            <p className="text-sm font-semibold text-gray-800">{payment.roomNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">ยอดเงิน</p>
            <p className="text-sm font-bold text-purple-700">{fmtCurrency(payment.amount)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">วันที่โอน</p>
            <p className="text-sm text-gray-700">{fmtDate(payment.transferDate)}</p>
          </div>
          {payment.verifiedAt && (
            <div>
              <p className="text-xs text-gray-400 mb-1">วันที่ตรวจสอบ</p>
              <p className="text-sm text-gray-700">{fmtDate(payment.verifiedAt)}</p>
            </div>
          )}
          {payment.verifiedBy && (
            <div className="col-span-2">
              <p className="text-xs text-gray-400 mb-1">ตรวจสอบโดย</p>
              <p className="text-sm text-gray-700">{payment.verifiedBy}</p>
            </div>
          )}
        </div>

        {/* Slip image */}
        {payment.slipUrl && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">หลักฐานการชำระเงิน</p>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={payment.slipUrl}
                alt="slip"
                className="w-full object-cover max-h-52"
              />
            </div>
          </div>
        )}

        {/* Note */}
        {payment.note && (
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="text-xs font-medium text-green-700 mb-1">หมายเหตุ</p>
            <p className="text-sm text-green-800">{payment.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <RiCloseLine size={14} className="inline mr-1" />ปิด
          </button>
          {payment.status === "VERIFYING" && (
            <>
              <button
                onClick={() => onReject(payment.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm border border-red-200 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <RiCloseFill size={14} /> ปฏิเสธ
              </button>
              <button
                onClick={() => onApprove(payment)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-green-600 text-white text-sm rounded-xl hover:bg-green-700 transition-colors"
              >
                <RiCheckLine size={14} /> อนุมัติ
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  )
}
