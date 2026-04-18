import { useState, useEffect, useCallback, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAppSelector } from "../../store/hooks"
import {
  RiReceiptLine, RiCheckboxCircleLine, RiAlarmWarningLine,
  RiSendPlaneLine, RiMoneyDollarCircleLine, RiPercentLine,
  RiSearchLine, RiFilterLine, RiEyeLine, RiCloseLine,
  RiCheckLine, RiCloseFill, RiImageLine, RiUpload2Line,
  RiEditLine, RiFileTextLine, RiDropLine, RiFlashlightLine,
  RiInformationLine, RiAlertLine, RiTimeLine, RiCalendarLine,
  RiLogoutBoxLine,
} from "react-icons/ri"
import { SelectInput } from "../../components/shared/SelectInput"
import { Modal } from "../../components/shared/Modal"
import { useToast } from "../../components/shared/Toast"
import { Pagination } from "../../components/shared/Pagination"
import {
  getBillingSummary, getRoomFees, getInvoice,
  updateMeter, sendBill, sendAllBills,
  getPayments, confirmPayment, rejectPayment,
  submitPaymentByAdmin, uploadSlipImage, getAvailableMonths,
} from "../../api/billing/billingApi"
import type {
  BillStatus, PaymentStatus,
  BillingSummaryCards, BillingTableRow,
  InvoiceResponse, RoomFeesResponse,
  PaymentListItem,
} from "../../types/billing.types"

// ── Constants ──────────────────────────────────────────────────────────────
const THAI_MONTHS = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
]

const BILL_STATUS_FILTER = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "DRAFT", label: "ข้อมูลไม่ครบ" },
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
  DRAFT:     { label: "ข้อมูลไม่ครบ", className: "bg-red-50 text-red-600 border-red-200",          icon: RiAlertLine },
  READY:     { label: "พร้อมส่ง",     className: "bg-blue-50 text-blue-700 border-blue-200",       icon: RiFileTextLine },
  PENDING:   { label: "รอชำระ",       className: "bg-orange-50 text-orange-700 border-orange-200", icon: RiTimeLine },
  VERIFYING: { label: "รอตรวจสอบ",    className: "bg-orange-50 text-orange-700 border-orange-200", icon: RiTimeLine },
  PAID:      { label: "ชำระแล้ว",     className: "bg-green-50 text-green-700 border-green-200",    icon: RiCheckboxCircleLine },
}

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PENDING:   { label: "รอชำระ",    className: "bg-orange-50 text-orange-700 border-orange-200" },
  VERIFYING: { label: "รอตรวจสอบ", className: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  CONFIRMED: { label: "ชำระแล้ว",  className: "bg-green-50 text-green-700 border-green-200" },
  REJECTED:  { label: "ปฏิเสธ",    className: "bg-red-50 text-red-700 border-red-200" },
}

