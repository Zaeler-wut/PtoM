import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiMapPinLine, RiLogoutBoxLine, RiHome2Line, RiArrowRightLine, RiSearchLine } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProperties } from "../../store/slices/propertySlice";
import { logoutThunk } from "../../store/slices/authSlice";
import type { Property } from "../../types/property.types";

export default function PropertyListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, isLoading } = useAppSelector((s) => s.property);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState("");

  useEffect(() => { dispatch(fetchProperties()); }, [dispatch]);

  const filtered = list.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center">
              <RiHome2Line className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ระบบจัดการห้องเช่ารายเดือน</h1>
              <p className="text-sm text-violet-600">เลือกสถานที่ที่ต้องการจัดการ</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RiLogoutBoxLine className="text-base" />
            ออกจากระบบ
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Search */}
        <div className="relative mb-8 max-w-sm">
          <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาสถานที่..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-violet-400 transition-colors"
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20 text-sm">ไม่พบสถานที่</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((p) => <PropertyCard key={p.id} property={p} onClick={() => navigate(`/properties/${p.id}/dashboard`)} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyCard({ property, onClick }: { property: Property; onClick: () => void }) {
  const coverImage = property.images?.find((img) => img.isCover)?.url ?? property.images?.[0]?.url;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow group"
    >
      {/* Cover */}
      <div
        className="h-40 bg-violet-50 flex items-center justify-center"
        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {!coverImage && <RiHome2Line className="text-violet-200 text-5xl" />}
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-violet-600 text-lg leading-tight">{property.name}</h3>
          <RiArrowRightLine className="text-gray-300 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-1" />
        </div>
        <div className="flex items-start gap-1 mb-4">
          <RiMapPinLine className="text-gray-400 text-sm flex-shrink-0 mt-0.5" />
          <p className="text-gray-400 text-xs leading-relaxed">{property.address}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "ทั้งหมด", value: 0 },
            { label: "ว่าง", value: 0 },
            { label: "จอง", value: 0 },
            { label: "มีผู้เช่า", value: 0 },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2">
              <RiHome2Line className="text-violet-400 text-sm" />
              <span className="text-gray-500 text-xs">{s.label}:</span>
              <span className="text-violet-600 text-sm font-semibold">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <span className="text-gray-400 text-sm flex items-center gap-1">
            <span className="text-violet-500">↗</span> รายได้/เดือน
          </span>
          <span className="text-violet-600 font-bold">฿{property.priceMax.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}