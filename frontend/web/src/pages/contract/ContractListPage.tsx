import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  RiAddLine, RiSearchLine, RiFilterLine,
  RiFileTextLine, RiEditLine, RiLogoutBoxLine,
} from "react-icons/ri"
import { Modal } from "../../components/shared/Modal"
import { FormInput } from "../../components/shared/FormInput"
import { SelectInput } from "../../components/shared/SelectInput"
import { StatusBadge } from "../../components/shared/StatusBadge"
import { SummaryRow } from "../../components/shared/SummaryRow"
import { useToast } from "../../components/shared/Toast"
import {
  getContracts,
  getContractDetail,
  createOfflineContract,
  updateContract,
} from "../../api/contract/contractApi"
import { Pagination } from "../../components/shared/Pagination"
import { getRooms } from "../../api/room/roomApi"
import { getBookings, getContractPrefill } from "../../api/booking/bookingApi"
import type { BookingListItem } from "../../types/booking.types"
import type {
  ContractStatus,
  ContractListItem,
  ContractDetail,
  CreateContractInput,
} from "../../types/contract.types"

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_FILTER_OPTIONS = [
  { value: "CURRENT", label: "ปัจจุบัน" },
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "ACTIVE", label: "ใช้งาน" },
  { value: "MOVE_OUT_NOTICE", label: "แจ้งย้ายออก" },
  { value: "ENDED", label: "ออกแล้ว" },
]

const DURATION_OPTIONS = [
  { value: "6", label: "6 เดือน" },
  { value: "12", label: "12 เดือน" },
  { value: "18", label: "18 เดือน" },
  { value: "24", label: "24 เดือน" },
]

const VEHICLE_TYPE_OPTIONS = [
  { value: "__none__", label: "ไม่มียานพาหนะ" },
  { value: "รถยนต์", label: "รถยนต์" },
  { value: "รถมอเตอร์ไซค์", label: "รถมอเตอร์ไซค์" },
]

const EDIT_STATUS_OPTIONS = [
  { value: "ACTIVE", label: "ใช้งาน" },
  { value: "MOVE_OUT_NOTICE", label: "แจ้งย้ายออก" },
  { value: "ENDED", label: "ออกแล้ว" },
]

// ── Helpers ────────────────────────────────────────────────────────────────
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH")
}

