import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTenants } from "../../store/slices/tenantSlice";
import type { Tenant } from "../../types/tenant.types";
import { DataTable } from "../../components/shared/DataTable";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { RiEyeLine } from "react-icons/ri";
import { formatDate } from "../../utils/formatDate";

export default function TenantListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list: tenants, isLoading } = useAppSelector((s) => s.tenant);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (propertyId) dispatch(fetchTenants(propertyId));
  }, [propertyId, dispatch]);

  const filtered = tenants.filter((t) => {
    const name = `${t.user.firstName} ${t.user.lastName}`.toLowerCase();
    return name.includes(search.toLowerCase()) || (t.room?.roomNumber ?? "").includes(search);
  });

  const columns = [
    { key: "name", header: "ชื่อผู้เช่า", render: (t: Tenant) => (
      <div>
        <p className="font-medium text-gray-900">{t.user.firstName} {t.user.lastName}</p>
        <p className="text-xs text-gray-400">{t.user.email}</p>
      </div>
    )},
    { key: "room", header: "ห้อง", render: (t: Tenant) => <span>{t.room?.roomNumber ?? "—"}</span> },
    { key: "phone", header: "เบอร์โทร", render: (t: Tenant) => <span>{t.user.phone ?? "—"}</span> },
    { key: "end", header: "วันสิ้นสุดสัญญา", render: (t: Tenant) => <span>{formatDate(t.contract.endDate)}</span> },
    { key: "status", header: "สถานะ", render: (t: Tenant) => <StatusBadge status={t.contract.status} /> },
    { key: "actions", header: "", render: (t: Tenant) => (
      <button onClick={(e) => { e.stopPropagation(); navigate(`/properties/${propertyId}/tenants/${t.contractId}`); }}
        className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors">
        <RiEyeLine size={16} />
      </button>
    )},
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-purple-900 mb-6">ผู้เช่า</h1>
      <DataTable columns={columns} data={filtered} keyExtractor={(t) => t.contractId}
        isLoading={isLoading} searchable searchValue={search} onSearch={setSearch}
        searchPlaceholder="ค้นหาชื่อหรือเลขห้อง..." emptyMessage="ไม่พบผู้เช่า"
        onRowClick={(t) => navigate(`/properties/${propertyId}/tenants/${t.contractId}`)} />
    </div>
  );
}