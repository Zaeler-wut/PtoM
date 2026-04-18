import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  RiSearchLine, RiFilterLine, RiEyeLine, RiEditLine,
  RiUserLine, RiHome3Line, RiCarLine, RiAddLine, RiDeleteBinLine,
} from "react-icons/ri"
import { SelectInput } from "../../components/shared/SelectInput"
import { Modal } from "../../components/shared/Modal"
import { FormInput } from "../../components/shared/FormInput"
import { useToast } from "../../components/shared/Toast"
import { getTenants, getTenantDetail, updateTenantPersonalInfo } from "../../api/tenant/tenantApi"
import { Pagination } from "../../components/shared/Pagination"
import type { Tenant, TenantDetail, ContractStatus } from "../../types/tenant.types"

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_MAP: Record<ContractStatus, { label: string; className: string }> = {
  ACTIVE:          { label: "กำลังเช่า",   className: "bg-green-100 text-green-700 border-green-200" },
  MOVE_OUT_NOTICE: { label: "แจ้งออกแล้ว", className: "bg-orange-100 text-orange-700 border-orange-200" },
  ENDED:           { label: "ออกแล้ว",     className: "bg-gray-100 text-gray-500 border-gray-200" },
}

const FILTER_OPTIONS = [
  { value: "CURRENT",         label: "ปัจจุบัน" },
  { value: "ALL",             label: "ทุกสถานะ" },
  { value: "ACTIVE",          label: "กำลังเช่า" },
  { value: "MOVE_OUT_NOTICE", label: "แจ้งออกแล้ว" },
  { value: "ENDED",           label: "ออกแล้ว" },
]

const VEHICLE_TYPE_OPTIONS = [
  { value: "__none__",    label: "ไม่มียานพาหนะ" },
  { value: "CAR",         label: "รถยนต์" },
  { value: "MOTORCYCLE",  label: "รถมอเตอร์ไซค์" },
]

const VEHICLE_TYPE_LABEL: Record<string, string> = {
  CAR: "รถยนต์", MOTORCYCLE: "รถมอเตอร์ไซค์", OTHER: "อื่นๆ",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("th-TH", {
    day: "numeric", month: "short", year: "numeric",
  })
}

// ── Shared UI ──────────────────────────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-gray-500">{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{title}</span>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex gap-2 py-1.5">
      <span className="text-xs text-gray-400 w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-gray-800 font-medium">{value || "—"}</span>
    </div>
  )
}

