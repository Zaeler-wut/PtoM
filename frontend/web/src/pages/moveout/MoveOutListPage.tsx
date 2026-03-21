import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchMoveOuts, setYear, setStatusFilter } from "../../store/slices/moveoutSlice";
import type { MoveOutBill, MoveOutBillStatus } from "../../types/moveout.types";
import { DataTable } from "../../components/shared/DataTable";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { RiEyeLine } from "react-icons/ri";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";
import { MOVEOUT_STATUS_OPTIONS } from "../../utils/constants";

export default function MoveOutListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, year, statusFilter, isLoading } = useAppSelector((s) => s.moveout);

  useEffect(() => {
    if (!propertyId) return;
    const status = statusFilter !== "ALL" ? statusFilter as MoveOutBillStatus : undefined;
    dispatch(fetchMoveOuts({ propertyId, year, status }));
  }, [propertyId, year, statusFilter, dispatch]);

  const columns = [
    { key: "tenant", header: "ผู้เช่า", render: (m: MoveOutBill) => (
      <span className="font-medium">{m.user ? `${(m.user as any).firstName} ${(m.user as any).lastName}` : "—"}</span>
    )},
    { key: "room", header: "ห้อง", render: (m: MoveOutBill) => <span>{m.room?.roomNumber ?? "—"}</span> },
    { key: "date", header: "วันย้ายออก", render: (m: MoveOutBill) => <span>{formatDate(m.moveOutDate)}</span> },
    { key: "refund", header: "ยอดคืน", render: (m: MoveOutBill) => (
      <span className={m.refundAmount >= 0 ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
        {formatCurrency(m.refundAmount)}
      </span>
    )},
    { key: "status", header: "สถานะ", render: (m: MoveOutBill) => <StatusBadge status={m.status} /> },
    { key: "actions", header: "", render: (m: MoveOutBill) => (
      <button onClick={(e) => { e.stopPropagation(); navigate(`/properties/${propertyId}/move-out/${m.id}`); }}
        className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors">
        <RiEyeLine size={16} />
      </button>
    )},
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900">บิลแจ้งออก</h1>
        <div className="flex items-center gap-3">
          <select value={statusFilter} onChange={(e) => dispatch(setStatusFilter(e.target.value as MoveOutBillStatus | "ALL"))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400">
            {MOVEOUT_STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select value={year} onChange={(e) => dispatch(setYear(Number(e.target.value)))}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400">
            {[2024, 2025, 2026].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={list} keyExtractor={(m) => m.id}
        isLoading={isLoading} emptyMessage="ไม่พบรายการแจ้งออก"
        onRowClick={(m) => navigate(`/properties/${propertyId}/move-out/${m.id}`)} />
    </div>
  );
}