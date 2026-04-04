import { useState } from "react";
import { Modal } from "../../components/shared/Modal";
import { BookingStatusBadge } from "../../components/booking/BookingStatusBadge";
import { BookingActionButtons } from "../../components/booking/BookingActionButtons";
import { SlipViewer } from "../../components/booking/SlipViewer";
import {
  RiSearchLine, RiArrowDownSLine, RiMoneyDollarCircleLine,
  RiCheckboxCircleLine, RiTimeLine, RiHome2Line,
  RiCheckLine, RiCloseCircleLine,
} from "react-icons/ri";

// ── Types ──────────────────────────────────────────────────────────────────
type BookingStatus = "รอการยืนยัน" | "จองสำเร็จ" | "เข้าอยู่แล้ว" | "ยกเลิก";

interface Booking {
  id: string;
  name: string;
  phone: string;
  email?: string;
  room: string;
  roomType: string;
  moveInDate: string;
  amount: number;
  status: BookingStatus;
  bookingFee: number;
  advanceRent: number;
  deposit: number;
  paidDate?: string;
  note?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_BOOKINGS: Booking[] = [
  { id: "1", name: "สมชาย ใจดี",   phone: "081-234-5678", room: "202", roomType: "Deluxe", moveInDate: "10 มี.ค. 2569", amount: 1000, status: "รอการยืนยัน", bookingFee: 1000, advanceRent: 3000, deposit: 3000, paidDate: "21/2/2569" },
  { id: "2", name: "สมหญิง รักษ์ดี", phone: "082-345-6789", email: "somying@example.com", room: "203", roomType: "Deluxe", moveInDate: "5 มี.ค. 2569",  amount: 1000, status: "จองสำเร็จ",   bookingFee: 1000, advanceRent: 3000, deposit: 3000, paidDate: "21/2/2569", note: "ห้องถูกล็อคแล้ว รอลูกค้ามาทำสัญญาวันที่ 5 มี.ค." },
  { id: "3", name: "วิชัย มั่นคง",  phone: "083-456-7890", room: "301", roomType: "Suite",  moveInDate: "1 มี.ค. 2569",  amount: 1500, status: "จองสำเร็จ",   bookingFee: 1500, advanceRent: 6000, deposit: 6000 },
  { id: "4", name: "ประภา สว่างใส", phone: "084-567-8901", room: "303", roomType: "Deluxe", moveInDate: "20 ก.พ. 2569", amount: 1000, status: "เข้าอยู่แล้ว", bookingFee: 1000, advanceRent: 3000, deposit: 3000 },
];

const STATUS_OPTIONS = ["ทุกสถานะ", "รอการยืนยัน", "จองสำเร็จ", "เข้าอยู่แล้ว", "ยกเลิก"];

// ── Main Page ──────────────────────────────────────────────────────────────
export default function BookingListPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ทุกสถานะ");
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null);
  const [slipModal, setSlipModal] = useState(false);

  const filtered = MOCK_BOOKINGS.filter(b => {
    const matchSearch = b.name.includes(search) || b.phone.includes(search) || b.room.includes(search);
    const matchStatus = statusFilter === "ทุกสถานะ" || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">การจอง</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการการจองห้องและติดตามสถานะการชำระเงิน</p>
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3 mb-4 bg-white border border-gray-300 rounded-2xl px-6 py-5 shadow-sm mb-6">
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อผู้จอง, เบอร์โทร..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl outline-none focus:border-purple-400 bg-white transition-colors" />
          </div>
          <div className="relative">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400 bg-white cursor-pointer min-w-[160px]">
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
            <RiArrowDownSLine className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Booking Table */}
        <div className="bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4">
            <p className="text-base font-semibold text-gray-700">รายการจอง ({filtered.length})</p>
          </div>
          <div className="mx-6 mb-5 mt-4 rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50/50 border-b border-gray-200">
                <tr>
                  {["ผู้จอง", "เบอร์โทร", "ห้อง", "ประเภทห้อง", "วันที่เข้าอยู่", "จำนวนเงิน", "สลิปโอนเงิน", "สถานะ", "จัดการ"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900">{b.name}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{b.phone}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-600">{b.room}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{b.roomType}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-600">{b.moveInDate}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">฿{b.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <SlipViewer onClick={() => setSlipModal(true)} />
                    </td>
                    <td className="px-4 py-3.5">
                      <BookingStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <BookingActionButtons
                        status={b.status}
                        onDetail={() => setDetailBooking(b)}
                        onConfirm={() => {}}
                        onCancel={() => {}}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      {detailBooking && (
        <BookingDetailModal booking={detailBooking} onClose={() => setDetailBooking(null)} />
      )}

      {/* Slip Modal */}
      {slipModal && (
        <Modal open={slipModal} onOpenChange={(o) => !o && setSlipModal(false)}
          title="สลิปการชำระเงิน" description="ภาพสลิปการชำระเงิน" size="md">
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800"
              alt="slip"
              className="w-full object-cover rounded-xl"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── Booking Detail Modal ───────────────────────────────────────────────────
function BookingDetailModal({ booking: b, onClose }: { booking: Booking; onClose: () => void }) {
  const totalDue = b.advanceRent + b.deposit - b.bookingFee;

  return (
    <Modal open={true} onOpenChange={(o) => !o && onClose()}
      title="รายละเอียดการจอง" description="ข้อมูลการจองและสถานะการชำระเงิน" size="md">
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1">

        {/* ข้อมูลผู้จอง */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">ผู้จอง</p>
            <p className="text-sm font-semibold text-gray-900">{b.name}</p>
            <p className="text-xs text-gray-500">{b.phone}</p>
            {b.email && <p className="text-xs text-gray-500">{b.email}</p>}
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">ห้อง</p>
            <p className="text-sm font-semibold text-gray-900">{b.room}</p>
            <p className="text-xs text-gray-500">{b.roomType}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">วันที่จอง</p>
            <p className="text-sm text-gray-900">{b.paidDate ?? "-"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">วันที่เข้าอยู่</p>
            <p className="text-sm text-gray-900">{b.moveInDate}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">สถานะ</p>
            <BookingStatusBadge status={b.status} />
          </div>
        </div>

        {/* รายละเอียดการชำระเงิน */}
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="bg-gray-50 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
            <RiMoneyDollarCircleLine className="text-gray-500" size={14} />
            <p className="text-sm font-semibold text-gray-700">รายละเอียดการชำระเงิน</p>
          </div>

          {/* Step 1 — เงินมัดจำ */}
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
                <span className="text-gray-500">ชำระเมื่อ {b.paidDate}</span>
                <span className="font-medium text-gray-900">฿{b.bookingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">สลิปการชำระเงิน</span>
                <SlipViewer />
              </div>
            </div>
          </div>

          {/* Step 2 — ค่าใช้จ่ายวันเข้าอยู่ */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-5 h-5 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center font-bold">2</span>
              <p className="text-sm font-semibold text-gray-800">ค่าใช้จ่ายวันเข้าอยู่</p>
            </div>
            <div className="ml-7 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ค่าเช่าล่วงหน้า</span>
                <span className="text-gray-900">฿{b.advanceRent.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">ค่าประกันความเสียหาย</span>
                <span className="text-gray-900">฿{b.deposit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-red-500 font-medium">
                <span>หักเงินมัดจำจากการจอง</span>
                <span>-฿{b.bookingFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-green-700 bg-green-50 rounded-lg px-3 py-2 mt-2">
                <span>ยอดที่ต้องชำระจริง (รอบที่ 2)</span>
                <span>฿{totalDue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ยอดชำระทั้งหมด */}
        <div className="bg-gray-900 rounded-xl px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-white">ยอดชำระทั้งหมด</span>
          <div className="text-right">
            <p className="text-lg font-bold text-white">฿{b.bookingFee.toLocaleString()}</p>
            <p className="text-xs text-gray-400">จากทั้งหมด ฿{(b.advanceRent + b.deposit).toLocaleString()}</p>
          </div>
        </div>

        {/* หมายเหตุ */}
        {b.note && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p className="text-xs text-gray-400 mb-1">หมายเหตุ</p>
            <p className="text-sm text-blue-800">{b.note}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}