import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchBookings, confirmBooking, cancelBooking } from "../../store/slices/bookingSlice";
import type { Booking } from "../../types/booking.types";
import { DataTable } from "../../components/shared/DataTable";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { ConfirmDialog } from "../../components/shared/ConfirmDialog";
import { RiCheckLine, RiCloseLine, RiEyeLine } from "react-icons/ri";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

export default function BookingListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list: bookings, isLoading } = useAppSelector((s) => s.booking);

  const [search, setSearch] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; id: string; action: "confirm" | "cancel" }>
    ({ open: false, id: "", action: "confirm" });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (propertyId) dispatch(fetchBookings(propertyId));
  }, [propertyId, dispatch]);

  const filtered = bookings.filter((b) => {
    const name = `${b.user?.firstName ?? ""} ${b.user?.lastName ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  const handleAction = async () => {
    if (!propertyId) return;
    setActionLoading(true);
    if (confirmDialog.action === "confirm") {
      await dispatch(confirmBooking({ propertyId, bookingId: confirmDialog.id }));
    } else {
      await dispatch(cancelBooking({ propertyId, bookingId: confirmDialog.id }));
    }
    setActionLoading(false);
    setConfirmDialog({ open: false, id: "", action: "confirm" });
  };

  const columns = [
    { key: "tenant", header: "ผู้เช่า", render: (b: Booking) => (
      <span className="font-medium text-gray-900">{b.user?.firstName} {b.user?.lastName}</span>
    )},
    { key: "roomType", header: "ประเภทห้อง", render: (b: Booking) => <span>{b.roomType?.name ?? "—"}</span> },
    { key: "moveIn", header: "วันเข้าอยู่", render: (b: Booking) => <span>{formatDate(b.moveInDate)}</span> },
    { key: "fee", header: "ค่าจอง", render: (b: Booking) => <span>{formatCurrency(b.bookingFee)}</span> },
    { key: "status", header: "สถานะ", render: (b: Booking) => <StatusBadge status={b.status} /> },
    { key: "actions", header: "", render: (b: Booking) => (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <button onClick={() => navigate(`/properties/${propertyId}/bookings/${b.id}`)}
          className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors">
          <RiEyeLine size={16} />
        </button>
        {b.status === "PENDING" && (
          <>
            <button onClick={() => setConfirmDialog({ open: true, id: b.id, action: "confirm" })}
              className="p-1.5 text-gray-400 hover:text-green-600 transition-colors">
              <RiCheckLine size={16} />
            </button>
            <button onClick={() => setConfirmDialog({ open: true, id: b.id, action: "cancel" })}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
              <RiCloseLine size={16} />
            </button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-purple-900 mb-6">การจอง</h1>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(b) => b.id}
        isLoading={isLoading}
        searchable
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="ค้นหาชื่อผู้เช่า..."
        emptyMessage="ไม่พบการจอง"
        onRowClick={(b) => navigate(`/properties/${propertyId}/bookings/${b.id}`)}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(o) => !o && setConfirmDialog({ open: false, id: "", action: "confirm" })}
        title={confirmDialog.action === "confirm" ? "ยืนยันการจอง" : "ยกเลิกการจอง"}
        description={confirmDialog.action === "confirm" ? "ระบบจะทำการ assign ห้องให้อัตโนมัติ" : "การดำเนินการนี้ไม่สามารถย้อนกลับได้"}
        confirmLabel={confirmDialog.action === "confirm" ? "ยืนยัน" : "ยกเลิกการจอง"}
        variant={confirmDialog.action === "cancel" ? "danger" : "primary"}
        isLoading={actionLoading}
        onConfirm={handleAction}
      />
    </div>
  );
}