function BillStatusBadge({ status }: { status: BillStatus }) {
  const c = BILL_STATUS_CONFIG[status]
  const Icon = c.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${c.className}`}>
      <Icon size={12} />{c.label}
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
      <div className="absolute -right-2 -bottom-2 opacity-10"><Icon size={80} /></div>
    </div>
  )
}

// ── Upload Slip Modal ──────────────────────────────────────────────────────
function UploadSlipModal({
  billId, propertyId, onClose, onSuccess,
}: {
  billId: string
  propertyId: string
  onClose: () => void
  onSuccess: () => void
}) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      let slipUrl: string | undefined
      if (file) {
        const result = await uploadSlipImage(file)
        slipUrl = result.url
      }
      await submitPaymentByAdmin(propertyId, billId, slipUrl)
      toast("บันทึกการชำระเงินสำเร็จ", "success")
      onSuccess()
    } catch (e: any) {
      toast(e?.response?.data?.error ?? "เกิดข้อผิดพลาด", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal open onOpenChange={(v) => { if (!v && !isSubmitting) onClose() }} title="อัพโหลดหลักฐานการชำระเงิน" size="sm">
      <div className="space-y-4">
        {/* File picker */}
        <div
          onClick={() => document.getElementById("slip-file-input")?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            preview ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
          }`}
        >
          {preview ? (
            <img src={preview} alt="slip preview" className="max-h-52 mx-auto rounded-lg object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <RiUpload2Line size={28} />
              <p className="text-sm">คลิกเพื่อเลือกรูปสลิป</p>
              <p className="text-xs">JPG, PNG, WEBP (ไม่เกิน 5MB)</p>
            </div>
          )}
          <input
            id="slip-file-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BillingPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()

  const now = new Date()
  const [tab, setTab] = useState<"BILLING" | "PAYMENT">("BILLING")
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [availableMonths, setAvailableMonths] = useState<{ month: number; year: number }[]>([])
  const [billFilter, setBillFilter] = useState("ALL")
  const [paymentFilter, setPaymentFilter] = useState("ALL")
  const [billSearch, setBillSearch] = useState("")
  const [paymentSearch, setPaymentSearch] = useState("")

  // data
  const [summary, setSummary] = useState<BillingSummaryCards | null>(null)
  const [bills, setBills] = useState<BillingTableRow[]>([])
  const [payments, setPayments] = useState<PaymentListItem[]>([])
  const [isLoadingBills, setIsLoadingBills] = useState(false)
  const [isLoadingPayments, setIsLoadingPayments] = useState(false)

  // modals
  const [editBill, setEditBill] = useState<BillingTableRow | null>(null)
  const [detailBill, setDetailBill] = useState<BillingTableRow | null>(null)
  const [fixedFeesBill, setFixedFeesBill] = useState<BillingTableRow | null>(null)
  const [selectedPayment, setSelectedPayment] = useState<PaymentListItem | null>(null)
  const [rejectId, setRejectId] = useState<string | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [uploadSlipBillId, setUploadSlipBillId] = useState<string | null>(null)

  // ── Loaders ──
  const loadBills = useCallback(() => {
    if (!propertyId) return
    setIsLoadingBills(true)
    getBillingSummary(propertyId, selectedMonth, selectedYear)
      .then(({ summary: s, bills: b }) => { setSummary(s); setBills(b) })
      .catch(() => toast("โหลดข้อมูลบิลไม่สำเร็จ", "error"))
      .finally(() => setIsLoadingBills(false))
  }, [propertyId, selectedMonth, selectedYear])

  const loadPayments = useCallback(() => {
    if (!propertyId) return
    setIsLoadingPayments(true)
    getPayments(propertyId, selectedMonth, selectedYear)
      .then(setPayments)
      .catch(() => toast("โหลดข้อมูลการชำระเงินไม่สำเร็จ", "error"))
      .finally(() => setIsLoadingPayments(false))
  }, [propertyId, selectedMonth, selectedYear])

  useEffect(() => { loadBills() }, [loadBills])
  useEffect(() => { if (tab === "PAYMENT") loadPayments() }, [tab, loadPayments])

  useEffect(() => {
    if (!propertyId) return
    getAvailableMonths(propertyId).then((rows) => {
      const current = { month: now.getMonth() + 1, year: now.getFullYear() }
      const hasCurrentMonth = rows.some((r) => r.month === current.month && r.year === current.year)
      setAvailableMonths(hasCurrentMonth ? rows : [current, ...rows])
    }).catch(() => {})
  }, [propertyId])

  // ── Actions ──
  const handleSendBill = (bill: BillingTableRow) => {
    if (!propertyId) return
    sendBill(propertyId, bill.contractId, selectedMonth, selectedYear)
      .then(() => { toast(`ส่งบิลห้อง ${bill.roomNumber} สำเร็จ`, "success"); loadBills() })
      .catch(() => toast("ส่งบิลไม่สำเร็จ", "error"))
  }

  const handleSendAll = () => {
    if (!propertyId) return
    sendAllBills(propertyId, selectedMonth, selectedYear)
      .then(({ success }: { success: number }) => {
        toast(`ส่งบิลสำเร็จ ${success} รายการ`, "success"); loadBills()
      })
      .catch(() => toast("เกิดข้อผิดพลาด", "error"))
  }

  const handleApprove = (payment: PaymentListItem) => {
    if (!propertyId) return
    confirmPayment(propertyId, payment.paymentId)
      .then(() => {
        toast(`อนุมัติการชำระเงินห้อง ${payment.roomNumber} สำเร็จ`, "success")
        setSelectedPayment(null)
        loadPayments(); loadBills()
      })
      .catch(() => toast("เกิดข้อผิดพลาด", "error"))
  }

  const handleReject = (paymentId: string) => {
    if (!propertyId) return
    rejectPayment(propertyId, paymentId)
      .then(() => {
        toast("ปฏิเสธการชำระเงินแล้ว", "success")
        setRejectId(null); setRejectNote(""); setSelectedPayment(null)
        loadPayments()
      })
      .catch(() => toast("เกิดข้อผิดพลาด", "error"))
  }

  const authUser = useAppSelector((s) => s.auth.user)
  const adminName = authUser?.name ?? "ผู้ดูแลระบบ"
  const [isBulkDownloading, setIsBulkDownloading] = useState<"pdf" | "image" | null>(null)

  const renderInvoiceToCanvas = async (
    html2canvas: any,
    invoice: InvoiceResponse,
  ) => {
    const container = buildInvoiceContainer(invoice, adminName)
    document.body.appendChild(container)
    const images = container.querySelectorAll("img")
    await Promise.all(Array.from(images).map((img) =>
      new Promise<void>((res) => {
        if (img.complete) { res(); return }
        img.onload = () => res()
        img.onerror = () => res()
      })
    ))
    const canvas = await html2canvas(container, {
      scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff",
      scrollX: 0, scrollY: 0, width: container.scrollWidth, height: container.scrollHeight,
    })
    document.body.removeChild(container)
    return canvas
  }

  const handleBulkDownloadPDF = async () => {
    const readyBills = bills.filter((b) => b.billStatus === "READY")
    if (!propertyId || readyBills.length === 0) {
      toast("ไม่มีบิลที่มีสถานะพร้อมส่ง", "error"); return
    }
    setIsBulkDownloading("pdf")
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      let firstPage = true
      for (const bill of readyBills) {
        try {
          const invoice = await getInvoice(propertyId, bill.contractId, selectedMonth, selectedYear)
          const canvas = await renderInvoiceToCanvas(html2canvas, invoice)
          const ratio = canvas.height / canvas.width
          const imgH = pageW * ratio
          if (!firstPage) pdf.addPage()
          firstPage = false
          if (imgH <= pageH) {
            pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, pageW, imgH)
          } else {
            let yOffset = 0
            let firstSlice = true
            while (yOffset < canvas.height) {
              const sliceH = Math.min(canvas.height - yOffset, canvas.width * (pageH / pageW))
              const sliceCanvas = document.createElement("canvas")
              sliceCanvas.width = canvas.width
              sliceCanvas.height = sliceH
              sliceCanvas.getContext("2d")!.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
              if (!firstSlice) pdf.addPage()
              firstSlice = false
              pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, pageW, pageW * (sliceH / canvas.width))
              yOffset += sliceH
            }
          }
        } catch { /* skip failed invoices */ }
      }
      const roomList = readyBills.map((b) => `ห้อง${b.roomNumber}`).join(",")
      pdf.save(`ใบแจ้งหนี้-${roomList}-${THAI_MONTHS[selectedMonth - 1]}-${selectedYear + 543}.pdf`)
      toast("โหลด PDF ทั้งหมดสำเร็จ", "success")
    } catch (e) {
      console.error(e)
      toast("ไม่สามารถโหลด PDF ได้", "error")
    } finally {
      setIsBulkDownloading(null)
    }
  }

  const handleBulkDownloadImages = async () => {
    const readyBills = bills.filter((b) => b.billStatus === "READY")
    if (!propertyId || readyBills.length === 0) {
      toast("ไม่มีบิลที่มีสถานะพร้อมส่ง", "error"); return
    }
    setIsBulkDownloading("image")
    try {
      const { default: html2canvas } = await import("html2canvas")
      for (const bill of readyBills) {
        try {
          const invoice = await getInvoice(propertyId, bill.contractId, selectedMonth, selectedYear)
          const canvas = await renderInvoiceToCanvas(html2canvas, invoice)
          const link = document.createElement("a")
          link.download = `ใบแจ้งหนี้-ห้อง${bill.roomNumber}.png`
          link.href = canvas.toDataURL("image/png")
          link.click()
          await new Promise((res) => setTimeout(res, 300))
        } catch { /* skip failed invoices */ }
      }
      toast("โหลดรูปภาพทั้งหมดสำเร็จ", "success")
    } catch (e) {
      console.error(e)
      toast("ไม่สามารถโหลดรูปภาพได้", "error")
    } finally {
      setIsBulkDownloading(null)
    }
  }

  // ── Computed ──
  const monthOptions = availableMonths.map(({ month, year }) => ({
    value: `${month}-${year}`,
    label: `${THAI_MONTHS[month - 1]} ${year + 543}`,
  }))
  const selectedMonthValue = `${selectedMonth}-${selectedYear}`
  const handleMonthChange = (val: string) => {
    const [m, y] = val.split("-").map(Number)
    setSelectedMonth(m)
    setSelectedYear(y)
  }

  const [billPage, setBillPage] = useState(1)
  const [billRowsPerPage, setBillRowsPerPage] = useState(10)
  const [paymentPage, setPaymentPage] = useState(1)
  const [paymentRowsPerPage, setPaymentRowsPerPage] = useState(10)

  const filteredBills = bills.filter((b) => {
    const matchSearch = b.tenantName.includes(billSearch) || b.roomNumber.includes(billSearch)
    const matchStatus = billFilter === "ALL" || b.billStatus === billFilter
    return matchSearch && matchStatus
  })

  const filteredPayments = payments.filter((p) => {
    const matchSearch = p.tenantName.includes(paymentSearch) || p.roomNumber.includes(paymentSearch)
    const matchStatus = paymentFilter === "ALL" || p.status === paymentFilter
    return matchSearch && matchStatus
  })

  useEffect(() => { setBillPage(1) }, [billSearch, billFilter, selectedMonth, selectedYear])
  useEffect(() => { setPaymentPage(1) }, [paymentSearch, paymentFilter, selectedMonth, selectedYear])

  const pagedBills = filteredBills.slice((billPage - 1) * billRowsPerPage, billPage * billRowsPerPage)
  const pagedPayments = filteredPayments.slice((paymentPage - 1) * paymentRowsPerPage, paymentPage * paymentRowsPerPage)

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

        {/* Month dropdown */}
        <div className="mb-4">
          <div className="w-52">
            <SelectInput
              options={monthOptions}
              value={selectedMonthValue}
              onValueChange={handleMonthChange}
            />
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border border-gray-200 rounded-xl p-1 bg-gray-50 w-full sm:max-w-lg mb-4">
          <button
            onClick={() => setTab("BILLING")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium transition-colors ${
              tab === "BILLING" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <RiReceiptLine size={16} /> ออกบิล
          </button>
          <button
            onClick={() => setTab("PAYMENT")}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm rounded-lg font-medium transition-colors ${
              tab === "PAYMENT" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
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
                value={`${summary?.incomplete ?? "—"} บิล`}
                icon={RiAlarmWarningLine}
                colors="bg-red-50 border-red-200 text-red-700"
              />
              <SummaryCard
                title="ส่งแล้ว"
                value={`${summary?.sent ?? "—"} บิล`}
                icon={RiSendPlaneLine}
                colors="bg-blue-50 border-blue-200 text-blue-800"
              />
              <SummaryCard
                title="ข้อมูลครบแล้ว"
                value={`${summary?.meterPercent ?? "—"}%`}
                subtitle={summary ? `${summary.meterRecorded}/${summary.meterTotal}` : undefined}
                icon={RiPercentLine}
                colors="bg-purple-50 border-purple-200 text-purple-800"
              />
              <SummaryCard
                title="รายได้คาดการณ์"
                value={summary ? fmtCurrency(summary.estimatedRevenue) : "—"}
                icon={RiMoneyDollarCircleLine}
                colors="bg-green-50 border-green-200 text-green-800"
              />
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSendAll}
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
                >
                  <RiSendPlaneLine size={15} /> ยืนยันและส่งบิลทั้งหมด
                </button>
                <button
                  onClick={handleBulkDownloadPDF}
                  disabled={!!isBulkDownloading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  <RiFileTextLine size={15} />
                  {isBulkDownloading === "pdf" ? "กำลังสร้าง PDF..." : "โหลดบิลทั้งหมด PDF"}
                </button>
                <button
                  onClick={handleBulkDownloadImages}
                  disabled={!!isBulkDownloading}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition-colors whitespace-nowrap disabled:opacity-60"
                >
                  <RiImageLine size={15} />
                  {isBulkDownloading === "image" ? "กำลังสร้างรูปภาพ..." : "โหลดบิลทั้งหมดรูปภาพ"}
                </button>
              </div>
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
                    <SelectInput options={BILL_STATUS_FILTER} value={billFilter} onValueChange={setBillFilter} />
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
                    {isLoadingBills ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td>
                      </tr>
                    ) : filteredBills.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-sm text-gray-400 text-center">ไม่พบรายการ</td>
                      </tr>
                    ) : pagedBills.map((bill) => (
                      <tr key={bill.contractId} className="hover:bg-gray-50 transition-colors">

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
                          {bill.billingCycle.includes("เต็มเดือน") ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <RiCalendarLine size={11} />
                              {bill.billingCycle.replace("เต็มเดือน", THAI_MONTHS[selectedMonth - 1])}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-600 font-medium">
                              <RiCalendarLine size={11} />
                              {bill.billingCycle.replace(" (", ` ${THAI_MONTHS[selectedMonth - 1]} (`)}
                            </span>
                          )}
                        </td>

                        {/* มิเตอร์ก่อนหน้า */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="space-y-0.5 flex flex-col items-center">
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <RiDropLine size={11} className="text-blue-400 flex-shrink-0" />
                              <span className="font-medium">{bill.waterPrev?.toLocaleString() ?? "-"}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-700">
                              <RiFlashlightLine size={11} className="text-yellow-500 flex-shrink-0" />
                              <span className="font-medium">{bill.electricPrev?.toLocaleString() ?? "-"}</span>
                            </div>
                          </div>
                        </td>

                        {/* มิเตอร์ล่าสุด */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="space-y-0.5 flex flex-col items-center">
                            <div className="flex items-center gap-1 text-xs">
                              <RiDropLine size={11} className="text-blue-400 flex-shrink-0" />
                              {bill.waterCurrent != null
                                ? <span className="font-medium text-gray-700">{bill.waterCurrent.toLocaleString()}</span>
                                : <span className="text-gray-400">-</span>}
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <RiFlashlightLine size={11} className="text-yellow-500 flex-shrink-0" />
                              {bill.electricCurrent != null
                                ? <span className="font-medium text-gray-700">{bill.electricCurrent.toLocaleString()}</span>
                                : <span className="text-gray-400">-</span>}
                            </div>
                          </div>
                        </td>

                        {/* หน่วยที่ใช้ */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          <div className="space-y-0.5 flex flex-col items-center">
                            <div className="flex items-center gap-1 text-xs">
                              <RiDropLine size={11} className="text-blue-400 flex-shrink-0" />
                              <span className="font-medium text-gray-700">{bill.waterUsed ?? 0}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <RiFlashlightLine size={11} className="text-yellow-500 flex-shrink-0" />
                              <span className="font-medium text-gray-700">{bill.electricUsed ?? 0}</span>
                            </div>
                          </div>
                        </td>

                        {/* ค่าคงที่ */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          <button
                            onClick={() => setFixedFeesBill(bill)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="ดูรายละเอียดค่าบริการคงที่"
                          >
                            <RiInformationLine size={16} />
                          </button>
                        </td>

                        {/* ยอดรวม */}
                        <td className="px-3 py-3 text-left whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">{fmtCurrency(bill.total)}</span>
                        </td>

                        {/* สถานะ */}
                        <td className="px-3 py-3 text-center whitespace-nowrap">
                          {bill.contractStatus === "ENDED" || bill.contractStatus === "MOVE_OUT_NOTICE" ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-500 border-gray-200">
                              <RiLogoutBoxLine size={11} /> แจ้งออกแล้ว
                            </span>
                          ) : (
                            <BillStatusBadge status={bill.billStatus} />
                          )}
                        </td>

                        {/* จัดการ */}
                        <td className="px-3 py-3 whitespace-nowrap">
                          {bill.contractStatus === "ENDED" || bill.contractStatus === "MOVE_OUT_NOTICE" ? (
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => navigate(`/properties/${propertyId}/move-out`)}
                                title="ดูบิลแจ้งออก"
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap"
                              >
                                <RiLogoutBoxLine size={12} /> ดูบิลแจ้งออก
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <button onClick={() => setEditBill(bill)} title="แก้ไข"
                                className="text-gray-400 hover:text-gray-700 transition-colors">
                                <RiEditLine size={15} />
                              </button>
                              <button onClick={() => setDetailBill(bill)} title="ดูบิล"
                                className="flex items-center gap-1 px-2 py-1 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors whitespace-nowrap">
                                <RiFileTextLine size={12} /> ดูบิล
                              </button>
                              <button onClick={() => handleSendBill(bill)} title="ส่งบิล"
                                className="text-purple-400 hover:text-purple-700 transition-colors">
                                <RiSendPlaneLine size={15} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                total={filteredBills.length}
                page={billPage}
                rowsPerPage={billRowsPerPage}
                onPageChange={setBillPage}
                onRowsPerPageChange={(r) => { setBillRowsPerPage(r); setBillPage(1) }}
              />
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
                value={`${payments.filter((p) => p.status === "PENDING").length} บิล`}
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
                value={fmtCurrency(
                  payments.filter((p) => p.status === "CONFIRMED").reduce((s, p) => s + p.amount, 0)
                )}
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
                  <SelectInput options={PAYMENT_STATUS_FILTER} value={paymentFilter} onValueChange={setPaymentFilter} />
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
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoadingPayments ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td>
                      </tr>
                    ) : filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-sm text-gray-400 text-center">ไม่พบรายการ</td>
                      </tr>
                    ) : pagedPayments.map((pmt) => (
                      <tr key={pmt.paymentId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-800 whitespace-nowrap">{pmt.roomNumber}</td>
                        <td className="px-4 py-3.5 text-sm text-gray-700 whitespace-nowrap">{pmt.tenantName}</td>
                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-900 whitespace-nowrap">{fmtCurrency(pmt.amount)}</td>
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
                        <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{fmtDate(pmt.paidAt)}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap"><PaymentStatusBadge status={pmt.status} /></td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            {pmt.status === "PENDING" && (
                              <button
                                onClick={() => setUploadSlipBillId(pmt.paymentId)}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors"
                              >
                                <RiUpload2Line size={12} /> อัพโหลดสลิป
                              </button>
                            )}
                            {pmt.status === "VERIFYING" && (
                              <>
                                <button
                                  onClick={() => handleApprove(pmt)}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors"
                                >
                                  <RiCheckLine size={12} /> ยืนยัน
                                </button>
                                <button
                                  onClick={() => { setRejectId(pmt.paymentId); setSelectedPayment(null) }}
                                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <RiCloseFill size={12} /> ปฏิเสธ
                                </button>
                              </>
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
              <Pagination
                total={filteredPayments.length}
                page={paymentPage}
                rowsPerPage={paymentRowsPerPage}
                onPageChange={setPaymentPage}
                onRowsPerPageChange={(r) => { setPaymentRowsPerPage(r); setPaymentPage(1) }}
              />
            </div>
          </>
        )}
      </div>

      {/* ── Edit Bill Modal ── */}
      {editBill && propertyId && (
        <EditBillModal
          bill={editBill}
          propertyId={propertyId}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setEditBill(null)}
          onSaved={() => { loadBills(); setEditBill(null) }}
        />
      )}

      {/* ── Bill Detail Modal ── */}
      {detailBill && propertyId && (
        <BillDetailModal
          bill={detailBill}
          propertyId={propertyId}
          month={selectedMonth}
          year={selectedYear}
          onClose={() => setDetailBill(null)}
        />
      )}

      {/* ── Fixed Fees Modal ── */}
      {fixedFeesBill && propertyId && (
        <FixedFeeDetailModal
          bill={fixedFeesBill}
          propertyId={propertyId}
          onClose={() => setFixedFeesBill(null)}
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

      {/* ── Upload Slip Modal ── */}
      {uploadSlipBillId && propertyId && (
        <UploadSlipModal
          billId={uploadSlipBillId}
          propertyId={propertyId}
          onClose={() => setUploadSlipBillId(null)}
          onSuccess={() => { setUploadSlipBillId(null); loadPayments(); loadBills() }}
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
function EditBillModal({ bill, propertyId, month, year, onClose, onSaved }: {
  bill: BillingTableRow
  propertyId: string
  month: number
  year: number
  onClose: () => void
  onSaved: () => void
}) {
  const { toast } = useToast()
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [waterPrev, setWaterPrev] = useState("")
  const [electricPrev, setElectricPrev] = useState("")
  const [waterCurr, setWaterCurr] = useState("")
  const [electricCurr, setElectricCurr] = useState("")
  const [additionalFees, setAdditionalFees] = useState<{ title: string; amount: number }[]>([])

  useEffect(() => {
    getInvoice(propertyId, bill.contractId, month, year)
      .then((inv) => {
        setInvoice(inv)
        setWaterPrev(inv.meter.waterPrev > 0 ? String(inv.meter.waterPrev) : "")
        setElectricPrev(inv.meter.electricPrev > 0 ? String(inv.meter.electricPrev) : "")
        setWaterCurr(inv.meter.waterCurrent > 0 ? String(inv.meter.waterCurrent) : "")
        setElectricCurr(inv.meter.electricCurrent > 0 ? String(inv.meter.electricCurrent) : "")
      })
      .catch(() => toast("โหลดข้อมูลบิลไม่สำเร็จ", "error"))
      .finally(() => setIsLoading(false))
  }, [])

  const additionalTotal = additionalFees.reduce((s, f) => s + f.amount, 0)
  const estimatedTotal = (invoice?.total ?? 0) + additionalTotal

  const handleSave = () => {
    const wCurr = waterCurr !== "" ? Number(waterCurr) : null
    const eCurr = electricCurr !== "" ? Number(electricCurr) : null
    if (wCurr == null || eCurr == null) {
      toast("กรุณากรอกมิเตอร์น้ำและไฟให้ครบ", "error")
      return
    }
    setIsSaving(true)
    updateMeter(propertyId, bill.contractId, month, year, {
      waterMeter: wCurr,
      electricMeter: eCurr,
      waterPrev: waterPrev !== "" ? Number(waterPrev) : undefined,
      electricPrev: electricPrev !== "" ? Number(electricPrev) : undefined,
      additionalItems: additionalFees.length > 0 ? additionalFees : undefined,
    })
      .then(() => { toast(`บันทึกมิเตอร์ห้อง ${bill.roomNumber} สำเร็จ`, "success"); onSaved() })
      .catch(() => toast("บันทึกไม่สำเร็จ", "error"))
      .finally(() => setIsSaving(false))
  }

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title={`แก้ไขบิล — ห้อง ${bill.roomNumber}`}
      description={bill.tenantName}
      size="md"
    >
      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : (
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
                  placeholder="มิเตอร์เดือนก่อน"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">เดือนล่าสุด</label>
                <input type="number" value={waterCurr} onChange={(e) => setWaterCurr(e.target.value)}
                  placeholder="กรอกมิเตอร์ล่าสุด"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
              </div>
            </div>
            {waterCurr && waterPrev && (
              <p className="text-xs text-gray-500">
                หน่วยที่ใช้: <span className="font-semibold text-gray-700">
                  {Number(waterCurr) - Number(waterPrev)} หน่วย
                </span>
              </p>
            )}
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
                  placeholder="มิเตอร์เดือนก่อน"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">เดือนล่าสุด</label>
                <input type="number" value={electricCurr} onChange={(e) => setElectricCurr(e.target.value)}
                  placeholder="กรอกมิเตอร์ล่าสุด"
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg outline-none focus:border-yellow-400" />
              </div>
            </div>
            {electricCurr && electricPrev && (
              <p className="text-xs text-gray-500">
                หน่วยที่ใช้: <span className="font-semibold text-gray-700">
                  {Number(electricCurr) - Number(electricPrev)} หน่วย
                </span>
              </p>
            )}
          </div>

          {/* รายการค่าบริการ */}
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
                <div key={idx} className="flex items-center gap-2">
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
          {invoice && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm text-gray-600">
                  <span>{item.title}:</span>
                  <span>{fmtCurrency(item.amount)}</span>
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
                <span className="text-xl font-bold text-green-600">{fmtCurrency(estimatedTotal)}</span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button onClick={onClose}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button onClick={handleSave} disabled={isSaving}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50">
              {isSaving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Fixed Fee Detail Modal ────────────────────────────────────────────────
function FixedFeeDetailModal({ bill, propertyId, onClose }: {
  bill: BillingTableRow
  propertyId: string
  onClose: () => void
}) {
  const { toast } = useToast()
  const [data, setData] = useState<RoomFeesResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getRoomFees(propertyId, bill.contractId)
      .then(setData)
      .catch(() => toast("โหลดข้อมูลไม่สำเร็จ", "error"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Modal
      open
      onOpenChange={(o) => !o && onClose()}
      title="รายละเอียดค่าบริการคงที่"
      description={`ห้อง ${bill.roomNumber}`}
      size="sm"
    >
      {isLoading ? (
        <div className="py-8 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : !data || data.fees.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">ไม่มีค่าบริการคงที่</div>
      ) : (
        <div className="space-y-3">
          <div className="space-y-2">
            {data.fees.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-gray-600">
                <span>{item.title}:</span>
                <span>{fmtCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between text-sm font-bold text-gray-900">
            <span>รวมค่าบริการคงที่:</span>
            <span>{fmtCurrency(data.total)}</span>
          </div>
          <div className="flex justify-end pt-1">
            <button onClick={onClose}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              ปิด
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Bill Detail Modal ──────────────────────────────────────────────────────
// ── Invoice helpers ────────────────────────────────────────────────────────
function getItemRow(item: { title: string; amount: number }, meter: InvoiceResponse["meter"]) {
  const t = item.title
  if (t.startsWith("ค่าน้ำ")) {
    const qty = meter.waterUsed
    const rate = qty > 0 ? item.amount / qty : 0
    return { label: "ค่าน้ำประปา", qty, rate, subtitle: `${meter.waterPrev} → ${meter.waterCurrent} = ใช้ไป ${qty} หน่วย` }
  }
  if (t.startsWith("ค่าไฟ")) {
    const qty = meter.electricUsed
    const rate = qty > 0 ? item.amount / qty : 0
    return { label: "ค่าไฟฟ้า", qty, rate, subtitle: `${meter.electricPrev} → ${meter.electricCurrent} = ใช้ไป ${qty} หน่วย` }
  }
  return { label: t, qty: 1, rate: item.amount, subtitle: null }
}

function buildInvoiceContainer(invoice: InvoiceResponse, adminName: string): HTMLDivElement {
  const today = new Date().toLocaleDateString("th-TH-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" })
  const rows = invoice.items.map((item) => getItemRow(item, invoice.meter))

  const container = document.createElement("div")
  Object.assign(container.style, {
    position: "fixed", left: "-9999px", top: "0",
    width: "794px", backgroundColor: "#ffffff",
    fontFamily: "'Sarabun', 'Noto Sans Thai', sans-serif",
    fontSize: "14px", color: "#111827", padding: "40px",
    boxSizing: "border-box",
  })

  // Header
  const header = document.createElement("div")
  Object.assign(header.style, { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" })

  const headerLeft = document.createElement("div")
  Object.assign(headerLeft.style, { display: "flex", alignItems: "flex-start", gap: "12px" })
  if (invoice.property.logoUrl) {
    const logo = document.createElement("img")
    logo.src = invoice.property.logoUrl
    Object.assign(logo.style, { width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", flexShrink: "0" })
    logo.crossOrigin = "anonymous"
    headerLeft.appendChild(logo)
  }
  const propInfo = document.createElement("div")
  const propName = document.createElement("p")
  propName.textContent = invoice.property.name
  Object.assign(propName.style, { margin: "0", fontWeight: "700", fontSize: "16px", color: "#111827" })
  const propAddr = document.createElement("p")
  propAddr.textContent = invoice.property.address || ""
  Object.assign(propAddr.style, { margin: "4px 0 0", fontSize: "12px", color: "#6b7280", lineHeight: "1.5", maxWidth: "280px" })
  propInfo.appendChild(propName)
  propInfo.appendChild(propAddr)
  headerLeft.appendChild(propInfo)

  const headerRight = document.createElement("div")
  Object.assign(headerRight.style, { textAlign: "right" })
  const badge = document.createElement("div")
  badge.textContent = "ใบแจ้งค่าบริการ"
  Object.assign(badge.style, {
    display: "block",
    backgroundColor: "#7c3aed", color: "#ffffff",
    padding: "0 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
    whiteSpace: "nowrap", lineHeight: "36px", height: "36px",
    textAlign: "center",
  })
  const dateEl = document.createElement("p")
  dateEl.textContent = today
  Object.assign(dateEl.style, { margin: "6px 0 0", fontSize: "12px", color: "#9ca3af" })
  headerRight.appendChild(badge)
  headerRight.appendChild(dateEl)

  header.appendChild(headerLeft)
  header.appendChild(headerRight)
  container.appendChild(header)

  // Info cards
  const infoGrid = document.createElement("div")
  Object.assign(infoGrid.style, { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "8px", marginBottom: "20px" })
  const infoItems = [
    ["ห้องพัก", `ห้อง ${invoice.roomNumber}`],
    ["ประเภทห้อง", invoice.roomType],
    ["ผู้เช่า", invoice.tenantName],
    ["งวดประจำเดือน", invoice.billingPeriod],
  ]
  infoItems.forEach(([label, val]) => {
    const card = document.createElement("div")
    Object.assign(card.style, { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px" })
    const lEl = document.createElement("p")
    lEl.textContent = label
    Object.assign(lEl.style, { margin: "0 0 4px", fontSize: "11px", color: "#9ca3af" })
    const vEl = document.createElement("p")
    vEl.textContent = val
    Object.assign(vEl.style, { margin: "0", fontSize: "13px", fontWeight: "700", color: "#111827" })
    card.appendChild(lEl)
    card.appendChild(vEl)
    infoGrid.appendChild(card)
  })
  container.appendChild(infoGrid)

  // Table
  const table = document.createElement("table")
  Object.assign(table.style, { width: "100%", borderCollapse: "collapse" })
  const thead = document.createElement("thead")
  const headerRow = document.createElement("tr")
  Object.assign(headerRow.style, { backgroundColor: "#111827" })
  const cols = ["ลำดับ", "รายการ", "จำนวน", "ราคา/หน่วย", "รวมเป็นเงิน"]
  const aligns = ["center", "left", "center", "right", "right"]
  cols.forEach((col, i) => {
    const th = document.createElement("th")
    th.textContent = col
    Object.assign(th.style, {
      padding: "10px 12px", fontSize: "12px", fontWeight: "600",
      color: "#ffffff", textAlign: aligns[i],
    })
    headerRow.appendChild(th)
  })
  thead.appendChild(headerRow)
  table.appendChild(thead)

  const tbody = document.createElement("tbody")
  rows.forEach((r, idx) => {
    const tr = document.createElement("tr")
    Object.assign(tr.style, { borderBottom: "1px solid #f3f4f6" })
    const cells = [
      { text: String(idx + 1), align: "center", color: "#6b7280" },
      { text: "", align: "left", color: "#1f2937" },
      { text: r.qty.toLocaleString(), align: "center", color: "#374151" },
      { text: r.rate.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), align: "right", color: "#374151" },
      { text: invoice.items[idx].amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), align: "right", color: "#1f2937", bold: true },
    ]
    cells.forEach((c, ci) => {
      const td = document.createElement("td")
      Object.assign(td.style, {
        padding: "10px 12px", textAlign: c.align, color: c.color,
        fontWeight: c.bold ? "600" : "400",
      })
      if (ci === 1) {
        const labelEl = document.createElement("p")
        labelEl.textContent = r.label
        Object.assign(labelEl.style, { margin: "0", color: "#1f2937" })
        td.appendChild(labelEl)
        if (r.subtitle) {
          const sub = document.createElement("span")
          sub.textContent = r.subtitle
          Object.assign(sub.style, {
            display: "inline-block", marginTop: "3px", fontSize: "11px",
            color: "#2563eb", backgroundColor: "#eff6ff",
            padding: "2px 8px", borderRadius: "4px",
          })
          td.appendChild(sub)
        }
      } else {
        td.textContent = c.text
      }
      tr.appendChild(td)
    })
    tbody.appendChild(tr)
  })
  table.appendChild(tbody)
  container.appendChild(table)

  // Total
  const totalBar = document.createElement("div")
  Object.assign(totalBar.style, {
    backgroundColor: "#fefce8", border: "1px solid #e5e7eb", borderTop: "none",
    borderRadius: "0 0 8px 8px", padding: "12px 16px",
    display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px",
  })
  const totalLabel = document.createElement("span")
  totalLabel.textContent = "รวมสุทธิ"
  Object.assign(totalLabel.style, { fontSize: "14px", fontWeight: "600", color: "#374151" })
  const totalVal = document.createElement("span")
  totalVal.textContent = invoice.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })
  Object.assign(totalVal.style, { fontSize: "24px", fontWeight: "700", color: "#d97706" })
  totalBar.appendChild(totalLabel)
  totalBar.appendChild(totalVal)
  container.appendChild(totalBar)

  // Payment info
  const paySection = document.createElement("div")
  Object.assign(paySection.style, {
    marginTop: "20px", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px",
    display: "grid", gridTemplateColumns: "1fr auto", gap: "16px",
  })
  const payLeft = document.createElement("div")
  const payTitle = document.createElement("p")
  payTitle.textContent = "● ช่องทางการชำระเงิน"
  Object.assign(payTitle.style, { margin: "0 0 12px", fontSize: "12px", fontWeight: "600", color: "#7c3aed" })
  payLeft.appendChild(payTitle)
  const payFields = [["ธนาคาร", invoice.property.bankName], ["เลขที่บัญชี", invoice.property.bankAccount], ["ชื่อบัญชี", invoice.property.bankHolder]]
  payFields.filter(([, v]) => v).forEach(([k, v]) => {
    const row = document.createElement("div")
    Object.assign(row.style, { display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0", borderBottom: "1px solid #f3f4f6" })
    const kEl = document.createElement("span")
    kEl.textContent = k
    Object.assign(kEl.style, { color: "#6b7280" })
    const vEl = document.createElement("span")
    vEl.textContent = v || ""
    Object.assign(vEl.style, { fontWeight: "500", color: "#111827" })
    row.appendChild(kEl)
    row.appendChild(vEl)
    payLeft.appendChild(row)
  })
  paySection.appendChild(payLeft)
  if (invoice.property.paymentQrUrl) {
    const qrWrap = document.createElement("div")
    Object.assign(qrWrap.style, { display: "flex", flexDirection: "column", alignItems: "center" })
    const qr = document.createElement("img")
    qr.src = invoice.property.paymentQrUrl
    qr.crossOrigin = "anonymous"
    Object.assign(qr.style, { width: "96px", height: "96px", objectFit: "contain", borderRadius: "8px", border: "1px solid #f3f4f6" })
    const qrLabel = document.createElement("p")
    qrLabel.textContent = "สแกนเพื่อชำระเงิน"
    Object.assign(qrLabel.style, { margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" })
    qrWrap.appendChild(qr)
    qrWrap.appendChild(qrLabel)
    paySection.appendChild(qrWrap)
  }
  container.appendChild(paySection)

  // Notes
  const noteSection = document.createElement("div")
  Object.assign(noteSection.style, { marginTop: "16px", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px" })
  const noteTitle = document.createElement("p")
  noteTitle.textContent = "● หมายเหตุ"
  Object.assign(noteTitle.style, { margin: "0 0 8px", fontSize: "12px", fontWeight: "600", color: "#7c3aed" })
  noteSection.appendChild(noteTitle)
  const noteList = document.createElement("div")
  Object.assign(noteList.style, { margin: "0", fontSize: "12px", color: "#4b5563", lineHeight: "1.8" })
  const notes = invoice.property.billNote
    ? invoice.property.billNote.split("\n").map(l => l.trim()).filter(Boolean)
    : []
  notes.forEach((n) => {
    const p = document.createElement("p")
    Object.assign(p.style, { margin: "0 0 2px" })
    p.textContent = n
    noteList.appendChild(p)
  })
  noteSection.appendChild(noteList)
  const issuerEl = document.createElement("p")
  issuerEl.textContent = `ผู้จัดทำ: ${adminName}`
  Object.assign(issuerEl.style, { margin: "8px 0 0", fontSize: "11px", color: "#9ca3af", textAlign: "right" })
  noteSection.appendChild(issuerEl)
  container.appendChild(noteSection)

  return container
}

function BillDetailModal({ bill, propertyId, month, year, onClose }: {
  bill: BillingTableRow
  propertyId: string
  month: number
  year: number
  onClose: () => void
}) {
  const { toast } = useToast()
  const authUser = useAppSelector((s) => s.auth.user)
  const adminName = authUser?.name ?? "ผู้ดูแลระบบ"
  const [invoice, setInvoice] = useState<InvoiceResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSavingImage, setIsSavingImage] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getInvoice(propertyId, bill.contractId, month, year)
      .then(setInvoice)
      .catch(() => toast("โหลดข้อมูลไม่สำเร็จ", "error"))
      .finally(() => setIsLoading(false))
  }, [])

  const handleSaveImage = async () => {
    if (!previewRef.current) return
    setIsSavingImage(true)
    try {
      const { default: html2canvas } = await import("html2canvas")
      const canvas = await html2canvas(previewRef.current, {
        scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff",
      })
      const link = document.createElement("a")
      link.download = `ใบแจ้งหนี้-ห้อง${bill.roomNumber}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (e) {
      console.error(e)
      toast("ไม่สามารถบันทึกภาพได้", "error")
    } finally {
      setIsSavingImage(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoice) return
    setIsDownloading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])

      const container = buildInvoiceContainer(invoice, adminName)
      document.body.appendChild(container)

      // Wait for images to load
      const images = container.querySelectorAll("img")
      await Promise.all(Array.from(images).map((img) =>
        new Promise<void>((res) => {
          if (img.complete) { res(); return }
          img.onload = () => res()
          img.onerror = () => res()
        })
      ))

      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        scrollX: 0,
        scrollY: 0,
        width: container.scrollWidth,
        height: container.scrollHeight,
      })

      document.body.removeChild(container)

      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })
      const pageW = pdf.internal.pageSize.getWidth()
      const pageH = pdf.internal.pageSize.getHeight()
      const ratio = canvas.height / canvas.width
      const imgH = pageW * ratio
      if (imgH <= pageH) {
        pdf.addImage(imgData, "PNG", 0, 0, pageW, imgH)
      } else {
        let yOffset = 0
        while (yOffset < canvas.height) {
          const sliceH = Math.min(canvas.height - yOffset, canvas.width * (pageH / pageW))
          const sliceCanvas = document.createElement("canvas")
          sliceCanvas.width = canvas.width
          sliceCanvas.height = sliceH
          sliceCanvas.getContext("2d")!.drawImage(canvas, 0, yOffset, canvas.width, sliceH, 0, 0, canvas.width, sliceH)
          if (yOffset > 0) pdf.addPage()
          pdf.addImage(sliceCanvas.toDataURL("image/png"), "PNG", 0, 0, pageW, pageW * (sliceH / canvas.width))
          yOffset += sliceH
        }
      }
      pdf.save(`ใบแจ้งหนี้-ห้อง${bill.roomNumber}.pdf`)
    } catch (e) {
      console.error(e)
      toast("ไม่สามารถโหลด PDF ได้", "error")
    } finally {
      setIsDownloading(false)
    }
  }

  const today = new Date().toLocaleDateString("th-TH-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" })

  return (
    <Modal open onOpenChange={(o) => !o && onClose()}
      title={`ใบแจ้งหนี้ — ห้อง ${bill.roomNumber}`}
      description={bill.tenantName}
      size="2xl"
    >
      {isLoading ? (
        <div className="py-10 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : !invoice ? null : (
        <div className="flex flex-col max-h-[80vh]">
          {/* Scrollable A4 preview */}
          <div className="overflow-y-auto flex-1 pb-2">
            <div ref={previewRef} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm w-[760px] mx-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-3">
                  {invoice.property.logoUrl && (
                    <img src={invoice.property.logoUrl} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" alt="logo" />
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-base">{invoice.property.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-xs leading-relaxed">{invoice.property.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap">ใบแจ้งค่าบริการ</div>
                  <p className="text-xs text-gray-400 mt-1.5">{today}</p>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  ["ห้องพัก", `ห้อง ${bill.roomNumber}`],
                  ["ประเภทห้อง", invoice.roomType],
                  ["ผู้เช่า", bill.tenantName],
                  ["งวดประจำเดือน", invoice.billingPeriod],
                ].map(([label, val]) => (
                  <div key={label} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{val}</p>
                  </div>
                ))}
              </div>

              {/* Items table */}
              <table className="w-full text-sm border-collapse mb-0">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    {["ลำดับ", "รายการ", "จำนวน", "ราคา/หน่วย", "รวมเป็นเงิน"].map((h, i) => (
                      <th key={h} className={`px-3 py-2.5 text-xs font-semibold ${i === 0 || i === 2 ? "text-center" : i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {invoice.items.map((item, idx) => {
                    const r = getItemRow(item, invoice.meter)
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-center text-gray-500">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-gray-800">{r.label}</p>
                          {r.subtitle && (
                            <span className="text-xs text-blue-600 mt-0.5 bg-blue-50 px-2 py-0.5 rounded block w-fit">{r.subtitle}</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{r.qty.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700">{r.rate.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-gray-800">{item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="bg-yellow-50 border border-t-0 border-gray-200 rounded-b-lg px-4 py-3 flex justify-end items-center gap-4">
                <span className="text-sm font-semibold text-gray-700">รวมสุทธิ</span>
                <span className="text-2xl font-bold text-amber-600">{invoice.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Payment info */}
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-4 border border-gray-200 rounded-xl p-4">
                <div>
                  <p className="text-xs font-semibold text-purple-600 mb-3">● ช่องทางการชำระเงิน</p>
                  {[["ธนาคาร", invoice.property.bankName], ["เลขที่บัญชี", invoice.property.bankAccount], ["ชื่อบัญชี", invoice.property.bankHolder]]
                    .filter(([, v]) => v)
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                        <span className="text-gray-500">{k}</span>
                        <span className="font-medium text-gray-800">{v}</span>
                      </div>
                    ))}
                </div>
                {invoice.property.paymentQrUrl && (
                  <div className="flex flex-col items-center">
                    <img src={invoice.property.paymentQrUrl} className="w-24 h-24 object-contain rounded-lg border border-gray-100" alt="QR" />
                    <p className="text-xs text-gray-400 mt-1">สแกนเพื่อชำระเงิน</p>
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="mt-4 border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-600 mb-2">● หมายเหตุ</p>
                <div className="text-xs text-gray-600 space-y-1 leading-relaxed">
                  {invoice.property.billNote
                    ? invoice.property.billNote.split("\n").map(l => l.trim()).filter(Boolean).map((line, i) => (
                        <p key={i}>{line}</p>
                      ))
                    : null}
                </div>
                <p className="text-xs text-gray-400 text-right mt-3">ผู้จัดทำ: {adminName}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
            <button onClick={onClose}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              ปิด
            </button>
            <button onClick={handleSaveImage} disabled={isSavingImage || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 border border-purple-600 text-purple-600 text-sm rounded-xl hover:bg-purple-50 transition-colors disabled:opacity-60">
              <RiImageLine size={16} /> {isSavingImage ? "กำลังบันทึก..." : "บันทึกเป็นภาพ"}
            </button>
            <button onClick={handleDownloadPDF} disabled={isDownloading || isLoading}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60">
              <RiFileTextLine size={16} /> {isDownloading ? "กำลังสร้าง PDF..." : "โหลด PDF"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Payment Detail Modal ───────────────────────────────────────────────────
function PaymentDetailModal({ payment, onClose, onApprove, onReject }: {
  payment: PaymentListItem
  onClose: () => void
  onApprove: (p: PaymentListItem) => void
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
            <p className="text-sm text-gray-700">{fmtDate(payment.paidAt)}</p>
          </div>
        </div>

        {payment.slipUrl && (
          <div>
            <p className="text-xs text-gray-500 font-medium mb-2">หลักฐานการชำระเงิน</p>
            <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <img src={payment.slipUrl} alt="slip" className="w-full object-cover max-h-52" />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-1 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            <RiCloseLine size={14} className="inline mr-1" />ปิด
          </button>
          {payment.status === "VERIFYING" && (
            <>
              <button
                onClick={() => onReject(payment.paymentId)}
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
