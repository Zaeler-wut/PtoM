import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  RiAddLine, RiSearchLine, RiFilterLine,
  RiFileTextLine, RiUpload2Line, RiCalendarLine,
  RiExternalLinkLine, RiFilePdf2Line, RiEditLine,
} from "react-icons/ri"
import { Modal } from "../../components/shared/Modal"
import { FormInput } from "../../components/shared/FormInput"
import { SelectInput } from "../../components/shared/SelectInput"
import { StatusBadge } from "../../components/shared/StatusBadge"
import { TabBar } from "../../components/shared/TabBar"
import { SummaryRow } from "../../components/shared/SummaryRow"
import { useToast } from "../../components/shared/Toast"
import {
  getContracts,
  getContractDetail,
  createOnlineContract,
  createOfflineContract,
  updateContract,
  uploadContractPdf,
} from "../../api/contract/contractApi"
import { uploadApi } from "../../api/upload/uploadApi"
import { getRooms } from "../../api/room/roomApi"
import { getBookings, getContractPrefill } from "../../api/booking/bookingApi"
import type {
  ContractListItem,
  ContractDetail,
  CreateContractInput,
} from "../../types/contract.types"

// ── Constants ──────────────────────────────────────────────────────────────
const CONTRACT_TABS = [
  { value: "ONLINE", label: "สัญญาออนไลน์" },
  { value: "OFFLINE", label: "สัญญาออฟไลน์" },
]

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "ACTIVE", label: "ใช้งาน" },
  { value: "MOVE_OUT_NOTICE", label: "แจ้งย้ายออก" },
  { value: "ENDED", label: "ออกแล้ว" },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH")
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ContractListPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const [contracts, setContracts] = useState<ContractListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [createModal, setCreateModal] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [uploadId, setUploadId] = useState<string | null>(null)

  const load = useCallback(() => {
    if (!propertyId) return
    setIsLoading(true)
    getContracts(propertyId)
      .then(setContracts)
      .finally(() => setIsLoading(false))
  }, [propertyId])

  useEffect(() => { load() }, [load])

  const filtered = contracts.filter((c) => {
    const name = `${c.firstName} ${c.lastName}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase()) || c.roomNumber.includes(search)
    const matchStatus = statusFilter === "ALL" || c.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="bg-purple-50 min-h-screen p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">สัญญาเช่า</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการสัญญาเช่าของผู้เช่าทั้งหมด</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <RiSearchLine className="text-gray-400 flex-shrink-0" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อผู้เช่า หรือเลขห้อง..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <RiFilterLine className="text-gray-400 flex-shrink-0" size={18} />
            <div className="w-40">
              <SelectInput
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={STATUS_FILTER_OPTIONS}
              />
            </div>
          </div>
          <button
            onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <RiAddLine size={16} /> สร้างสัญญาใหม่
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-700">
              รายการสัญญา ({isLoading ? "..." : filtered.length})
            </p>
          </div>
          <div className="overflow-x-auto mx-6 mb-5 mt-4 rounded-xl border border-gray-200">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-gray-200 bg-gray-50/50">
                <tr>
                  {[
                    { label: "ผู้เช่า" },
                    { label: "ห้อง" },
                    { label: "ประเภทสัญญา" },
                    { label: "สถานะ" },
                    { label: "วันเริ่มสัญญา" },
                    { label: "วันสิ้นสุดสัญญา" },
                    { label: "ระยะเวลา" },
                    { label: "จัดการ", className: "min-w-[220px]" },
                  ].map((h) => (
                    <th key={h.label} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap ${h.className ?? ""}`}>{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-8 text-sm text-gray-400 text-center">ไม่พบสัญญาเช่า</td></tr>
                ) : filtered.map((c) => (
                  <tr key={c.contractId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{c.roomNumber}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={c.contractType} />
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{fmtDate(c.startDate)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{fmtDate(c.endDate)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{c.duration}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setDetailId(c.contractId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <RiFileTextLine size={12} /> ดูข้อมูล
                        </button>
                        <button
                          onClick={() => setEditId(c.contractId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <RiEditLine size={12} /> แก้ไข
                        </button>
                        <button
                          onClick={() => setUploadId(c.contractId)}
                          className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                        >
                          <RiUpload2Line size={12} /> อัพโหลด
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create modal */}
      <CreateContractModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        onSuccess={() => { setCreateModal(false); load() }}
        propertyId={propertyId!}
      />

      {/* Detail / edit modal */}
      {detailId && (
        <ContractDetailModal
          open
          onClose={() => setDetailId(null)}
          onSuccess={() => { setDetailId(null); load() }}
          propertyId={propertyId!}
          contractId={detailId}
        />
      )}

      {/* Edit modal */}
      {editId && (
        <EditContractModal
          open
          onClose={() => setEditId(null)}
          onSuccess={() => { setEditId(null); load() }}
          propertyId={propertyId!}
          contractId={editId}
        />
      )}

      {/* Upload PDF modal */}
      {uploadId && (
        <UploadPdfModal
          open
          onClose={() => setUploadId(null)}
          onSuccess={() => { setUploadId(null); load() }}
          propertyId={propertyId!}
          contractId={uploadId}
        />
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { value: "6", label: "6 เดือน" },
  { value: "12", label: "12 เดือน" },
  { value: "18", label: "18 เดือน" },
  { value: "24", label: "24 เดือน" },
]

const VEHICLE_TYPE_OPTIONS = [
  { value: "รถยนต์", label: "รถยนต์" },
  { value: "รถมอเตอร์ไซค์", label: "รถมอเตอร์ไซค์" },
  { value: "รถจักรยาน", label: "รถจักรยาน" },
]

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split("T")[0]
}

// ── Create Contract Modal ──────────────────────────────────────────────────
function CreateContractModal({ open, onClose, onSuccess, propertyId }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
}) {
  const { toast } = useToast()
  const [tab, setTab] = useState<"ONLINE" | "OFFLINE">("ONLINE")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rooms, setRooms] = useState<{ id: string; roomNumber: string; status: string; roomTypeName: string; securityDeposit: number; advanceRent: number }[]>([])
  const [bookings, setBookings] = useState<{ id: string; firstName: string; lastName: string; roomNumber: string }[]>([])
  const [selectedBookingId, setSelectedBookingId] = useState("__none__")
  const [roomTypeName, setRoomTypeName] = useState("")
  const [duration, setDuration] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [vehicleType, setVehicleType] = useState("__none__")

  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", lineId: "",
    houseNumber: "", soi: "", road: "", subDistrict: "", district: "", province: "",
    roomId: "", startDate: "", securityDeposit: "",
  })

  // Reset on open
  useEffect(() => {
    if (!open) return
    setForm({ firstName: "", lastName: "", email: "", phone: "", lineId: "", houseNumber: "", soi: "", road: "", subDistrict: "", district: "", province: "", roomId: "", startDate: "", securityDeposit: "" })
    setSelectedBookingId("__none__"); setRoomTypeName(""); setDuration(""); setVehiclePlate(""); setVehicleType("__none__")
    Promise.all([getRooms(propertyId), getBookings(propertyId)])
      .then(([roomList, bookingList]) => {
        setRooms((roomList as any[])
          .filter((r) => r.status === "AVAILABLE")
          .map((r: any) => ({ id: r.id, roomNumber: r.roomNumber, status: r.status, roomTypeName: r.roomType ?? "", securityDeposit: r.securityDeposit ?? 0, advanceRent: r.advanceRent ?? 0 }))
        )
        setBookings((bookingList as any[]).filter((b) => b.status === "CONFIRMED"))
      }).catch(() => {})
  }, [open, propertyId])

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }))

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    setForm((p) => ({
      ...p,
      roomId,
      securityDeposit: room ? String(room.securityDeposit + room.advanceRent) : p.securityDeposit,
    }))
    setRoomTypeName(room?.roomTypeName ?? "")
  }

  const handleBookingSelect = async (bookingId: string) => {
    setSelectedBookingId(bookingId)
    if (bookingId === "__none__") return
    try {
      const prefill = await getContractPrefill(propertyId, bookingId)
      setForm((p) => ({
        ...p,
        firstName: prefill.firstName ?? p.firstName,
        lastName: prefill.lastName ?? p.lastName,
        email: prefill.email ?? p.email,
        phone: prefill.phone ?? p.phone,
        lineId: prefill.lineId ?? p.lineId,
        roomId: prefill.roomId ?? p.roomId,
      }))
      if (prefill.roomId) {
        const room = rooms.find((r) => r.id === prefill.roomId)
        setRoomTypeName(room?.roomTypeName ?? "")
      }
    } catch {
      toast("ไม่สามารถดึงข้อมูลการจองได้", "error")
    }
  }

  const computedEndDate = form.startDate && duration
    ? addMonths(form.startDate, Number(duration))
    : ""

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.email || !form.roomId || !form.startDate || !computedEndDate) {
      toast("กรุณากรอกข้อมูลให้ครบถ้วน", "error")
      return
    }
    setIsSubmitting(true)
    try {
      const payload: CreateContractInput = {
        ...form,
        endDate: computedEndDate,
        securityDeposit: Number(form.securityDeposit),
        ...(tab === "ONLINE" && selectedBookingId !== "__none__" ? { bookingId: selectedBookingId } : {}),
        ...(vehiclePlate && vehicleType !== "__none__"
          ? { vehicles: [{ plateNumber: vehiclePlate, type: vehicleType }] }
          : {}),
      }
      if (tab === "ONLINE") {
        await createOnlineContract(propertyId, payload)
      } else {
        await createOfflineContract(propertyId, payload)
      }
      toast("สร้างสัญญาเช่าสำเร็จ", "success")
      onSuccess()
    } catch (e: any) {
      toast(e?.response?.data?.error ?? "เกิดข้อผิดพลาด", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const roomOptions = rooms.map((r) => ({
    value: r.id,
    label: r.roomTypeName ? `ห้อง ${r.roomNumber} — ${r.roomTypeName}` : `ห้อง ${r.roomNumber}`,
  }))
  const bookingOptions = [
    { value: "__none__", label: "ไม่เลือก — กรอกเองทั้งหมด" },
    ...bookings.map((b) => ({ value: b.id, label: `${b.firstName} ${b.lastName} — ห้อง ${b.roomNumber}` })),
  ]

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="สร้างสัญญาใหม่"
      description="เพิ่มสัญญาเช่าให้กับผู้เช่าของคุณ"
      size="xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

        {/* Tabs */}
        <TabBar tabs={CONTRACT_TABS} value={tab} onChange={(v) => setTab(v as "ONLINE" | "OFFLINE")} />

        {/* Booking selection (online only) */}
        {tab === "ONLINE" && (
          <div className="border border-blue-200 rounded-xl p-4 bg-blue-50 space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <RiCalendarLine className="text-blue-500" size={15} />
              <p className="text-sm font-semibold text-blue-800">เลือกจากการจอง</p>
            </div>
            <SelectInput
              placeholder="เลือกการจอง (ถ้ามี)"
              options={bookingOptions}
              value={selectedBookingId}
              onValueChange={handleBookingSelect}
            />
          </div>
        )}

        {/* ชื่อ | นามสกุล */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="ชื่อ *" value={form.firstName} onChange={set("firstName")} placeholder="ชื่อ" />
          <FormInput label="นามสกุล *" value={form.lastName} onChange={set("lastName")} placeholder="นามสกุล" />
        </div>

        {/* บ้านเลขที่ | ซอย */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="บ้านเลขที่" value={form.houseNumber} onChange={set("houseNumber")} placeholder="123/45 หมู่(ถ้ามี)" />
          <FormInput label="ซอย" value={form.soi} onChange={set("soi")} placeholder="ลาดพร้าว 101" />
        </div>

        {/* ถนน | ตำบล/แขวง */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="ถนน" value={form.road} onChange={set("road")} placeholder="ลาดพร้าว" />
          <FormInput label="ตำบล/แขวง" value={form.subDistrict} onChange={set("subDistrict")} placeholder="คลองจั่น" />
        </div>

        {/* อำเภอ/เขต | จังหวัด */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="อำเภอ/เขต" value={form.district} onChange={set("district")} placeholder="บางกะปิ" />
          <FormInput label="จังหวัด" value={form.province} onChange={set("province")} placeholder="กรุงเทพมหานคร" />
        </div>

        {/* โทรศัพท์ | อีเมล */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="โทรศัพท์มือถือ" value={form.phone} onChange={set("phone")} placeholder="0812345678" />
          <FormInput label="อีเมล *" type="email" value={form.email} onChange={set("email")} placeholder="example@email.com" />
        </div>

        {/* LINE ID | ห้อง */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="LINE ID" value={form.lineId} onChange={set("lineId")} placeholder="@lineid" />
          <SelectInput
            label="ห้อง *"
            placeholder="เลือกห้อง"
            options={roomOptions}
            value={form.roomId}
            onValueChange={handleRoomSelect}
          />
        </div>

        {/* ประเภทห้อง (auto) | ระยะเวลาสัญญา */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ประเภทห้อง <span className="text-xs font-normal text-gray-400">(อัตโนมัติ)</span>
            </label>
            <div className={`w-full px-3 py-2.5 text-sm border rounded-lg ${
              roomTypeName
                ? "border-purple-200 bg-purple-50 text-purple-700 font-medium"
                : "border-gray-200 bg-gray-50 text-gray-400"
            }`}>
              {roomTypeName || "— เลือกห้องก่อน —"}
            </div>
          </div>
          <SelectInput
            label="ระยะเวลาสัญญา *"
            placeholder="เลือกระยะเวลา"
            options={DURATION_OPTIONS}
            value={duration}
            onValueChange={setDuration}
          />
        </div>

        {/* วันเริ่มสัญญา | เงินมัดจำ */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="วันที่เริ่มสัญญา *" type="date" value={form.startDate} onChange={set("startDate")} />
          <FormInput label="เงินมัดจำ (บาท)" type="number" value={form.securityDeposit} onChange={set("securityDeposit")} placeholder="0" />
        </div>

        {/* คำนวณวันสิ้นสุด (แสดงผล) */}
        {computedEndDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700">
            วันสิ้นสุดสัญญา: <span className="font-semibold">{fmtDate(computedEndDate)}</span>
          </div>
        )}

        {/* ประเภทรถ | ทะเบียนรถ */}
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="ประเภทรถ"
            placeholder="เลือกประเภทรถ"
            options={VEHICLE_TYPE_OPTIONS}
            value={vehicleType}
            onValueChange={setVehicleType}
          />
          <FormInput
            label="ทะเบียนรถ"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            placeholder="กข 1234 กรุงเทพมหานคร"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting}
            className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60">
            {isSubmitting ? "กำลังสร้าง..." : "สร้างสัญญา"}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Contract Detail Modal (view only) ─────────────────────────────────────
function ContractDetailModal({ open, onClose, propertyId, contractId }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
  contractId: string
}) {
  const [detail, setDetail] = useState<ContractDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    getContractDetail(propertyId, contractId)
      .then(setDetail)
      .finally(() => setIsLoading(false))
  }, [open, propertyId, contractId])

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="รายละเอียดสัญญาเช่า"
      description="ข้อมูลของสัญญาเช่าทั้งหมด"
      size="xl"
    >
      {isLoading || !detail ? (
        <div className="py-12 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

          {/* ข้อมูลสัญญา */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">ข้อมูลสัญญา</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">ประเภทสัญญา</p>
                <StatusBadge status={detail.contractType} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">สถานะ</p>
                <StatusBadge status={detail.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ระยะเวลา</p>
                <p className="text-sm font-medium text-gray-800">{detail.duration}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">วันที่เริ่มสัญญา</p>
                <p className="text-sm font-medium text-gray-800">{fmtDate(detail.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">วันที่สิ้นสุดสัญญา</p>
                <p className="text-sm font-medium text-gray-800">{fmtDate(detail.endDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">วันที่สร้างสัญญา</p>
                <p className="text-sm font-medium text-gray-800">{fmtDate(detail.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* ข้อมูลผู้เช่า */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">ข้อมูลผู้เช่า</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">ชื่อ-นามสกุล</p>
                <p className="text-sm font-medium text-gray-800">{detail.user.firstName} {detail.user.lastName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">เบอร์โทรศัพท์</p>
                <p className="text-sm font-medium text-gray-800">{detail.user.phone ?? "—"}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* ข้อมูลห้องพัก */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">ข้อมูลห้องพัก</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">ห้อง</p>
                <p className="text-sm font-medium text-gray-800">{detail.room.roomNumber}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ประเภทห้อง</p>
                <p className="text-sm font-medium text-gray-800">{detail.room.roomType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ค่าเช่า/เดือน</p>
                <p className="text-sm font-medium text-gray-800">฿{detail.room.roomPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* ข้อมูลยานพาหนะ */}
          {detail.vehicles.length > 0 && (
            <>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">ข้อมูลยานพาหนะ</p>
                {detail.vehicles.map((v, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ประเภทยานพาหนะ</p>
                      <p className="text-sm font-medium text-gray-800">{v.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ทะเบียนรถ</p>
                      <p className="text-sm font-medium text-gray-800">{v.plateNumber}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="border-t border-gray-100" />

          {/* ข้อมูลทางการเงิน */}
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-3">ข้อมูลทางการเงิน</p>
            <div className="space-y-1.5">
              <SummaryRow label="เงินประกันความเสียหาย + ค่าเช่าล่วงหน้า" value={`฿${detail.financial.securityDeposit.toLocaleString()}`} bold />
              <SummaryRow label="ค่าน้ำ (ต่อหน่วย)" value={`฿${detail.financial.waterRate.toLocaleString()}`} />
              <SummaryRow label="ค่าไฟ (ต่อหน่วย)" value={`฿${detail.financial.electricRate.toLocaleString()}`} />
              {detail.financial.furniturePrice != null && (
                <SummaryRow label="ค่าเฟอร์นิเจอร์" value={`฿${detail.financial.furniturePrice.toLocaleString()}`} />
              )}
            </div>
          </div>

          {/* PDF section */}
          <div className="border-t border-gray-100 pt-1">
            <p className="text-sm font-semibold text-gray-900 mb-3">เอกสารสัญญา</p>
            {detail.pdfUrl ? (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-center gap-3">
                  <RiFilePdf2Line className="text-red-500" size={22} />
                  <span className="text-sm text-gray-700">ไฟล์สัญญา PDF</span>
                </div>
                <a
                  href={detail.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-purple-200 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <RiExternalLinkLine size={12} /> ดูสัญญา PDF
                </a>
              </div>
            ) : (
              <div className="border border-dashed border-gray-200 rounded-xl px-4 py-4 text-center">
                <RiFilePdf2Line className="text-gray-300 mx-auto mb-1" size={24} />
                <p className="text-xs text-gray-400">ยังไม่มีไฟล์สัญญา</p>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1 border-t border-gray-100">
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

// ── Edit Contract Modal ────────────────────────────────────────────────────
const EDIT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ใช้งาน" },
  { value: "MOVE_OUT_NOTICE", label: "แจ้งย้ายออก" },
  { value: "ENDED", label: "ออกแล้ว" },
]

function EditContractModal({ open, onClose, onSuccess, propertyId, contractId }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
  contractId: string
}) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState("ACTIVE")
  const [moveOutDate, setMoveOutDate] = useState("")
  const [moveOutDateError, setMoveOutDateError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [roomType, setRoomType] = useState("")
  const [duration, setDuration] = useState("")
  const [startDate, setStartDate] = useState("")
  const [vehicleType, setVehicleType] = useState("__none__")
  const [vehiclePlate, setVehiclePlate] = useState("")

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    getContractDetail(propertyId, contractId)
      .then((d) => {
        setStatus(d.status)
        setMoveOutDate(
          d.moveOutNoticeDate
            ? new Date(d.moveOutNoticeDate).toISOString().split("T")[0]
            : ""
        )
        setFirstName(d.user.firstName)
        setLastName(d.user.lastName)
        setRoomNumber(d.room.roomNumber)
        setRoomType(d.room.roomType)
        setDuration(d.duration)
        setStartDate(new Date(d.startDate).toISOString().split("T")[0])
        if (d.vehicles.length > 0) {
          setVehicleType(d.vehicles[0].type)
          setVehiclePlate(d.vehicles[0].plateNumber)
        } else {
          setVehicleType("__none__")
          setVehiclePlate("")
        }
      })
      .finally(() => setIsLoading(false))
  }, [open, propertyId, contractId])

  const computedEndDate = startDate && duration
    ? addMonths(startDate, parseInt(duration))
    : ""

  const handleSave = async () => {
    if (status === "MOVE_OUT_NOTICE" && !moveOutDate) {
      setMoveOutDateError("กรุณาระบุวันที่ออกคืนห้อง")
      return
    }
    setMoveOutDateError("")
    setIsSubmitting(true)
    try {
      const payload: Record<string, any> = {
        status,
        firstName,
        lastName,
        startDate,
        ...(computedEndDate ? { endDate: computedEndDate } : {}),
        ...(status === "MOVE_OUT_NOTICE" ? { moveOutNoticeDate: moveOutDate } : {}),
      }
      await updateContract(propertyId, contractId, payload)
      toast("บันทึกการแก้ไขสำเร็จ", "success")
      onSuccess()
    } catch (e: any) {
      toast(e?.response?.data?.error ?? "เกิดข้อผิดพลาด", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="แก้ไขสัญญาเช่า"
      description="แก้ไขข้อมูลสัญญาเช่า"
      size="lg"
    >
      {isLoading ? (
        <div className="py-12 text-center text-sm text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

          {/* สถานะสัญญา */}
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
            <SelectInput
              label="สถานะสัญญา"
              options={EDIT_STATUS_OPTIONS}
              value={status}
              onValueChange={setStatus}
            />
            <p className="text-xs text-orange-600">
              * เมื่อเปลี่ยนเป็น "แจ้งย้ายออก" จะทำให้สัญญาอยู่ในสถานะรอดำเนินการย้ายออก
            </p>
            {status === "MOVE_OUT_NOTICE" && (
              <FormInput
                label="วันที่ออกคืนห้อง *"
                type="date"
                value={moveOutDate}
                onChange={(e) => { setMoveOutDate(e.target.value); setMoveOutDateError("") }}
                error={moveOutDateError}
              />
            )}
          </div>

          {/* ชื่อ | นามสกุล */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="ชื่อ" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <FormInput label="นามสกุล" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          {/* ห้อง | ประเภทห้อง (read-only) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ห้อง</label>
              <div className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                {roomNumber}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ประเภทห้อง</label>
              <div className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500">
                {roomType}
              </div>
            </div>
          </div>

          {/* ระยะเวลาสัญญา | วันที่เริ่มสัญญา */}
          <div className="grid grid-cols-2 gap-3">
            <SelectInput
              label="ระยะเวลาสัญญา"
              options={DURATION_OPTIONS}
              value={duration.replace(" เดือน", "")}
              onValueChange={setDuration}
            />
            <FormInput label="วันที่เริ่มสัญญา" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          {computedEndDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700">
              วันสิ้นสุดสัญญา: <span className="font-semibold">{fmtDate(computedEndDate)}</span>
            </div>
          )}

          {/* ประเภทรถ | ทะเบียนรถ */}
          <div className="grid grid-cols-2 gap-3">
            <SelectInput
              label="ประเภทรถ"
              placeholder="เลือกประเภทรถ"
              options={VEHICLE_TYPE_OPTIONS}
              value={vehicleType}
              onValueChange={setVehicleType}
            />
            <FormInput
              label="ทะเบียนรถ"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              placeholder="กข 1234 กรุงเทพมหานคร"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={onClose}
              className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
              ยกเลิก
            </button>
            <button onClick={handleSave} disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60">
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Upload PDF Modal ───────────────────────────────────────────────────────
function UploadPdfModal({ open, onClose, onSuccess, propertyId, contractId }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
  contractId: string
}) {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      toast("กรุณาเลือกไฟล์ PDF เท่านั้น", "error")
      return
    }
    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) { toast("กรุณาเลือกไฟล์ก่อน", "error"); return }
    setIsUploading(true)
    try {
      const url = await uploadApi.uploadImage(selectedFile, "contracts")
      await uploadContractPdf(propertyId, contractId, url)
      toast("อัพโหลดสัญญา PDF สำเร็จ", "success")
      onSuccess()
    } catch {
      toast("อัพโหลดไม่สำเร็จ กรุณาลองใหม่", "error")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="อัพโหลดไฟล์สัญญา"
      description="เลือกไฟล์ PDF สัญญาเช่าเพื่ออัพโหลด"
      size="sm"
    >
      <div className="space-y-4">
        <label className="block">
          <div className={`border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-colors ${
            selectedFile ? "border-purple-300 bg-purple-50" : "border-gray-200 hover:border-purple-300"
          }`}>
            <RiFilePdf2Line className={`mx-auto mb-2 ${selectedFile ? "text-purple-500" : "text-gray-300"}`} size={32} />
            {selectedFile ? (
              <p className="text-sm font-medium text-purple-700">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-sm text-gray-500">คลิกเพื่อเลือกไฟล์ PDF</p>
                <p className="text-xs text-gray-400 mt-1">รองรับเฉพาะไฟล์ .pdf</p>
              </>
            )}
            <input type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />
          </div>
        </label>
        <div className="flex justify-end gap-3">
          <button onClick={onClose}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleUpload} disabled={!selectedFile || isUploading}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-60">
            <RiUpload2Line size={15} />
            {isUploading ? "กำลังอัพโหลด..." : "อัพโหลด"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
