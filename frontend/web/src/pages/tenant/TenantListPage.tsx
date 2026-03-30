import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RiSearchLine, RiFilterLine, RiEyeLine } from "react-icons/ri";
import { SelectInput } from "../../components/shared/SelectInput";
import { getTenants } from "../../api/tenant/tenantApi";
import type { Tenant, ContractStatus } from "../../types/tenant.types";

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_MAP: Record<ContractStatus, { label: string; className: string }> = {
  ACTIVE:           { label: "กำลังเช่า",    className: "bg-green-100 text-green-700 border-green-200" },
  MOVE_OUT_NOTICE:  { label: "แจ้งออกแล้ว",  className: "bg-orange-100 text-orange-700 border-orange-200" },
  ENDED:            { label: "ออกแล้ว",      className: "bg-gray-100 text-gray-500 border-gray-200" },
};

const FILTER_OPTIONS = [
  { value: "ALL",             label: "ทุกสถานะ" },
  { value: "ACTIVE",          label: "กำลังเช่า" },
  { value: "MOVE_OUT_NOTICE", label: "แจ้งออกแล้ว" },
  { value: "ENDED",           label: "ออกแล้ว" },
];

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TenantListPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const navigate = useNavigate();

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  useEffect(() => {
    if (!propertyId) return;
    setIsLoading(true);
    getTenants(propertyId)
      .then(setTenants)
      .finally(() => setIsLoading(false));
  }, [propertyId]);

  const filtered = tenants.filter((t) => {
    const fullName = `${t.firstName} ${t.lastName}`.toLowerCase();
    const matchSearch =
      fullName.includes(search.toLowerCase()) ||
      (t.phone ?? "").includes(search) ||
      (t.lineId ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || t.contractStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="bg-purple-50 min-h-screen p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">ผู้เช่า</h1>
          <p className="text-sm text-gray-500 mt-1">จัดการข้อมูลผู้เช่าที่อยู่อาศัยในปัจจุบัน</p>
        </div>

        {/* Toolbar */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3">
            <RiSearchLine className="text-gray-400 flex-shrink-0" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, เบอร์โทร, อีเมล, Line ID..."
              className="flex-1 text-sm outline-none bg-transparent text-gray-700 placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <RiFilterLine className="text-gray-400 flex-shrink-0" size={18} />
            <div className="flex-1">
              <SelectInput value={statusFilter} onValueChange={setStatusFilter} options={FILTER_OPTIONS} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-base font-semibold text-gray-700">
              รายการผู้เช่า ({isLoading ? "..." : filtered.length})
            </p>
          </div>
          <div className="overflow-x-auto mx-6 mb-5 mt-4 rounded-xl border border-gray-200">
            <table className="w-full min-w-[700px]">
              <thead className="border-b border-gray-200 bg-gray-50/50">
                <tr>
                  {["ผู้เช่า", "เบอร์โทร", "Line ID", "ห้อง", "ประเภทห้อง", "สถานะ", "จัดการ"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-sm text-gray-400 text-center">กำลังโหลด...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={7} className="px-5 py-8 text-sm text-gray-400 text-center">ไม่พบผู้เช่า</td></tr>
                ) : filtered.map((t) => {
                  const status = STATUS_MAP[t.contractStatus] ?? STATUS_MAP.ENDED;
                  return (
                    <tr key={t.contractId} className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/properties/${propertyId}/tenants/${t.contractId}`)}>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-800">
                        {t.firstName} {t.lastName}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{t.phone ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{t.lineId ?? "—"}</td>
                      <td className="px-5 py-3.5 text-sm font-medium text-gray-700">{t.roomNumber}</td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{t.roomType}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${status.className}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/properties/${propertyId}/tenants/${t.contractId}`); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                          <RiEyeLine size={13} /> ดูข้อมูล
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
