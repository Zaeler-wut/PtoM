import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchPayments, confirmPayment, rejectPayment, setMonthYear } from "../../store/slices/billingSlice";
import type { Payment } from "../../types/billing.types";
import { DataTable } from "../../components/shared/DataTable";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { RiCheckLine, RiCloseLine } from "react-icons/ri";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

export default function PaymentListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const { payments, month, year, isLoading } = useAppSelector((s) => s.billing);
  const [dialog, setDialog] = useState<{ open: boolean; id: string; action: "confirm" | "reject" }>
    ({ open: false, id: "", action: "confirm" });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (propertyId) dispatch(fetchPayments({ propertyId, month, year }));
  }, [propertyId, month, year, dispatch]);

  const handleAction = async () => {
    if (!propertyId) return;
    setActionLoading(true);
    if (dialog.action === "confirm") await dispatch(confirmPayment({ propertyId, paymentId: dialog.id }));
    else await dispatch(rejectPayment({ propertyId, paymentId: dialog.id }));
    setActionLoading(false);
    setDialog({ open: false, id: "", action: "confirm" });
  };

  const columns = [
    { key: "tenant", header: "ผู้เช่า", render: (p: Payment) => (
      <span className="font-medium">{p.user ? `${(p.user as any).firstName} ${(p.user as any).lastName}` : "—"}</span>
    )},
    { key: "amount", header: "จำนวน", render: (p: Payment) => <span className="font-semibold text-purple-700">{formatCurrency(p.amount)}</span> },
    { key: "date", header: "วันที่", render: (p: Payment) => <span>{formatDate(p.createdAt)}</span> },
    { key: "slip", header: "สลิป", render: (p: Payment) => p.slipUrl
      ? <a href={p.slipUrl} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline text-sm" onClick={(e) => e.stopPropagation()}>ดูสลิป</a>
      : <span className="text-gray-400">—</span>
    },
    { key: "status", header: "สถานะ", render: (p: Payment) => <StatusBadge status={p.status} /> },
    { key: "actions", header: "", render: (p: Payment) => (
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        {p.status === "VERIFYING" && (
          <>
            <button onClick={() => setDialog({ open: true, id: p.id, action: "confirm" })}
              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors"><RiCheckLine size={16} /></button>
            <button onClick={() => setDialog({ open: true, id: p.id, action: "reject" })}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"><RiCloseLine size={16} /></button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900">การชำระเงิน</h1>
        <div className="flex gap-2">
          <select value={month} onChange={(e) => dispatch(setMonthYear({ month: Number(e.target.value), year }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => dispatch(setMonthYear({ month, year: Number(e.target.value) }))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={payments} keyExtractor={(p) => p.id}
        isLoading={isLoading} emptyMessage="ไม่พบรายการชำระเงิน" />

      <ConfirmDialog open={dialog.open} onOpenChange={(o) => !o && setDialog({ open: false, id: "", action: "confirm" })}
        title={dialog.action === "confirm" ? "ยืนยันการชำระเงิน" : "ปฏิเสธการชำระเงิน"}
        description={dialog.action === "confirm" ? "ยืนยันว่าได้รับเงินแล้ว?" : "ปฏิเสธและส่งกลับเป็น PENDING?"}
        confirmLabel={dialog.action === "confirm" ? "ยืนยัน" : "ปฏิเสธ"}
        variant={dialog.action === "reject" ? "danger" : "primary"}
        isLoading={actionLoading} onConfirm={handleAction} />
    </div>
  );
}