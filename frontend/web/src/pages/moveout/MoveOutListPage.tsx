import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  RiCalendarLine, RiUser3Line, RiPhoneLine, RiFileTextLine,
  RiCheckboxCircleLine, RiAddLine,
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
} from "../../api/moveout/moveoutApi"
import type {
  MoveOutPendingItem,
  MoveOutCompletedItem,
  MoveOutBillInput,
  MoveOutPreviewResponse,
} from "../../types/moveout.types"

// ── Status label map ───────────────────────────────────────────────────────
const COMPLETED_STATUS: Record<string, { label: string; className: string }> = {
  DRAFT:     { label: "แบบร่าง",    className: "bg-gray-100 text-gray-600 border-gray-200" },
  CONFIRMED: { label: "ยืนยันแล้ว", className: "bg-blue-100 text-blue-700 border-blue-200" },
  COMPLETED: { label: "เสร็จสิ้น",  className: "bg-green-100 text-green-700 border-green-200" },
}

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
                        ย้ายออก: {new Date(t.moveOutDate).toLocaleDateString("th-TH")}
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
        {completed.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-base font-semibold text-gray-700">บิลที่สร้างแล้ว ({completed.length})</p>
            </div>
            <div className="overflow-x-auto mx-6 mb-5 mt-4 rounded-xl border border-gray-200">
              <table className="w-full min-w-[600px]">
                <thead className="border-b border-gray-200 bg-gray-50/50">
                  <tr>
                    {["ผู้เช่า", "ห้อง", "วันที่ย้ายออก", "เงินคืน", "สถานะ"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {completed.map((c) => {
                    const statusCfg = COMPLETED_STATUS[c.status] ?? COMPLETED_STATUS.CONFIRMED
                    return (
                      <tr key={c.moveOutBillId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3.5 text-sm font-medium text-gray-800">{c.firstName} {c.lastName}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">{c.roomNumber}</td>
                        <td className="px-5 py-3.5 text-sm text-gray-600">
                          {new Date(c.moveOutDate).toLocaleDateString("th-TH")}
                        </td>
                        <td className={`px-5 py-3.5 text-sm font-semibold ${c.refundAmount >= 0 ? "text-green-600" : "text-red-500"}`}>
                          ฿{c.refundAmount.toLocaleString()}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${statusCfg.className}`}>
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
    </div>
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
      .then(setPreview)
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
  }, [form.billingStartDay, form.billingEndDay, form.waterEnd, form.electricEnd, form.moveOutDate]) // eslint-disable-line react-hooks/exhaustive-deps

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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">มิเตอร์น้ำเดิม</label>
                <div className="w-full px-3 py-2.5 text-sm border border-blue-100 rounded-lg bg-white text-gray-400">
                  {form.waterStart || "0"}
                </div>
              </div>
              <FormInput label="มิเตอร์น้ำใหม่ *" type="number" value={form.waterEnd} onChange={set("waterEnd")} inputClassName="border-blue-200 focus:border-blue-400 bg-white" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">ราคาต่อหน่วย</label>
                <div className="w-full px-3 py-2.5 text-sm border border-blue-100 rounded-lg bg-white text-gray-400">
                  {preview ? preview.roomDetails.waterRate : "—"}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">มิเตอร์ไฟเดิม</label>
                <div className="w-full px-3 py-2.5 text-sm border border-blue-100 rounded-lg bg-white text-gray-400">
                  {form.electricStart || "0"}
                </div>
              </div>
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
