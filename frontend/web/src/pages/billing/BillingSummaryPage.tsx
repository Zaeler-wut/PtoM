import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBillingSummary, fetchPayments, sendAllBills, setMonthYear } from "../../store/slices/billingSlice";
import type { Bill } from "../../types/billing.types";
import { DataTable } from "../../components/shared/DataTable";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { SummaryCard } from "../../components/shared/SummaryCard";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { RiBankCardLine, RiCheckboxCircleLine, RiTimeLine, RiMoneyDollarCircleLine } from "react-icons/ri";
import { formatCurrency } from "../../utils/formatCurrency";

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function BillingSummaryPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { summary, payments, month, year, isLoading } = useAppSelector((s) => s.billing);
  const [sendAllDialog, setSendAllDialog] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);

  // Promise.all: summary + payments
  useEffect(() => {
    if (!propertyId) return;
    Promise.all([
      dispatch(fetchBillingSummary({ propertyId, month, year })),
      dispatch(fetchPayments({ propertyId, month, year })),
    ]);
  }, [propertyId, month, year, dispatch]);

  const handleSendAll = async () => {
    if (!propertyId) return;
    setSendLoading(true);
    await dispatch(sendAllBills({ propertyId, month, year }));
    setSendLoading(false);
    setSendAllDialog(false);
    dispatch(fetchBillingSummary({ propertyId, month, year }));
  };

  const bills = summary?.bills ?? [];

  const columns = [
    { key: "room", header: "ห้อง", render: (b: Bill) => <span className="font-medium">{b.room?.roomNumber ?? "—"}</span> },
    { key: "tenant", header: "ผู้เช่า", render: (b: Bill) => <span>{b.user ? `${(b.user as any).firstName} ${(b.user as any).lastName}` : "—"}</span> },
    { key: "rent", header: "ค่าเช่า", render: (b: Bill) => <span>{formatCurrency(b.roomRent)}</span> },
    { key: "total", header: "รวม", render: (b: Bill) => <span className="font-semibold text-purple-700">{formatCurrency(b.total)}</span> },
    { key: "status", header: "สถานะ", render: (b: Bill) => <StatusBadge status={b.status} /> },
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900">ออกบิลรายเดือน</h1>
        <div className="flex items-center gap-3">
          {/* Month/Year Picker */}
          <select value={month} onChange={(e) => dispatch(setMonthYear({ month: Number(e.target.value), year }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => dispatch(setMonthYear({ month, year: Number(e.target.value) }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={() => setSendAllDialog(true)}
            className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            ส่งบิลทั้งหมด
          </button>
          <button onClick={() => navigate(`/properties/${propertyId}/billing/payments`)}
            className="px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
            ดูการชำระ
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard title="บิลทั้งหมด" value={summary?.totalBills ?? 0} subtitle="รายการ"
          icon={RiBankCardLine} bgColor="bg-purple-50/40" iconColor="text-purple-700" borderColor="border-purple-200" />
        <SummaryCard title="ชำระแล้ว" value={summary?.totalPaid ?? 0} subtitle="รายการ"
          icon={RiCheckboxCircleLine} bgColor="bg-green-50/40" iconColor="text-green-700" borderColor="border-green-200" />
        <SummaryCard title="รอชำระ" value={summary?.totalPending ?? 0} subtitle="รายการ"
          icon={RiTimeLine} bgColor="bg-orange-50/40" iconColor="text-orange-700" borderColor="border-orange-200" />
        <SummaryCard title="รายได้รวม" value={formatCurrency(summary?.totalRevenue ?? 0)} subtitle=""
          icon={RiMoneyDollarCircleLine} bgColor="bg-emerald-50/40" iconColor="text-emerald-700" borderColor="border-emerald-200" />
      </div>

      <DataTable columns={columns} data={bills} keyExtractor={(b) => b.id}
        isLoading={isLoading} emptyMessage="ไม่พบบิลเดือนนี้" />

      <ConfirmDialog open={sendAllDialog} onOpenChange={setSendAllDialog}
        title="ส่งบิลทั้งหมด"
        description={`ส่งบิลให้ผู้เช่าทุกห้องสำหรับเดือน ${MONTHS[month - 1]} ${year}?`}
        confirmLabel="ส่งบิล" isLoading={sendLoading} onConfirm={handleSendAll} />
    </div>
  );
}