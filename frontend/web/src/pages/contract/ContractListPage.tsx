import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchContracts } from "../../store/slices/contractSlice";
import type { Contract } from "../../types/contract.types";
import { DataTable } from "../../components/shared/DataTable";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { RiAddLine, RiEyeLine } from "react-icons/ri";
import { formatDate } from "../../utils/formatDate";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ContractListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list: contracts, isLoading } = useAppSelector((s) => s.contract);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (propertyId) dispatch(fetchContracts(propertyId));
  }, [propertyId, dispatch]);

  const filtered = contracts.filter((c) => {
    const name = `${c.user?.firstName ?? ""} ${c.user?.lastName ?? ""}`.toLowerCase();
    const room = c.room?.roomNumber ?? "";
    return name.includes(search.toLowerCase()) || room.includes(search);
  });

  const columns = [
    { key: "tenant", header: "ผู้เช่า", render: (c: Contract) => (
      <span className="font-medium text-gray-900">{c.user?.firstName} {c.user?.lastName}</span>
    )},
    { key: "room", header: "ห้อง", render: (c: Contract) => <span>{c.room?.roomNumber ?? "—"}</span> },
    { key: "start", header: "วันเริ่ม", render: (c: Contract) => <span>{formatDate(c.startDate)}</span> },
    { key: "end", header: "วันสิ้นสุด", render: (c: Contract) => <span>{formatDate(c.endDate)}</span> },
    { key: "deposit", header: "เงินประกัน", render: (c: Contract) => <span>{formatCurrency(c.securityDeposit)}</span> },
    { key: "type", header: "ประเภท", render: (c: Contract) => <StatusBadge status={c.contractType} /> },
    { key: "status", header: "สถานะ", render: (c: Contract) => <StatusBadge status={c.status} /> },
    { key: "actions", header: "", render: (c: Contract) => (
      <button onClick={(e) => { e.stopPropagation(); navigate(`/properties/${propertyId}/contracts/${c.id}`); }}
        className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors">
        <RiEyeLine size={16} />
      </button>
    )},
  ];

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-purple-900">สัญญาเช่า</h1>
        <button onClick={() => navigate(`/properties/${propertyId}/contracts/create`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
          <RiAddLine size={16} /> สร้างสัญญาใหม่
        </button>
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(c) => c.id}
        isLoading={isLoading}
        searchable
        searchValue={search}
        onSearch={setSearch}
        searchPlaceholder="ค้นหาชื่อผู้เช่าหรือเลขห้อง..."
        emptyMessage="ไม่พบสัญญาเช่า"
        onRowClick={(c) => navigate(`/properties/${propertyId}/contracts/${c.id}`)}
      />
    </div>
  );
}