function addMonths(dateStr: string, months: number): string {
  const d = new Date(dateStr)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split("T")[0]
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function ContractListPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const [contracts, setContracts] = useState<ContractListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("CURRENT")
  const [createModal, setCreateModal] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [moveOutId, setMoveOutId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

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
    const matchStatus =
      statusFilter === "ALL" ||
      (statusFilter === "CURRENT" ? c.status === "ACTIVE" || c.status === "MOVE_OUT_NOTICE" : c.status === statusFilter)
    return matchSearch && matchStatus
  })

  useEffect(() => { setPage(1) }, [search, statusFilter])
  const pagedFiltered = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

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
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-gray-200 bg-gray-50/50">
                <tr>
                  {[
                    { label: "ห้อง" },
                    { label: "ผู้เช่า" },
                    { label: "สถานะ" },
                    { label: "วันเริ่มสัญญา" },
                    { label: "วันสิ้นสุดสัญญา" },
                    { label: "ระยะเวลา" },
                    { label: "จัดการ" },
                  ].map((h) => (
                    <th key={h.label} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-8 text-sm text-gray-400 text-center">ไม่พบสัญญาเช่า</td></tr>
                ) : pagedFiltered.map((c) => (
                  <tr key={c.contractId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{c.roomNumber}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-800 whitespace-nowrap">
                      {c.firstName} {c.lastName}
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
                        {c.status === "ACTIVE" && (
                          <button
                            onClick={() => setMoveOutId(c.contractId)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-orange-200 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                          >
                            <RiLogoutBoxLine size={12} /> แจ้งออก
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination total={filtered.length} page={page} rowsPerPage={rowsPerPage} onPageChange={setPage} onRowsPerPageChange={setRowsPerPage} />
        </div>
      </div>

      {/* Create modal */}
      <CreateContractModal
        open={createModal}
        onClose={() => setCreateModal(false)}
        onSuccess={() => { setCreateModal(false); load() }}
        propertyId={propertyId!}
      />

      {/* Detail modal */}
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

      {/* Move-out modal */}
      {moveOutId && (
        <MoveOutModal
          open
          onClose={() => setMoveOutId(null)}
          onSuccess={() => { setMoveOutId(null); load() }}
          propertyId={propertyId!}
          contractId={moveOutId}
        />
      )}
    </div>
  )
}

// ── Create Contract Modal ──────────────────────────────────────────────────
function CreateContractModal({ open, onClose, onSuccess, propertyId }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
}) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [source, setSource] = useState<"manual" | "booking">("manual")
  const [rooms, setRooms] = useState<{ id: string; roomNumber: string; roomTypeName: string; securityDeposit: number; advanceRent: number }[]>([])
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [loadingPrefill, setLoadingPrefill] = useState(false)
  const [roomTypeName, setRoomTypeName] = useState("")
  const [duration, setDuration] = useState("")
  const [vehiclePlate, setVehiclePlate] = useState("")
  const [vehicleType, setVehicleType] = useState("__none__")
  const [bookingId, setBookingId] = useState("")
  const [form, setForm] = useState({
    firstName: "", lastName: "", email: "", phone: "", lineId: "",
    roomId: "", startDate: "", securityDeposit: "",
  })

  useEffect(() => {
    if (!open) return
    setSource("manual")
    setForm({ firstName: "", lastName: "", email: "", phone: "", lineId: "", roomId: "", startDate: "", securityDeposit: "" })
    setRoomTypeName(""); setDuration(""); setVehiclePlate(""); setVehicleType("__none__")
    setBookingId(""); setBookings([])
    getRooms(propertyId)
      .then((roomList) => {
        setRooms((roomList as any[])
          .filter((r) => r.status === "AVAILABLE" || r.status === "RESERVED" || r.status === "PREPARING")
          .map((r: any) => ({ id: r.id, roomNumber: r.roomNumber, roomTypeName: r.roomType ?? "", securityDeposit: r.securityDeposit ?? 0, advanceRent: r.advanceRent ?? 0 }))
        )
      }).catch(() => {})
  }, [open, propertyId])

  useEffect(() => {
    if (source !== "booking" || !open) return
    setLoadingBookings(true)
    getBookings(propertyId)
      .then((data) => setBookings(data.filter((b) => b.status === "CONFIRMED")))
      .catch(() => {})
      .finally(() => setLoadingBookings(false))
  }, [source, open, propertyId])

  const handleSourceChange = (s: "manual" | "booking") => {
    setSource(s)
    setBookingId("")
    setForm({ firstName: "", lastName: "", email: "", phone: "", lineId: "", roomId: "", startDate: "", securityDeposit: "" })
    setRoomTypeName(""); setDuration("")
  }

  const handleBookingSelect = async (bid: string) => {
    if (!bid) return
    setLoadingPrefill(true)
    try {
      const data = await getContractPrefill(propertyId, bid)
      setBookingId(data.bookingId)
      setForm((p) => ({
        ...p,
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        lineId: data.lineId ?? "",
        roomId: data.roomId ?? p.roomId,
        startDate: new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Bangkok" }),
        securityDeposit: data.securityDeposit ? String(data.securityDeposit) : p.securityDeposit,
      }))
      if (data.roomId) {
        const room = rooms.find((r) => r.id === data.roomId)
        setRoomTypeName(room?.roomTypeName ?? data.roomType ?? "")
      }
    } catch (e: any) {
      toast(e?.response?.data?.error ?? "ไม่สามารถดึงข้อมูลการจองได้", "error")
    } finally {
      setLoadingPrefill(false)
    }
  }

  const set = (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((p) => ({ ...p, [field]: e.target.value }))
      if (formErrors[field]) setFormErrors((p) => { const n = { ...p }; delete n[field]; return n })
    }

  const handleRoomSelect = (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId)
    setForm((p) => ({
      ...p,
      roomId,
      securityDeposit: room ? String(room.securityDeposit + room.advanceRent) : p.securityDeposit,
    }))
    setRoomTypeName(room?.roomTypeName ?? "")
  }

  const computedEndDate = form.startDate && duration
    ? addMonths(form.startDate, Number(duration))
    : ""

  const handleSubmit = async () => {
    const errs: Record<string, string> = {}
    if (!form.firstName) errs.firstName = "กรุณากรอกชื่อ"
    if (!form.lastName) errs.lastName = "กรุณากรอกนามสกุล"
    if (!form.email) errs.email = "กรุณากรอกอีเมล"
    if (!form.roomId) errs.roomId = "กรุณาเลือกห้อง"
    if (!duration) errs.duration = "กรุณาเลือกระยะเวลาสัญญา"
    if (!form.startDate) errs.startDate = "กรุณาเลือกวันที่เริ่มสัญญา"
    if (Object.keys(errs).length > 0) {
      setFormErrors(errs)
      return
    }
    setFormErrors({})
    setIsSubmitting(true)
    try {
      const payload: CreateContractInput = {
        ...form,
        endDate: computedEndDate,
        securityDeposit: Number(form.securityDeposit),
        ...(bookingId ? { bookingId } : {}),
        ...(vehiclePlate && vehicleType !== "__none__"
          ? { vehicles: [{ plateNumber: vehiclePlate, type: vehicleType }] }
          : {}),
      }
      await createOfflineContract(propertyId, payload)
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

  const bookingOptions = bookings.map((b) => ({
    value: b.bookingId,
    label: `${b.firstName} ${b.lastName} — ห้อง ${b.roomNumber} (${b.roomType})`,
  }))

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="สร้างสัญญาใหม่"
      description="เพิ่มสัญญาเช่าให้กับผู้เช่า"
      size="lg"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">

        {/* source selector */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">ประเภทการสร้างสัญญา</label>
          <div className="flex gap-3">
            <button type="button" onClick={() => handleSourceChange("manual")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                source === "manual"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              สร้างเอง
            </button>
            <button type="button" onClick={() => handleSourceChange("booking")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                source === "booking"
                  ? "bg-gray-900 text-white border-gray-900"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}>
              จากการจอง
            </button>
          </div>
        </div>

        {/* booking selector */}
        {source === "booking" && (
          <div className="space-y-2">
            {loadingBookings ? (
              <p className="text-sm text-gray-400">กำลังโหลดรายการจอง...</p>
            ) : bookingOptions.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-3">
                ไม่มีการจองที่ยืนยันแล้วรอสร้างสัญญา
              </p>
            ) : (
              <SelectInput
                label="เลือกการจอง"
                options={bookingOptions}
                placeholder="เลือกการจอง..."
                onValueChange={handleBookingSelect}
              />
            )}
            {loadingPrefill && <p className="text-sm text-gray-400">กำลังดึงข้อมูล...</p>}
          </div>
        )}

        <hr className="border-gray-100" />

        {/* ชื่อ | นามสกุล */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="ชื่อ *" required value={form.firstName} onChange={set("firstName")} placeholder="ชื่อ" error={formErrors.firstName} />
          <FormInput label="นามสกุล *" required value={form.lastName} onChange={set("lastName")} placeholder="นามสกุล" error={formErrors.lastName} />
        </div>

        {/* โทรศัพท์ | อีเมล */}
        <div className="grid grid-cols-2 gap-3">
          <FormInput label="เบอร์โทรศัพท์" value={form.phone} onChange={set("phone")} placeholder="0812345678" />
          <FormInput label="อีเมล *" required type="email" value={form.email} onChange={set("email")} placeholder="example@email.com" error={formErrors.email} />
        </div>

        {/* LINE ID */}
        <FormInput label="LINE ID" value={form.lineId} onChange={set("lineId")} placeholder="@lineid" />

        {/* ห้อง | ประเภทห้อง */}
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="ห้อง *"
            required
            placeholder="เลือกห้อง"
            options={roomOptions}
            value={form.roomId}
            onValueChange={handleRoomSelect}
            error={formErrors.roomId}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              ประเภทห้อง <span className="text-xs font-normal text-gray-400">(อัตโนมัติ)</span>
            </label>
            <div className={`w-full px-3 py-2.5 text-sm border rounded-lg ${
              roomTypeName
                ? "border-purple-200 bg-purple-50 text-purple-700 font-medium"
                : "border-gray-200 bg-gray-50 text-gray-400"
            }`}>
              {roomTypeName || "เลือกห้องก่อน"}
            </div>
          </div>
        </div>

        {/* ระยะเวลาสัญญา | วันเริ่มสัญญา */}
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="ระยะเวลาสัญญา *"
            required
            placeholder="เลือกระยะเวลา"
            options={DURATION_OPTIONS}
            value={duration}
            onValueChange={setDuration}
            error={formErrors.duration}
          />
          <FormInput label="วันที่เริ่มสัญญา *" required type="date" value={form.startDate} onChange={set("startDate")} error={formErrors.startDate} />
        </div>

        {computedEndDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-sm text-blue-700">
            วันสิ้นสุดสัญญา: <span className="font-semibold">{fmtDate(computedEndDate)}</span>
          </div>
        )}

        {/* เงินมัดจำ */}
        <FormInput
          label="เงินมัดจำ (บาท)"
          type="number"
          value={form.securityDeposit}
          onChange={set("securityDeposit")}
          placeholder="0"
        />

        {/* ประเภทรถ | ทะเบียนรถ */}
        <div className="grid grid-cols-2 gap-3">
          <SelectInput
            label="ประเภทรถ"
            options={VEHICLE_TYPE_OPTIONS}
            value={vehicleType}
            onValueChange={setVehicleType}
          />
          <FormInput
            label="ทะเบียนรถ"
            value={vehiclePlate}
            onChange={(e) => setVehiclePlate(e.target.value)}
            placeholder="กข 1234 กรุงเทพมหานคร"
            disabled={vehicleType === "__none__"}
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

// ── Contract Detail Modal ──────────────────────────────────────────────────
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
      size="lg"
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
                <p className="text-xs text-gray-400 mb-1">สถานะ</p>
                <StatusBadge status={detail.status} />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">ระยะเวลา</p>
                <p className="text-sm font-medium text-gray-800">{detail.duration}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">วันที่สร้าง</p>
                <p className="text-sm font-medium text-gray-800">{fmtDate(detail.createdAt)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">วันที่เริ่มสัญญา</p>
                <p className="text-sm font-medium text-gray-800">{fmtDate(detail.startDate)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">วันที่สิ้นสุดสัญญา</p>
                <p className="text-sm font-medium text-gray-800">{fmtDate(detail.endDate)}</p>
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
              <div>
                <p className="text-xs text-gray-400 mb-1">อีเมล</p>
                <p className="text-sm font-medium text-gray-800">{detail.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">LINE ID</p>
                <p className="text-sm font-medium text-gray-800">{detail.user.lineId ?? "—"}</p>
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
                <p className="text-sm font-medium text-gray-800">฿{(detail.room.roomPrice + (detail.financial.furniturePrice ?? 0)).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* ข้อมูลยานพาหนะ */}
          {detail.vehicles.length > 0 && (
            <>
              <div className="border-t border-gray-100" />
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-3">ยานพาหนะ</p>
                {detail.vehicles.map((v, i) => (
                  <div key={i} className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ประเภท</p>
                      <p className="text-sm font-medium text-gray-800">{v.type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 mb-1">ทะเบียน</p>
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
              <SummaryRow label="ประกัน + ล่วงหน้า" value={`฿${(detail.financial.securityDeposit + detail.financial.advanceRent).toLocaleString()}`} bold />
              <SummaryRow label="ค่าเช่าห้อง" value={`฿${detail.room.roomPrice.toLocaleString()}`} />
              {detail.financial.furniturePrice != null && (
                <SummaryRow label="ค่าเช่าเฟอร์นิเจอร์" value={`฿${detail.financial.furniturePrice.toLocaleString()}`} />
              )}
              <SummaryRow label="ค่าน้ำ (ต่อหน่วย)" value={`฿${detail.financial.waterRate.toLocaleString()}`} />
              <SummaryRow label="ค่าไฟ (ต่อหน่วย)" value={`฿${detail.financial.electricRate.toLocaleString()}`} />
            </div>
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
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [lineId, setLineId] = useState("")
  const [roomId, setRoomId] = useState("")
  const [roomTypeName, setRoomTypeName] = useState("")
  const [rooms, setRooms] = useState<{ id: string; roomNumber: string; roomTypeName: string }[]>([])
  const [duration, setDuration] = useState("")
  const [startDate, setStartDate] = useState("")
  const [vehicleType, setVehicleType] = useState("__none__")
  const [vehiclePlate, setVehiclePlate] = useState("")

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    Promise.all([
      getContractDetail(propertyId, contractId),
      getRooms(propertyId),
    ]).then(([d, roomList]) => {
        // โหลดห้องที่ AVAILABLE + ห้องปัจจุบัน
        const available = (roomList as any[])
          .filter((r) => r.status === "AVAILABLE" || r.id === d.room.roomId)
          .map((r: any) => ({ id: r.id, roomNumber: r.roomNumber, roomTypeName: r.roomType ?? "" }))
        setRooms(available)

        setStatus(d.status)
        setMoveOutDate(
          d.moveOutNoticeDate
            ? new Date(d.moveOutNoticeDate).toISOString().split("T")[0]
            : ""
        )
        setFirstName(d.user.firstName)
        setLastName(d.user.lastName)
        setEmail(d.user.email)
        setPhone(d.user.phone ?? "")
        setLineId(d.user.lineId ?? "")
        setRoomId(d.room.roomId)
        setRoomTypeName(d.room.roomType)
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

  const handleRoomSelect = (id: string) => {
    const room = rooms.find((r) => r.id === id)
    setRoomId(id)
    setRoomTypeName(room?.roomTypeName ?? "")
  }

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
      await updateContract(propertyId, contractId, {
        status: status as ContractStatus,
        firstName,
        lastName,
        email,
        phone,
        lineId,
        roomId,
        startDate,
        ...(computedEndDate ? { endDate: computedEndDate } : {}),
        ...(status === "MOVE_OUT_NOTICE" ? { moveOutNoticeDate: moveOutDate } : {}),
        vehicles: vehicleType !== "__none__" && vehiclePlate
          ? [{ plateNumber: vehiclePlate, type: vehicleType }]
          : [],
      })
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

          {/* โทรศัพท์ | อีเมล */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput label="เบอร์โทรศัพท์" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812345678" />
            <FormInput label="อีเมล" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          {/* LINE ID */}
          <FormInput label="LINE ID" value={lineId} onChange={(e) => setLineId(e.target.value)} placeholder="@lineid" />

          {/* ห้อง | ประเภทห้อง */}
          <div className="grid grid-cols-2 gap-3">
            <SelectInput
              label="ห้อง"
              options={rooms.map((r) => ({
                value: r.id,
                label: r.roomTypeName ? `ห้อง ${r.roomNumber} — ${r.roomTypeName}` : `ห้อง ${r.roomNumber}`,
              }))}
              value={roomId}
              onValueChange={handleRoomSelect}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                ประเภทห้อง <span className="text-xs font-normal text-gray-400">(อัตโนมัติ)</span>
              </label>
              <div className={`w-full px-3 py-2.5 text-sm border rounded-lg ${
                roomTypeName
                  ? "border-purple-200 bg-purple-50 text-purple-700 font-medium"
                  : "border-gray-200 bg-gray-50 text-gray-400"
              }`}>
                {roomTypeName || "—"}
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
              options={VEHICLE_TYPE_OPTIONS}
              value={vehicleType}
              onValueChange={setVehicleType}
            />
            <FormInput
              label="ทะเบียนรถ"
              value={vehiclePlate}
              onChange={(e) => setVehiclePlate(e.target.value)}
              placeholder="กข 1234 กรุงเทพมหานคร"
              disabled={vehicleType === "__none__"}
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

// ── Move-Out Modal ─────────────────────────────────────────────────────────
function MoveOutModal({ open, onClose, onSuccess, propertyId, contractId }: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  propertyId: string
  contractId: string
}) {
  const { toast } = useToast()
  const [moveOutDate, setMoveOutDate] = useState("")
  const [moveOutDateError, setMoveOutDateError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) { setMoveOutDate(""); setMoveOutDateError("") }
  }, [open])

  const handleSave = async () => {
    if (!moveOutDate) {
      setMoveOutDateError("กรุณาระบุวันที่ออกคืนห้อง")
      return
    }
    setMoveOutDateError("")
    setIsSubmitting(true)
    try {
      await updateContract(propertyId, contractId, {
        status: "MOVE_OUT_NOTICE",
        moveOutNoticeDate: moveOutDate,
      })
      toast("บันทึกการแจ้งออกสำเร็จ", "success")
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
      title="แจ้งออกห้อง"
      size="sm"
    >
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1.5">สถานะสัญญา</p>
            <div className="w-full px-3 py-2.5 text-sm border border-orange-200 bg-orange-50 text-orange-700 font-medium rounded-lg">
              แจ้งย้ายออก
            </div>
          </div>
          <FormInput
            label="วันที่ออกคืนห้อง *"
            type="date"
            value={moveOutDate}
            onChange={(e) => { setMoveOutDate(e.target.value); setMoveOutDateError("") }}
            error={moveOutDateError}
          />
        </div>
        <div className="flex justify-end gap-3 pt-1">
          <button onClick={onClose} disabled={isSubmitting}
            className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
            ยกเลิก
          </button>
          <button onClick={handleSave} disabled={isSubmitting}
            className="px-6 py-2.5 bg-orange-500 text-white text-sm rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-60">
            {isSubmitting ? "กำลังบันทึก..." : "ยืนยันแจ้งออก"}
          </button>
        </div>
      </div>
    </Modal>
  )
}
