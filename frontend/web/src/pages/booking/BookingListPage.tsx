import { useState, useEffect, useCallback } from "react"
import { useParams } from "react-router-dom"
import {
  RiSearchLine, RiFilterLine, RiCheckLine, RiCloseLine,
  RiEyeLine, RiImageLine, RiMoneyDollarCircleLine, RiCheckboxCircleLine,
} from "react-icons/ri"
import { Modal } from "../../components/shared/Modal"
import { SelectInput } from "../../components/shared/SelectInput"
import { useToast } from "../../components/shared/Toast"
import { Pagination } from "../../components/shared/Pagination"
import {
  getBookings, getBookingDetail, confirmBooking, cancelBooking,
} from "../../api/booking/bookingApi"
import type { BookingListItem, BookingDetail } from "../../types/booking.types"

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  PENDING:    { bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400", label: "รอการยืนยัน" },
  CONFIRMED:  { bg: "bg-blue-100",   text: "text-blue-700",   dot: "bg-blue-400",   label: "จองสำเร็จ" },
  CHECKED_IN: { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-400",  label: "เข้าอยู่แล้ว" },
  CANCELLED:  { bg: "bg-gray-100",   text: "text-gray-500",   dot: "bg-gray-400",   label: "ยกเลิก" },
}

const STATUS_OPTIONS = [
  { value: "ALL",        label: "ทุกสถานะ" },
  { value: "PENDING",    label: "รอการยืนยัน" },
  { value: "CONFIRMED",  label: "จองสำเร็จ" },
  { value: "CHECKED_IN", label: "เข้าอยู่แล้ว" },
  { value: "CANCELLED",  label: "ยกเลิก" },
]

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? { bg: "bg-gray-100", text: "text-gray-500", dot: "bg-gray-400", label: status }
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BookingListPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const { toast } = useToast()

  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("PENDING")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [detailBookingId, setDetailBookingId] = useState<string | null>(null)
  const [slipUrl, setSlipUrl] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  const load = useCallback(() => {
    if (!propertyId) return
    setIsLoading(true)
    getBookings(propertyId)
      .then(setBookings)
      .finally(() => setIsLoading(false))
  }, [propertyId])

  useEffect(() => { load() }, [load])

  const filtered = bookings.filter((b) => {
    const name = `${b.firstName} ${b.lastName}`.toLowerCase()
    const matchSearch = name.includes(search.toLowerCase())
      || (b.phone ?? "").includes(search)
      || b.roomNumber.includes(search)
    const matchStatus = statusFilter === "ALL" || b.status === statusFilter
    return matchSearch && matchStatus
  })

  useEffect(() => { setPage(1) }, [search, statusFilter])
  const pagedFiltered = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage)

  const handleConfirm = async (bookingId: string) => {
    if (!propertyId) return
    setActionLoading(bookingId)
    try {
      await confirmBooking(propertyId, bookingId)
      toast("ยืนยันการจองสำเร็จ", "success")
      load()
    } catch (e: any) {
      toast(e?.response?.data?.error ?? "ไม่สามารถยืนยันการจองได้", "error")
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (bookingId: string, isConfirmed = false) => {
    const msg = isConfirmed
      ? "การจองนี้ได้รับการยืนยันแล้ว หากยกเลิก ค่าจองห้องจะไม่ได้รับคืน\nยืนยันการยกเลิกหรือไม่?"
      : "ยืนยันการยกเลิกการจองนี้?"
    if (!propertyId || !window.confirm(msg)) return
    setActionLoading(bookingId)
    try {
      await cancelBooking(propertyId, bookingId)
      toast("ยกเลิกการจองสำเร็จ", "success")
      load()
    } catch (e: any) {
      toast(e?.response?.data?.error ?? "ไม่สามารถยกเลิกการจองได้", "error")
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="bg-purple-50 min-h-screen p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">การจอง</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการการจองห้องพักและติดตามสถานะการชำระเงิน</p>
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <RiSearchLine className="text-gray-400 flex-shrink-0" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, เบอร์โทร, เลขห้อง..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <RiFilterLine className="text-gray-400 flex-shrink-0" size={18} />
            <div className="w-40">
              <SelectInput
                value={statusFilter}
                onValueChange={setStatusFilter}
                options={STATUS_OPTIONS}
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-700">รายการจอง ({isLoading ? "..." : filtered.length})</p>
          </div>
          <div className="overflow-x-auto mx-6 mb-5 mt-4 rounded-xl border border-gray-200">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  {["ชื่อ", "เบอร์โทร", "ห้อง", "ประเภทห้อง", "วันเข้าอยู่", "ค่าจอง", "สลิป", "สถานะ", "จัดการ"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-sm text-gray-400 text-center">ไม่พบรายการจอง</td></tr>
                ) : pagedFiltered.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{b.firstName} {b.lastName}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{b.phone ?? "-"}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-700">{b.roomNumber}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{b.roomType}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">
                      {new Date(b.moveInDate).toLocaleDateString("th-TH-u-ca-gregory")}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-800">
                      ฿{b.bookingFee.toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5">
                      {b.slipUrl ? (
                        <button
                          onClick={() => setSlipUrl(b.slipUrl)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <RiImageLine size={12} /> ดูสลิป
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        {b.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => handleConfirm(b.bookingId)}
                              disabled={actionLoading === b.bookingId}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-green-200 rounded-lg text-green-700 hover:bg-green-50 transition-colors disabled:opacity-60"
                            >
                              <RiCheckLine size={12} /> ยืนยัน
                            </button>
                            <button
                              onClick={() => handleCancel(b.bookingId)}
                              disabled={actionLoading === b.bookingId}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                            >
                              <RiCloseLine size={12} /> ยกเลิก
                            </button>
                          </>
                        )}
                        {(b.status === "CONFIRMED" || b.status === "CHECKED_IN") && (
                          <>
                            <button
                              onClick={() => setDetailBookingId(b.bookingId)}
                              className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                            >
                              <RiEyeLine size={12} /> ดูรายละเอียด
                            </button>
                            {b.status === "CONFIRMED" && (
                              <button
                                onClick={() => handleCancel(b.bookingId, true)}
                                disabled={actionLoading === b.bookingId}
                                className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
                              >
                                <RiCloseLine size={12} /> ยกเลิก
                              </button>
                            )}
                          </>
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

      {/* Detail Modal */}
      {detailBookingId && (
        <BookingDetailModal
          open={!!detailBookingId}
          onClose={() => setDetailBookingId(null)}
          propertyId={propertyId!}
          bookingId={detailBookingId}
          onViewSlip={(url) => setSlipUrl(url)}
        />
      )}

      {/* Slip Modal */}
      {slipUrl && (
        <Modal
          open={!!slipUrl}
          onOpenChange={(o) => !o && setSlipUrl(null)}
          title="สลิปการชำระเงิน"
          size="md"
        >
          <div className="flex justify-center">
            <img src={slipUrl} alt="slip" className="w-full object-contain rounded-xl max-h-[70vh]" />
          </div>
        </Modal>
      )}
    </div>
  )
}

// ── Booking Detail Modal ───────────────────────────────────────────────────
function BookingDetailModal({ open, onClose, propertyId, bookingId, onViewSlip }: {
  open: boolean
  onClose: () => void
  propertyId: string
  bookingId: string
  onViewSlip: (url: string) => void
}) {
  const [detail, setDetail] = useState<BookingDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!open) return
    setIsLoading(true)
    getBookingDetail(propertyId, bookingId)
      .then(setDetail)
      .finally(() => setIsLoading(false))
  }, [open, propertyId, bookingId])

  const totalDue = detail ? detail.advanceRent + detail.securityDeposit - detail.bookingFee : 0
  const totalAll = detail ? detail.advanceRent + detail.securityDeposit : 0

  return (
    <Modal
      open={open}
      onOpenChange={(o) => !o && onClose()}
      title="รายละเอียดการจอง"
      description="ข้อมูลการจองและสถานะการชำระเงิน"
      size="md"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">
        {isLoading || !detail ? (
          <p className="text-sm text-gray-400 text-center py-10">กำลังโหลด...</p>
        ) : (
          <>
            {/* ข้อมูลผู้เช่า */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">ผู้เช่า</p>
                <p className="text-sm font-semibold text-gray-900">{detail.firstName} {detail.lastName}</p>
                <p className="text-xs text-gray-500">{detail.phone ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">ห้อง</p>
                <p className="text-sm font-semibold text-gray-900">{detail.roomNumber}</p>
                <p className="text-xs text-gray-500">{detail.roomType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">วันที่จอง</p>
                <p className="text-sm text-gray-900">
                  {new Date(detail.bookingDate).toLocaleDateString("th-TH-u-ca-gregory")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">วันที่เข้าอยู่</p>
                <p className="text-sm text-gray-900">
                  {new Date(detail.moveInDate).toLocaleDateString("th-TH-u-ca-gregory")}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">สถานะ</p>
                <StatusBadge status={detail.status} />
              </div>
            </div>

            {/* รายละเอียดการชำระเงิน */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
                <RiMoneyDollarCircleLine className="text-gray-500" size={14} />
                <p className="text-sm font-semibold text-gray-700">รายละเอียดการชำระเงิน</p>
              </div>

              {/* Step 1 */}
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold">1</span>
                    <p className="text-sm font-semibold text-gray-800">เงินมัดจำ/เงินจอง</p>
                  </div>
                  <RiCheckboxCircleLine className="text-green-500" size={18} />
                </div>
                <div className="ml-7 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ค่าจอง</span>
                    <span className="font-medium text-gray-900">฿{detail.bookingFee.toLocaleString()}</span>
                  </div>
                  {detail.slipUrl && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">สลิปการชำระเงิน</span>
                      <button
                        onClick={() => onViewSlip(detail.slipUrl!)}
                        className="flex items-center gap-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <RiImageLine size={12} /> ดูสลิป
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2 */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold">2</span>
                  <p className="text-sm font-semibold text-gray-800">ค่าให้จ่ายวันเข้าอยู่</p>
                </div>
                <div className="ml-7 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ค่าเช่าล่วงหน้า</span>
                    <span className="text-gray-900">฿{detail.advanceRent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ค่าประกันความเสียหาย</span>
                    <span className="text-gray-900">฿{detail.securityDeposit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-red-500 font-medium">
                    <span>หักเงินมัดจำจากการจอง</span>
                    <span>-฿{detail.bookingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2">
                    <span>ยอดที่ต้องชำระ (รอบที่ 2)</span>
                    <span>฿{totalDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ยอดรวม */}
            <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white">ยอดชำระทั้งหมด</span>
              <div className="text-right">
                <p className="text-lg font-bold text-white">฿{detail.bookingFee.toLocaleString()}</p>
                <p className="text-xs text-gray-400">จากทั้งหมด ฿{totalAll.toLocaleString()}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