// ── View Modal ─────────────────────────────────────────────────────────────
function ViewTenantModal({
  open, onOpenChange, propertyId, contractId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  propertyId: string
  contractId: string
}) {
  const [detail, setDetail] = useState<TenantDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!open) { setDetail(null); return }
    setIsLoading(true)
    getTenantDetail(propertyId, contractId)
      .then(setDetail)
      .finally(() => setIsLoading(false))
  }, [open, propertyId, contractId])

  const status = detail ? (STATUS_MAP[detail.contract.status] ?? STATUS_MAP.ENDED) : null

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="ข้อมูลผู้เช่า" size="lg">
      {isLoading || !detail ? (
        <div className="py-12 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">

          {/* ข้อมูลส่วนตัว */}
          <div className="bg-gray-50 rounded-xl p-4">
            <SectionHeader icon={<RiUserLine size={15} />} title="ข้อมูลส่วนตัว" />
            <div className="divide-y divide-gray-100">
              <DetailRow label="ชื่อ-นามสกุล" value={`${detail.user.firstName} ${detail.user.lastName}`} />
              <DetailRow label="อีเมล" value={detail.user.email} />
              <DetailRow label="เบอร์โทร" value={detail.user.phone} />
              <DetailRow label="LINE ID" value={detail.user.lineId} />
              <DetailRow label="ที่อยู่" value={detail.user.address} />
            </div>
          </div>

          {/* ข้อมูลห้องพัก */}
          <div className="bg-gray-50 rounded-xl p-4">
            <SectionHeader icon={<RiHome3Line size={15} />} title="ข้อมูลห้องพัก" />
            <div className="divide-y divide-gray-100">
              <div className="flex gap-2 py-1.5 items-center">
                <span className="text-xs text-gray-400 w-28 flex-shrink-0">สถานะสัญญา</span>
                {status && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border ${status.className}`}>
                    {status.label}
                  </span>
                )}
              </div>
              <DetailRow label="ห้อง" value={detail.contract.roomNumber} />
              <DetailRow label="ประเภทห้อง" value={detail.contract.roomType} />
              {detail.contract.floor != null && (
                <DetailRow label="ชั้น" value={String(detail.contract.floor)} />
              )}
              <DetailRow label="วันเริ่มสัญญา" value={formatDate(detail.contract.startDate)} />
              <DetailRow label="วันสิ้นสุดสัญญา" value={formatDate(detail.contract.endDate)} />
              <DetailRow label="เงินมัดจำ" value={`฿${detail.contract.securityDeposit.toLocaleString()}`} />
            </div>
          </div>

          {/* ยานพาหนะ */}
          <div className="bg-gray-50 rounded-xl p-4">
            <SectionHeader icon={<RiCarLine size={15} />} title="ข้อมูลยานพาหนะ" />
            {detail.vehicles.length === 0 ? (
              <p className="text-sm text-gray-400">ไม่มีข้อมูลยานพาหนะ</p>
            ) : (
              <div className="space-y-2">
                {detail.vehicles.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <span className="text-xs text-gray-500 w-24">{VEHICLE_TYPE_LABEL[v.type] ?? v.type}</span>
                    <span className="text-sm font-semibold text-gray-800 tracking-wide">{v.plateNumber}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </Modal>
  )
}

// ── Edit Modal ─────────────────────────────────────────────────────────────
function EditTenantModal({
  open, onOpenChange, propertyId, contractId, onUpdated,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  propertyId: string
  contractId: string
  onUpdated: () => void
}) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [lineId, setLineId] = useState("")
  const [vehicles, setVehicles] = useState<{ plateNumber: string; type: string }[]>([])
  const [newVehicleType, setNewVehicleType] = useState("__none__")
  const [newVehiclePlate, setNewVehiclePlate] = useState("")

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    getTenantDetail(propertyId, contractId)
      .then((d) => {
        setFirstName(d.user.firstName)
        setLastName(d.user.lastName)
        setEmail(d.user.email)
        setPhone(d.user.phone ?? "")
        setLineId(d.user.lineId ?? "")
        setVehicles(d.vehicles)
        setNewVehicleType("__none__")
        setNewVehiclePlate("")
      })
      .finally(() => setIsLoading(false))
  }, [open, propertyId, contractId])

  const addVehicle = () => {
    if (newVehicleType === "__none__" || !newVehiclePlate.trim()) return
    setVehicles((prev) => [...prev, { plateNumber: newVehiclePlate.trim(), type: newVehicleType }])
    setNewVehicleType("__none__")
    setNewVehiclePlate("")
  }

  const removeVehicle = (index: number) => {
    setVehicles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      toast("กรุณากรอกชื่อ นามสกุล และอีเมล", "error")
      return
    }
    setIsSubmitting(true)
    try {
      await updateTenantPersonalInfo(propertyId, contractId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        lineId: lineId.trim() || undefined,
        vehicles,
      })
      toast("บันทึกข้อมูลสำเร็จ", "success")
      onUpdated()
      onOpenChange(false)
    } catch (e: any) {
      toast(e?.response?.data?.error ?? "เกิดข้อผิดพลาด", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => { if (!isSubmitting) onOpenChange(v) }}
      title="แก้ไขข้อมูลผู้เช่า"
      size="lg"
    >
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">

          {/* ข้อมูลส่วนตัว */}
          <div className="bg-gray-50 rounded-xl p-4">
            <SectionHeader icon={<RiUserLine size={15} />} title="ข้อมูลส่วนตัว" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="ชื่อ *" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="ชื่อ" />
                <FormInput label="นามสกุล *" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="นามสกุล" />
              </div>
              <FormInput label="อีเมล *" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="อีเมล" type="email" />
              <div className="grid grid-cols-2 gap-3">
                <FormInput label="เบอร์โทร" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="เบอร์โทร" />
                <FormInput label="LINE ID" value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder="LINE ID" />
              </div>
            </div>
          </div>

          {/* ยานพาหนะ */}
          <div className="bg-gray-50 rounded-xl p-4">
            <SectionHeader icon={<RiCarLine size={15} />} title="ข้อมูลยานพาหนะ" />

            {/* รายการปัจจุบัน */}
            {vehicles.length > 0 && (
              <div className="space-y-2 mb-3">
                {vehicles.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 border border-gray-100">
                    <span className="text-xs text-gray-500 w-24">{VEHICLE_TYPE_LABEL[v.type] ?? v.type}</span>
                    <span className="text-sm font-semibold text-gray-800 tracking-wide flex-1">{v.plateNumber}</span>
                    <button
                      onClick={() => removeVehicle(i)}
                      className="text-red-400 hover:text-red-600 transition-colors p-1">
                      <RiDeleteBinLine size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* เพิ่มยานพาหนะใหม่ */}
            <div className="flex gap-2 items-end">
              <div className="w-40">
                <SelectInput
                  label="ประเภท"
                  options={VEHICLE_TYPE_OPTIONS}
                  value={newVehicleType}
                  onValueChange={setNewVehicleType}
                />
              </div>
              <div className="flex-1">
                <FormInput
                  label="ทะเบียน"
                  value={newVehiclePlate}
                  onChange={(e) => setNewVehiclePlate(e.target.value)}
                  placeholder="เช่น กข 1234 กรุงเทพมหานคร"
                  onKeyDown={(e) => { if (e.key === "Enter") addVehicle() }}
                />
              </div>
              <button
                onClick={addVehicle}
                disabled={newVehicleType === "__none__" || !newVehiclePlate.trim()}
                className="mb-0.5 flex items-center gap-1 px-3 py-2.5 text-xs bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-40">
                <RiAddLine size={14} /> เพิ่ม
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60">
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>

        </div>
      )}
    </Modal>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TenantListPage() {
  const { propertyId } = useParams<{ propertyId: string }>()

  const [tenants, setTenants] = useState<Tenant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("CURRENT")
  const [viewContractId, setViewContractId] = useState<string | null>(null)
  const [editContractId, setEditContractId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const loadTenants = () => {
    if (!propertyId) return
    setIsLoading(true)
    getTenants(propertyId).then(setTenants).finally(() => setIsLoading(false))
  }

  useEffect(() => { loadTenants() }, [propertyId])

  const filtered = tenants.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase()
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      (t.phone ?? "").includes(search) ||
      (t.lineId ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CURRENT"
        ? t.contractStatus === "ACTIVE" || t.contractStatus === "MOVE_OUT_NOTICE"
        : t.contractStatus === statusFilter)
    return matchSearch && matchStatus
  })

  useEffect(() => { setPage(1) }, [search, statusFilter])
  const pagedFiltered = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  return (
    <div className="bg-purple-50 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ผู้เช่า</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลผู้เช่าที่อยู่อาศัยในปัจจุบัน</p>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <RiSearchLine className="text-gray-400 flex-shrink-0" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, เบอร์โทร, Line ID..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <RiFilterLine className="text-gray-400 flex-shrink-0" size={18} />
            <div className="flex-1">
              <SelectInput value={statusFilter} onValueChange={setStatusFilter} options={FILTER_OPTIONS} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-700">
              รายการผู้เช่า ({isLoading ? "..." : filtered.length})
            </p>
          </div>
          <div className="overflow-x-auto mx-6 mt-4 rounded-xl border border-gray-200">
            <table className="w-full min-w-[760px]">
              <thead className="border-b border-gray-200 bg-gray-50/50">
                <tr>
                  {["ห้อง", "ผู้เช่า", "เบอร์โทร", "Line ID", "ประเภทห้อง", "สถานะ", "จัดการ"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-sm text-gray-400 text-center">ไม่พบผู้เช่า</td></tr>
                ) : pagedFiltered.map((t) => {
                  const status = STATUS_MAP[t.contractStatus] ?? STATUS_MAP.ENDED
                  return (
                    <tr key={t.contractId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{t.roomNumber}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800">
                        {t.firstName} {t.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{t.phone ?? "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{t.lineId ?? "-"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{t.roomType}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewContractId(t.contractId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                            <RiEyeLine size={13} /> ดูข้อมูล
                          </button>
                          <button
                            onClick={() => setEditContractId(t.contractId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                            <RiEditLine size={13} /> แก้ไข
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <Pagination total={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={setPage} onRowsPerPageChange={setRowsPerPage} />
        </div>
      </div>

      {propertyId && viewContractId && (
        <ViewTenantModal
          open={!!viewContractId}
          onOpenChange={(v) => { if (!v) setViewContractId(null) }}
          propertyId={propertyId}
          contractId={viewContractId}
        />
      )}

      {propertyId && editContractId && (
        <EditTenantModal
          open={!!editContractId}
          onOpenChange={(v) => { if (!v) setEditContractId(null) }}
          propertyId={propertyId}
          contractId={editContractId}
          onUpdated={loadTenants}
        />
      )}
    </div>
  )
}
