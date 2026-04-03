import { useState, useEffect, useCallback, useRef } from "react"
import { useParams } from "react-router-dom"
import {
  RiCalendarLine, RiUser3Line, RiPhoneLine, RiFileTextLine,
  RiCheckboxCircleLine, RiAddLine, RiEyeLine,
} from "react-icons/ri"
import { SelectInput } from "../../components/shared/SelectInput"
import { Modal } from "../../components/shared/Modal"
import { FormInput } from "../../components/shared/FormInput"
import { SummaryRow } from "../../components/shared/SummaryRow"
import { AddItemSection } from "../../components/shared/AddItemSection"
import { useToast } from "../../components/shared/Toast"
import {
  getMoveOutList,
  previewMoveOutBill,
  createMoveOutBill,
  getMoveOutBillDetail,
} from "../../api/moveout/moveoutApi"
import type {
  MoveOutPendingItem,
  MoveOutCompletedItem,
  MoveOutBillInput,
  MoveOutPreviewResponse,
  MoveOutBillDetail,
} from "../../types/moveout.types"

// ── Bill form state ────────────────────────────────────────────────────────
interface BillForm {
  moveOutDate: string
  billingStartDay: string
  billingEndDay: string
  waterStart: string
  waterEnd: string
  electricStart: string
  electricEnd: string
  damageItems: { title: string; amount: number }[]
  additionalItems: { title: string; amount: number }[]
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function MoveOutListPage() {
  const { propertyId } = useParams<{ propertyId: string }>()

  const [pending, setPending] = useState<MoveOutPendingItem[]>([])
  const [completed, setCompleted] = useState<MoveOutCompletedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [billModal, setBillModal] = useState(false)
  const [initialContractId, setInitialContractId] = useState<string | undefined>()
  const [modalKey, setModalKey] = useState(0)
  const [viewBillId, setViewBillId] = useState<string | null>(null)
  const [yearFilter, setYearFilter] = useState<string>(String(new Date().getFullYear()))

  const openBillModal = (contractId?: string) => {
    setInitialContractId(contractId)
    setModalKey((k) => k + 1)
    setBillModal(true)
  }

  const load = useCallback(() => {
    if (!propertyId) return
    setIsLoading(true)
    getMoveOutList(propertyId)
      .then((res) => { setPending(res.pending); setCompleted(res.completed) })
      .finally(() => setIsLoading(false))
  }, [propertyId])

  useEffect(() => { load() }, [load])

  return (
    <div className="bg-purple-50 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">บิลแจ้งออก</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการบิลสำหรับผู้เช่าที่แจ้งออก คำนวณการคืนเงินมัดจำ และหักค่าเสียหาย</p>
        </div>

        {/* Info Banner */}
        <div className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 mb-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-blue-600 text-xs font-bold leading-none">i</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">ขั้นตอนการแจ้งออก</p>
            <p className="text-sm text-gray-500 mt-0.5">
              บันทึกค่ามิเตอร์และค่าเสียหาย (ถ้ามี) กดคำนวณเพื่อดูยอดเงินคืน แล้วยืนยันเพื่อสร้างบิล
            </p>
          </div>
        </div>

        {/* Create button */}
        <button
          onClick={() => openBillModal()}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors mb-6"
        >
          <RiAddLine size={16} /> สร้างบิลแจ้งออก
        </button>

        {/* Pending list */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-700">
              รายการรอสร้างบิล ({isLoading ? "..." : pending.length})
            </p>
          </div>
          <div className="p-4 space-y-3">
            {isLoading ? (
              <p className="text-sm text-gray-400 text-center py-6">กำลังโหลด...</p>
            ) : pending.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">ไม่มีรายการรอดำเนินการ</p>
            ) : pending.map((t) => (
              <div key={t.contractId}
                className="flex items-center justify-between border border-gray-200 rounded-xl px-5 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <RiUser3Line className="text-purple-600" size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{t.firstName} {t.lastName}</p>
                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full font-medium">แจ้งออกแล้ว</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-gray-500">
                      <span>ห้อง {t.roomNumber}</span>
                      <span>•</span>
                      <span>{t.roomType}</span>
                      {t.phone && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <RiPhoneLine size={11} /> {t.phone}
                          </span>
                        </>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <RiCalendarLine size={11} />
                        ย้ายออก: {new Date(t.moveOutDate).toLocaleDateString("th-TH-u-ca-gregory")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openBillModal(t.contractId)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors">
                  <RiFileTextLine size={13} /> สร้างบิลแจ้งออก
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Completed list */}
        {completed.length > 0 && (() => {
          const currentYear = new Date().getFullYear()
          const availableYears = [...new Set([currentYear, ...completed.map((c) => new Date(c.moveOutDate).getFullYear())])]
            .sort((a, b) => b - a)
          const yearOptions = availableYears.map((y) => ({ value: String(y), label: String(y) }))
          const filtered = completed.filter(
            (c) => String(new Date(c.moveOutDate).getFullYear()) === yearFilter
          )
          return (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <p className="text-base font-semibold text-gray-700">บิลที่สร้างแล้ว ({filtered.length})</p>
                <div className="w-32">
                  <SelectInput
                    label=""
                    options={yearOptions}
                    value={yearFilter}
                    onValueChange={setYearFilter}
                    placeholder="เลือกปี"
                  />
                </div>
              </div>
              <div className="overflow-x-auto mx-6 mb-5 mt-4 rounded-xl border border-gray-200">
                <table className="w-full min-w-[500px]">
                  <thead className="border-b border-gray-200 bg-gray-50/50">
                    <tr>
                      {["ผู้เช่า", "ห้อง", "วันที่ย้ายออก", "เงินคืน", "จัดการ"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-6 text-sm text-gray-400 text-center">ไม่มีรายการในปีนี้</td></tr>
                    ) : filtered.map((c) => (
                      <tr key={c.moveOutBillId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{c.firstName} {c.lastName}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{c.roomNumber}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {new Date(c.moveOutDate).toLocaleDateString("th-TH-u-ca-gregory")}
                        </td>
                        <td className={`px-5 py-3.5 text-sm font-semibold ${c.refundAmount >= 0 ? "text-green-600" : "text-red-500"}`}>
                          ฿{c.refundAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            onClick={() => setViewBillId(c.moveOutBillId)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                          >
                            <RiEyeLine size={13} /> ดูบิล
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Bill modal — key forces remount every open to avoid stale state */}
      <MoveOutBillModal
        key={modalKey}
        open={billModal}
        onClose={() => setBillModal(false)}
        onSuccess={() => { setBillModal(false); window.location.reload() }}
        propertyId={propertyId!}
        pending={pending}
        initialContractId={initialContractId}
      />

      {/* Bill detail modal */}
      {viewBillId && (
        <MoveOutBillDetailModal
          open={!!viewBillId}
          onClose={() => setViewBillId(null)}
          propertyId={propertyId!}
          moveOutBillId={viewBillId}
        />
      )}
    </div>
  )
}

// ── Move Out Bill Detail Modal ────────────────────────────────────────────
function MoveOutBillDetailModal({ open, onClose, propertyId, moveOutBillId }: {
  open: boolean
  onClose: () => void
  propertyId: string
  moveOutBillId: string
}) {
  const { toast } = useToast()
  const [detail, setDetail] = useState<MoveOutBillDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    getMoveOutBillDetail(propertyId, moveOutBillId)
      .then(setDetail)
      .finally(() => setIsLoading(false))
  }, [open, propertyId, moveOutBillId])

  const handleDownloadPDF = async () => {
    if (!detail) return
    setIsDownloading(true)
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ])

      const today = new Date().toLocaleDateString("th-TH-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" })
      const moveOutDateFmt = new Date(detail.tenant.moveOutDate).toLocaleDateString("th-TH-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" })

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
      if (detail.property.logoUrl) {
        const logo = document.createElement("img")
        logo.src = detail.property.logoUrl
        logo.crossOrigin = "anonymous"
        Object.assign(logo.style, { width: "56px", height: "56px", objectFit: "cover", borderRadius: "8px", flexShrink: "0" })
        headerLeft.appendChild(logo)
      }
      const propInfo = document.createElement("div")
      const propName = document.createElement("p")
      propName.textContent = detail.property.name
      Object.assign(propName.style, { margin: "0", fontWeight: "700", fontSize: "16px" })
      const propAddr = document.createElement("p")
      propAddr.textContent = detail.property.address || ""
      Object.assign(propAddr.style, { margin: "4px 0 0", fontSize: "12px", color: "#6b7280", lineHeight: "1.5", maxWidth: "280px" })
      propInfo.appendChild(propName)
      propInfo.appendChild(propAddr)
      headerLeft.appendChild(propInfo)

      const headerRight = document.createElement("div")
      Object.assign(headerRight.style, { textAlign: "right" })
      const badge = document.createElement("div")
      badge.textContent = "ใบคืนเงินมัดจำ"
      Object.assign(badge.style, {
        display: "block", backgroundColor: "#7c3aed", color: "#ffffff",
        padding: "0 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "700",
        whiteSpace: "nowrap", lineHeight: "36px", height: "36px", textAlign: "center",
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
        ["ห้องพัก", `ห้อง ${detail.tenant.roomNumber}`],
        ["ประเภทห้อง", detail.tenant.roomType],
        ["ผู้เช่า", `${detail.tenant.firstName} ${detail.tenant.lastName}`],
        ["วันที่ย้ายออก", moveOutDateFmt],
      ]
      infoItems.forEach(([label, val]) => {
        const card = document.createElement("div")
        Object.assign(card.style, { border: "1px solid #e5e7eb", borderRadius: "8px", padding: "12px" })
        const lEl = document.createElement("p")
        lEl.textContent = label
        Object.assign(lEl.style, { margin: "0 0 4px", fontSize: "11px", color: "#9ca3af" })
        const vEl = document.createElement("p")
        vEl.textContent = val
        Object.assign(vEl.style, { margin: "0", fontSize: "13px", fontWeight: "700" })
        card.appendChild(lEl)
        card.appendChild(vEl)
        infoGrid.appendChild(card)
      })
      container.appendChild(infoGrid)

      // Final bill table
      const sectionTitle = (text: string) => {
        const p = document.createElement("p")
        p.textContent = text
        Object.assign(p.style, { margin: "0 0 8px", fontSize: "13px", fontWeight: "600", color: "#374151" })
        return p
      }

      container.appendChild(sectionTitle("บิลเดือนล่าสุด"))
      const table = document.createElement("table")
      Object.assign(table.style, { width: "100%", borderCollapse: "collapse", marginBottom: "0" })
      const thead = document.createElement("thead")
      const headerRow = document.createElement("tr")
      Object.assign(headerRow.style, { backgroundColor: "#111827" })
      const cols = ["ลำดับ", "รายการ", "จำนวน", "ราคา/หน่วย", "รวมเป็นเงิน"]
      const aligns = ["center", "left", "center", "right", "right"]
      cols.forEach((col, i) => {
        const th = document.createElement("th")
        th.textContent = col
        Object.assign(th.style, { padding: "10px 12px", fontSize: "12px", fontWeight: "600", color: "#ffffff", textAlign: aligns[i] })
        headerRow.appendChild(th)
      })
      thead.appendChild(headerRow)
      table.appendChild(thead)

      const tbody = document.createElement("tbody")
      detail.finalBill.items.forEach((item, idx) => {
        const isWater = item.title.startsWith("ค่าน้ำ")
        const isElec = item.title.startsWith("ค่าไฟ")
        let label = item.title
        let subtitle: string | null = null
        let qty = 1
        let rate = item.amount
        if (isWater) {
          label = "ค่าน้ำประปา"
          qty = detail.meter.waterUsed
          rate = qty > 0 ? item.amount / qty : 0
          subtitle = `${detail.meter.waterStart} → ${detail.meter.waterEnd} = ใช้ไป ${qty} หน่วย`
        } else if (isElec) {
          label = "ค่าไฟฟ้า"
          qty = detail.meter.electricUsed
          rate = qty > 0 ? item.amount / qty : 0
          subtitle = `${detail.meter.electricStart} → ${detail.meter.electricEnd} = ใช้ไป ${qty} หน่วย`
        }
        const tr = document.createElement("tr")
        Object.assign(tr.style, { borderBottom: "1px solid #f3f4f6" })
        const cells = [
          { text: String(idx + 1), align: "center", color: "#6b7280" },
          { text: "", align: "left", color: "#1f2937" },
          { text: qty.toLocaleString(), align: "center", color: "#374151" },
          { text: rate.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), align: "right", color: "#374151" },
          { text: item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), align: "right", color: "#1f2937", bold: true },
        ]
        cells.forEach((c, ci) => {
          const td = document.createElement("td")
          Object.assign(td.style, { padding: "10px 12px", textAlign: c.align, color: c.color, fontWeight: c.bold ? "600" : "400" })
          if (ci === 1) {
            const lEl = document.createElement("p")
            lEl.textContent = label
            Object.assign(lEl.style, { margin: "0" })
            td.appendChild(lEl)
            if (subtitle) {
              const sub = document.createElement("span")
              sub.textContent = subtitle
              Object.assign(sub.style, { display: "inline-block", marginTop: "3px", fontSize: "11px", color: "#2563eb", backgroundColor: "#eff6ff", padding: "2px 8px", borderRadius: "4px" })
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

      // Total bill
      const totalBar = document.createElement("div")
      Object.assign(totalBar.style, { backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 8px 8px", padding: "10px 16px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "16px", marginBottom: "20px" })
      const tLabel = document.createElement("span")
      tLabel.textContent = "รวมบิลล่าสุด"
      Object.assign(tLabel.style, { fontSize: "13px", fontWeight: "600", color: "#374151" })
      const tVal = document.createElement("span")
      tVal.textContent = `฿${detail.finalBill.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
      Object.assign(tVal.style, { fontSize: "18px", fontWeight: "700", color: "#1d4ed8" })
      totalBar.appendChild(tLabel)
      totalBar.appendChild(tVal)
      container.appendChild(totalBar)

      // Summary
      container.appendChild(sectionTitle("สรุปยอดเงินคืน"))
      const summaryBox = document.createElement("div")
      Object.assign(summaryBox.style, { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", marginBottom: "20px" })

      const summaryRows: { label: string; value: string; color: string; bold?: boolean; big?: boolean }[] = [
        { label: "เงินประกัน + ค่าเช่าล่วงหน้า", value: `+฿${detail.summary.securityDeposit.toLocaleString()}`, color: "#16a34a" },
        { label: "หักบิลเดือนล่าสุด", value: `-฿${Math.abs(detail.summary.deductFinalBill).toLocaleString()}`, color: "#ef4444" },
        ...detail.damage.items.map((item) => ({
          label: `หักค่าเสียหาย${item.title ? ` — ${item.title}` : ""}`,
          value: `-฿${item.amount.toLocaleString()}`,
          color: "#ef4444",
        })),
        ...detail.additional.items.map((item) => ({
          label: `หักค่าใช้จ่ายเพิ่มเติม${item.title ? ` — ${item.title}` : ""}`,
          value: `-฿${item.amount.toLocaleString()}`,
          color: "#ef4444",
        })),
      ]
      summaryRows.forEach((row) => {
        const div = document.createElement("div")
        Object.assign(div.style, { display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: "1px solid #f3f4f6", fontSize: "13px" })
        const k = document.createElement("span")
        k.textContent = row.label
        Object.assign(k.style, { color: "#4b5563" })
        const v = document.createElement("span")
        v.textContent = row.value
        Object.assign(v.style, { fontWeight: "600", color: row.color })
        div.appendChild(k)
        div.appendChild(v)
        summaryBox.appendChild(div)
      })

      const refundRow = document.createElement("div")
      Object.assign(refundRow.style, { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "12px", paddingTop: "12px", borderTop: "2px solid #e5e7eb" })
      const refundLabel = document.createElement("span")
      refundLabel.textContent = "ยอดเงินคืนสุทธิ"
      Object.assign(refundLabel.style, { fontSize: "15px", fontWeight: "700" })
      const refundVal = document.createElement("span")
      refundVal.textContent = `฿${detail.summary.refundAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}`
      Object.assign(refundVal.style, { fontSize: "28px", fontWeight: "700", color: detail.summary.refundAmount >= 0 ? "#16a34a" : "#ef4444" })
      refundRow.appendChild(refundLabel)
      refundRow.appendChild(refundVal)
      summaryBox.appendChild(refundRow)
      container.appendChild(summaryBox)

      // Payment info
      if (detail.property.bankAccount) {
        const paySection = document.createElement("div")
        Object.assign(paySection.style, { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px", display: "grid", gridTemplateColumns: "1fr auto", gap: "16px" })
        const payLeft = document.createElement("div")
        const payTitle = document.createElement("p")
        payTitle.textContent = "● ข้อมูลบัญชีเงินคืน"
        Object.assign(payTitle.style, { margin: "0 0 12px", fontSize: "12px", fontWeight: "600", color: "#7c3aed" })
        payLeft.appendChild(payTitle)
        const payFields = [["ธนาคาร", detail.property.bankName], ["เลขที่บัญชี", detail.property.bankAccount], ["ชื่อบัญชี", detail.property.bankHolder]]
        payFields.filter(([, v]) => v).forEach(([k, v]) => {
          const row = document.createElement("div")
          Object.assign(row.style, { display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "4px 0", borderBottom: "1px solid #f3f4f6" })
          const kEl = document.createElement("span")
          kEl.textContent = k
          Object.assign(kEl.style, { color: "#6b7280" })
          const vEl = document.createElement("span")
          vEl.textContent = v || ""
          Object.assign(vEl.style, { fontWeight: "500" })
          row.appendChild(kEl)
          row.appendChild(vEl)
          payLeft.appendChild(row)
        })
        paySection.appendChild(payLeft)
        if (detail.property.paymentQrUrl) {
          const qrWrap = document.createElement("div")
          Object.assign(qrWrap.style, { display: "flex", flexDirection: "column", alignItems: "center" })
          const qr = document.createElement("img")
          qr.src = detail.property.paymentQrUrl
          qr.crossOrigin = "anonymous"
          Object.assign(qr.style, { width: "96px", height: "96px", objectFit: "contain", borderRadius: "8px", border: "1px solid #f3f4f6" })
          const qrLabel = document.createElement("p")
          qrLabel.textContent = "QR พร้อมเพย์"
          Object.assign(qrLabel.style, { margin: "4px 0 0", fontSize: "11px", color: "#9ca3af" })
          qrWrap.appendChild(qr)
          qrWrap.appendChild(qrLabel)
          paySection.appendChild(qrWrap)
        }
        container.appendChild(paySection)
      }

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
        scale: 2, useCORS: true, allowTaint: true,
        backgroundColor: "#ffffff", scrollX: 0, scrollY: 0,
        width: container.scrollWidth, height: container.scrollHeight,
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
      pdf.save(`ใบคืนเงินมัดจำ-ห้อง${detail.tenant.roomNumber}.pdf`)
    } catch (e) {
      console.error(e)
      toast("ไม่สามารถโหลด PDF ได้", "error")
    } finally {
      setIsDownloading(false)
    }
  }

  const today = new Date().toLocaleDateString("th-TH-u-ca-gregory", { day: "numeric", month: "long", year: "numeric" })

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title={detail ? `ใบคืนเงินมัดจำ — ห้อง ${detail.tenant.roomNumber}` : "รายละเอียดบิลแจ้งออก"}
      description={detail ? `${detail.tenant.firstName} ${detail.tenant.lastName}` : undefined}
      size="2xl"
    >
      {isLoading || !detail ? (
        <div className="py-10 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="flex flex-col max-h-[80vh]">
          {/* Scrollable A4 preview */}
          <div className="overflow-y-auto flex-1 pb-2">
            <div ref={previewRef} className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm w-[760px] mx-auto">

              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-start gap-3">
                  {detail.property.logoUrl && (
                    <img src={detail.property.logoUrl} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" alt="logo" />
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-base">{detail.property.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5 max-w-xs leading-relaxed">{detail.property.address}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap">ใบคืนเงินมัดจำ</div>
                  <p className="text-xs text-gray-400 mt-1.5">{today}</p>
                </div>
              </div>

              {/* Info cards */}
              <div className="grid grid-cols-4 gap-2 mb-5">
                {[
                  ["ห้องพัก", `ห้อง ${detail.tenant.roomNumber}`],
                  ["ประเภทห้อง", detail.tenant.roomType],
                  ["ผู้เช่า", `${detail.tenant.firstName} ${detail.tenant.lastName}`],
                  ["วันที่ย้ายออก", new Date(detail.tenant.moveOutDate).toLocaleDateString("th-TH-u-ca-gregory", { day: "numeric", month: "short", year: "numeric" })],
                ].map(([label, val]) => (
                  <div key={label} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-bold text-gray-900">{val}</p>
                  </div>
                ))}
              </div>

              {/* Final bill table */}
              <p className="text-sm font-semibold text-gray-700 mb-2">บิลเดือนล่าสุด</p>
              <table className="w-full text-sm border-collapse mb-0">
                <thead>
                  <tr className="bg-gray-900 text-white">
                    {["ลำดับ", "รายการ", "จำนวน", "ราคา/หน่วย", "รวมเป็นเงิน"].map((h, i) => (
                      <th key={h} className={`px-3 py-2.5 text-xs font-semibold ${i === 0 || i === 2 ? "text-center" : i >= 3 ? "text-right" : "text-left"}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {detail.finalBill.items.map((item, idx) => {
                    const isWater = item.title.startsWith("ค่าน้ำ")
                    const isElec = item.title.startsWith("ค่าไฟ")
                    let label = item.title
                    let subtitle: string | null = null
                    let qty = 1
                    let rate = item.amount
                    if (isWater) {
                      label = "ค่าน้ำประปา"
                      qty = detail.meter.waterUsed
                      rate = qty > 0 ? item.amount / qty : 0
                      subtitle = `${detail.meter.waterStart} → ${detail.meter.waterEnd} = ใช้ไป ${qty} หน่วย`
                    } else if (isElec) {
                      label = "ค่าไฟฟ้า"
                      qty = detail.meter.electricUsed
                      rate = qty > 0 ? item.amount / qty : 0
                      subtitle = `${detail.meter.electricStart} → ${detail.meter.electricEnd} = ใช้ไป ${qty} หน่วย`
                    }
                    return (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 py-2.5 text-center text-gray-500">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          <p className="text-gray-800">{label}</p>
                          {subtitle && <span className="text-xs text-blue-600 mt-0.5 bg-blue-50 px-2 py-0.5 rounded block w-fit">{subtitle}</span>}
                        </td>
                        <td className="px-3 py-2.5 text-center text-gray-700">{qty.toLocaleString()}</td>
                        <td className="px-3 py-2.5 text-right text-gray-700">{rate.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-gray-800">{item.amount.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="bg-gray-50 border border-t-0 border-gray-200 rounded-b-lg px-4 py-3 flex justify-end items-center gap-4 mb-5">
                <span className="text-sm font-semibold text-gray-700">รวมบิลล่าสุด</span>
                <span className="text-xl font-bold text-blue-700">{detail.finalBill.total.toLocaleString("th-TH", { minimumFractionDigits: 2 })}</span>
              </div>

              {/* Summary */}
              <div className="border border-gray-200 rounded-xl p-4">
                <p className="text-xs font-semibold text-purple-600 mb-3">● สรุปยอดเงินคืน</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                    <span className="text-gray-500">เงินประกัน + ค่าเช่าล่วงหน้า</span>
                    <span className="font-semibold text-green-600">+฿{detail.summary.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm py-1 border-b border-gray-100">
                    <span className="text-gray-500">หักบิลเดือนล่าสุด</span>
                    <span className="font-semibold text-red-500">-฿{Math.abs(detail.summary.deductFinalBill).toLocaleString()}</span>
                  </div>
                  {detail.damage.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-500">หักค่าเสียหาย{item.title ? ` — ${item.title}` : ""}</span>
                      <span className="font-semibold text-red-500">-฿{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {detail.additional.items.map((item, i) => (
                    <div key={`add-${i}`} className="flex justify-between text-sm py-1 border-b border-gray-100">
                      <span className="text-gray-500">หักค่าใช้จ่ายเพิ่มเติม{item.title ? ` — ${item.title}` : ""}</span>
                      <span className="font-semibold text-red-500">-฿{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3 mt-1 border-t-2 border-gray-200">
                    <span className="font-bold text-gray-900">ยอดเงินคืนสุทธิ</span>
                    <span className={`text-2xl font-bold ${detail.summary.refundAmount >= 0 ? "text-green-600" : "text-red-500"}`}>
                      ฿{detail.summary.refundAmount.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment info */}
              {detail.property.bankAccount && (
                <div className="mt-5 grid grid-cols-[1fr_auto] gap-4 border border-gray-200 rounded-xl p-4">
                  <div>
                    <p className="text-xs font-semibold text-purple-600 mb-3">● ข้อมูลบัญชีเงินคืน</p>
                    {[["ธนาคาร", detail.property.bankName], ["เลขที่บัญชี", detail.property.bankAccount], ["ชื่อบัญชี", detail.property.bankHolder]]
                      .filter(([, v]) => v)
                      .map(([k, v]) => (
                        <div key={k} className="flex justify-between text-xs py-1 border-b border-gray-100 last:border-0">
                          <span className="text-gray-500">{k}</span>
                          <span className="font-medium text-gray-800">{v}</span>
                        </div>
                      ))}
                  </div>
                  {detail.property.paymentQrUrl && (
                    <div className="flex flex-col items-center">
                      <img src={detail.property.paymentQrUrl} className="w-24 h-24 object-contain rounded-lg border border-gray-100" alt="QR" />
                      <p className="text-xs text-gray-400 mt-1">QR พร้อมเพย์</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button onClick={onClose}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              ปิด
            </button>
            <button onClick={handleDownloadPDF} disabled={isDownloading}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-sm rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-60">
              <RiFileTextLine size={16} /> {isDownloading ? "กำลังสร้าง PDF..." : "โหลด PDF"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Move Out Bill Modal ────────────────────────────────────────────────────
function MoveOutBillModal({ open, onClose, onSuccess, propertyId, pending, initialContractId }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
  pending: MoveOutPendingItem[]
  initialContractId?: string
}) {
  const { toast } = useToast()
  const todayDay = new Date().getDate()
  const todayDate = new Date().toISOString().split("T")[0]

  const [selectedContractId, setSelectedContractId] = useState(initialContractId ?? "")
  const contract = pending.find((t) => t.contractId === selectedContractId) ?? null

  const [form, setForm] = useState<BillForm>({
    moveOutDate: todayDate,
    billingStartDay: "1",
    billingEndDay: String(todayDay),
    waterStart: "0",
    waterEnd: "0",
    electricStart: "0",
    electricEnd: "0",
    damageItems: [],
    additionalItems: [],
  })

  const [preview, setPreview] = useState<MoveOutPreviewResponse | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset when modal opens
  useEffect(() => {
    if (!open) return
    setSelectedContractId(initialContractId ?? "")
    setPreview(null)
    setForm({
      moveOutDate: todayDate,
      billingStartDay: "1",
      billingEndDay: String(todayDay),
      waterStart: "0", waterEnd: "0",
      electricStart: "0", electricEnd: "0",
      damageItems: [], additionalItems: [],
    })
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-preview when contract is selected
  useEffect(() => {
    if (!selectedContractId) { setPreview(null); return }
    const c = pending.find((t) => t.contractId === selectedContractId)
    if (!c) return
    const moveOut = c.moveOutDate
      ? new Date(c.moveOutDate).toISOString().split("T")[0]
      : todayDate
    const defaultForm = {
      moveOutDate: moveOut,
      billingStartDay: 1,
      billingEndDay: todayDay,
      waterStart: 0, waterEnd: 0,
      electricStart: 0, electricEnd: 0,
      damageItems: [] as { title: string; amount: number }[],
      additionalItems: [] as { title: string; amount: number }[],
    }
    setForm({
      moveOutDate: moveOut,
      billingStartDay: "1",
      billingEndDay: String(todayDay),
      waterStart: "0", waterEnd: "0",
      electricStart: "0", electricEnd: "0",
      damageItems: [], additionalItems: [],
    })
    setPreview(null)
    setIsPreviewing(true)
    previewMoveOutBill(propertyId, selectedContractId, defaultForm)
      .then((res) => {
        setPreview(res)
        // Auto-fill: prev → start, current → end
        setForm((p) => ({
          ...p,
          waterStart: String(res.lastMeter.prev?.waterMeter ?? 0),
          electricStart: String(res.lastMeter.prev?.electricMeter ?? 0),
          waterEnd: String(res.lastMeter.current?.waterMeter ?? 0),
          electricEnd: String(res.lastMeter.current?.electricMeter ?? 0),
        }))
      })
      .catch(() => {})
      .finally(() => setIsPreviewing(false))
  }, [selectedContractId]) // eslint-disable-line react-hooks/exhaustive-deps

  const buildInput = useCallback((): MoveOutBillInput => ({
    moveOutDate: form.moveOutDate,
    billingStartDay: Number(form.billingStartDay),
    billingEndDay: Number(form.billingEndDay),
    waterStart: Number(form.waterStart),
    waterEnd: Number(form.waterEnd),
    electricStart: Number(form.electricStart),
    electricEnd: Number(form.electricEnd),
    damageItems: form.damageItems,
    additionalItems: form.additionalItems,
  }), [form])

  // Auto-preview (debounced) when billing days or meter values change
  useEffect(() => {
    if (!contract) return
    setIsPreviewing(true)
    const input = buildInput()
    const t = setTimeout(() => {
      previewMoveOutBill(propertyId, contract.contractId, input)
        .then(setPreview)
        .catch(() => {})
        .finally(() => setIsPreviewing(false))
    }, 500)
    return () => { clearTimeout(t); setIsPreviewing(false) }
  }, [form.billingStartDay, form.billingEndDay, form.waterStart, form.waterEnd, form.electricStart, form.electricEnd, form.moveOutDate]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async () => {
    if (!contract || !preview) return
    setIsSubmitting(true)
    try {
      await createMoveOutBill(propertyId, contract.contractId, buildInput())
      toast("สร้างบิลแจ้งออกสำเร็จ", "success")
      onSuccess()
    } catch {
      toast("เกิดข้อผิดพลาด ไม่สามารถสร้างบิลได้", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const set = (field: keyof BillForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))

  const addDamage = () =>
    setForm((p) => ({ ...p, damageItems: [...p.damageItems, { title: "", amount: 0 }] }))
  const updateDamage = (i: number, field: "title" | "amount", val: string) =>
    setForm((p) => {
      const items = [...p.damageItems]
      items[i] = { ...items[i], [field]: field === "amount" ? Number(val) : val }
      return { ...p, damageItems: items }
    })
  const removeDamage = (i: number) =>
    setForm((p) => ({ ...p, damageItems: p.damageItems.filter((_, j) => j !== i) }))

  const addAdditional = () =>
    setForm((p) => ({ ...p, additionalItems: [...p.additionalItems, { title: "", amount: 0 }] }))
  const updateAdditional = (i: number, field: "title" | "amount", val: string) =>
    setForm((p) => {
      const items = [...p.additionalItems]
      items[i] = { ...items[i], [field]: field === "amount" ? Number(val) : val }
      return { ...p, additionalItems: items }
    })
  const removeAdditional = (i: number) =>
    setForm((p) => ({ ...p, additionalItems: p.additionalItems.filter((_, j) => j !== i) }))

  const tenantOptions = pending.map((t) => ({
    value: t.contractId,
    label: `${t.firstName} ${t.lastName} (ห้อง ${t.roomNumber})`,
  }))

  // Local refund computation for summary
  const damageTotal = form.damageItems.reduce((s, i) => s + i.amount, 0)
  const additionalTotal = form.additionalItems.reduce((s, i) => s + i.amount, 0)
  const localRefund = preview
    ? preview.summary.securityDeposit - Math.abs(preview.summary.deductFinalBill) - damageTotal - additionalTotal
    : null

  const isPartialMonth = preview
    ? preview.finalBill.days < preview.finalBill.daysInMonth
    : false

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="สร้างบิลแจ้งออก"
      description="บันทึกข้อมูลการแจ้งออกและคำนวณเงินคืนมัดจำ"
      size="xl"
    >
      <div className="max-h-[75vh] overflow-y-auto pr-1 space-y-4">

        {/* เลือกผู้เช่า + วันที่แจ้งออก */}
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="เลือกผู้เช่า"
            placeholder="เลือกผู้เช่าที่แจ้งออก"
            options={tenantOptions}
            value={selectedContractId}
            onValueChange={setSelectedContractId}
          />
          <FormInput
            label="วันที่แจ้งออก"
            type="date"
            value={form.moveOutDate}
            onChange={set("moveOutDate")}
          />
        </div>

        {/* Contract info (after preview loaded) */}
        {preview && (
          <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 mb-1">สถานะสัญญา</p>
              {preview.completion?.isComplete ? (
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700 border border-green-200">
                  อยู่ครบตามสัญญา
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700 border border-orange-200">
                  ออกก่อนกำหนด
                </span>
              )}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-1">ระยะเวลาที่อยู่</p>
              <p className="text-sm font-semibold text-gray-800">
                {preview.completion?.actualMonths ?? "—"} เดือน
              </p>
            </div>
          </div>
        )}

        {/* เงินประกัน display */}
        {preview && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              เงินประกัน + ล่วงหน้า 1 เดือน (บาท)
            </label>
            <div className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
              {preview.summary.securityDeposit.toLocaleString()}
            </div>
          </div>
        )}

        {/* บิลเดือนล่าสุด */}
        {contract && (
          <div className="border border-blue-200 rounded-xl p-4 space-y-3 bg-blue-50">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-2">
                <span className="text-base">$</span>
                บิลเดือนล่าสุด {preview ? `(${preview.finalBill.billingPeriod})` : ""}
              </h4>
              {isPreviewing && (
                <span className="text-xs text-blue-500 animate-pulse">กำลังคำนวณ...</span>
              )}
            </div>

            {/* Billing days */}
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="วันที่เริ่มรอบบิล"
                type="number"
                value={form.billingStartDay}
                onChange={set("billingStartDay")}
                placeholder="1"
                inputClassName="border-blue-200 focus:border-blue-400 bg-white"
              />
              <FormInput
                label="วันที่สิ้นสุดรอบบิล"
                type="number"
                value={form.billingEndDay}
                onChange={set("billingEndDay")}
                placeholder="15"
                inputClassName="border-blue-200 focus:border-blue-400 bg-white"
              />
            </div>

            {/* Partial month warning */}
            {isPartialMonth && preview && (
              <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <span className="text-yellow-500 text-base">⚠</span>
                <p className="text-xs text-yellow-700">
                  คำนวณเป็นรายวัน ({preview.finalBill.days} วัน จาก {preview.finalBill.daysInMonth} วัน)
                </p>
              </div>
            )}

            {/* ค่าห้อง + ค่าเฟอร์นิเจอร์ (read-only) */}
            {preview && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ค่าห้อง (บาท)</label>
                  <div className="w-full px-3 py-2.5 text-sm border border-blue-100 rounded-lg bg-white text-gray-400">
                    {preview.roomDetails.roomPrice.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">ค่าเฟอร์นิเจอร์ (บาท)</label>
                  <div className="w-full px-3 py-2.5 text-sm border border-blue-100 rounded-lg bg-white text-gray-400">
                    {preview.roomDetails.furniturePrice > 0 ? preview.roomDetails.furniturePrice.toLocaleString() : "—"}
                  </div>
                </div>
              </div>
            )}

            {/* Meter readings */}
            <div className="grid grid-cols-3 gap-3">
              <FormInput label="มิเตอร์น้ำเดิม *" type="number" value={form.waterStart} onChange={set("waterStart")} inputClassName="border-blue-200 focus:border-blue-400 bg-white" />
              <FormInput label="มิเตอร์น้ำใหม่ *" type="number" value={form.waterEnd} onChange={set("waterEnd")} inputClassName="border-blue-200 focus:border-blue-400 bg-white" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคาต่อหน่วย</label>
                <div className="w-full px-3 py-2.5 text-sm border border-blue-100 rounded-lg bg-white text-gray-400">
                  {preview ? preview.roomDetails.waterRate : "—"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <FormInput label="มิเตอร์ไฟเดิม *" type="number" value={form.electricStart} onChange={set("electricStart")} inputClassName="border-blue-200 focus:border-blue-400 bg-white" />
              <FormInput label="มิเตอร์ไฟใหม่ *" type="number" value={form.electricEnd} onChange={set("electricEnd")} inputClassName="border-blue-200 focus:border-blue-400 bg-white" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคาต่อหน่วย</label>
                <div className="w-full px-3 py-2.5 text-sm border border-blue-100 rounded-lg bg-white text-gray-400">
                  {preview ? preview.roomDetails.electricRate : "—"}
                </div>
              </div>
            </div>

            {/* Bill breakdown */}
            {preview && (
              <div className="bg-white rounded-lg border border-blue-100 divide-y divide-gray-100">
                {preview.finalBill.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-gray-600">{item.title}</span>
                    <span className="text-sm text-gray-800">฿{item.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50">
                  <span className="text-sm font-bold text-gray-800">รวมบิลเดือนล่าสุด</span>
                  <span className="text-sm font-bold text-blue-700">฿{preview.finalBill.total.toLocaleString()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Damage items */}
        <AddItemSection
          title="รายการหักค่าเสียหาย"
          items={form.damageItems}
          onAdd={addDamage}
          onUpdate={updateDamage}
          onRemove={removeDamage}
          emptyText="ไม่มีค่าเสียหาย"
        />

        {/* Additional items */}
        <AddItemSection
          title="รายการค่าใช้จ่ายเพิ่มเติม"
          items={form.additionalItems}
          onAdd={addAdditional}
          onUpdate={updateAdditional}
          onRemove={removeAdditional}
          emptyText="ไม่มีรายการค่าใช้จ่ายเพิ่มเติม"
        />

        {/* สรุปยอดเงินคืน */}
        {preview && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-1.5">
            <h4 className="text-sm font-bold text-gray-800 mb-3">สรุปยอดเงินคืน</h4>
            <SummaryRow
              label="เงินประกัน + ค่าเช่าล่วงหน้า"
              value={`฿${preview.summary.securityDeposit.toLocaleString()}`}
              valueColor="text-green-600"
              bold
            />
            <SummaryRow
              label="หักบิลเดือนล่าสุด"
              value={`-฿${Math.abs(preview.summary.deductFinalBill).toLocaleString()}`}
              valueColor="text-red-500"
            />
            {form.damageItems.map((item, i) => (
              <SummaryRow
                key={i}
                label={`หักค่าเสียหาย${item.title ? ` — ${item.title}` : ""}`}
                value={`-฿${item.amount.toLocaleString()}`}
                valueColor="text-red-500"
              />
            ))}
            {form.additionalItems.map((item, i) => (
              <SummaryRow
                key={i}
                label={`หักค่าใช้จ่ายเพิ่มเติม${item.title ? ` — ${item.title}` : ""}`}
                value={`-฿${item.amount.toLocaleString()}`}
                valueColor="text-red-500"
              />
            ))}
            <div className="border-t-2 border-gray-200 pt-3 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">ยอดเงินคืนสุทธิ</span>
                <span className={`text-2xl font-bold ${(localRefund ?? 0) >= 0 ? "text-green-600" : "text-red-500"}`}>
                  ฿{(localRefund ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !preview || !contract}
            className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            <RiCheckboxCircleLine size={16} />
            {isSubmitting ? "กำลังบันทึก..." : "ยืนยันแจ้งออก"}
          </button>
        </div>

      </div>
    </Modal>
  )
}
