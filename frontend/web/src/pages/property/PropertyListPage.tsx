import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RiMapPinLine, RiLogoutBoxLine, RiHome2Line, RiArrowRightLine, RiSearchLine, RiAddLine, RiDeleteBin6Line, RiAlertLine } from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchProperties, deleteProperty } from "../../store/slices/propertySlice";
import { logoutThunk } from "../../store/slices/authSlice";
import type { Property } from "../../types/property.types";

export default function PropertyListPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { list, isLoading } = useAppSelector((s) => s.property);
  const { user } = useAppSelector((s) => s.auth);
  const [search, setSearch] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => { dispatch(fetchProperties()); }, [dispatch]);

  const filtered = list.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(true);
    await dispatch(deleteProperty(confirmId));
    setDeleting(false);
    setConfirmId(null);
  };

  const confirmProperty = list.find((p) => p.id === confirmId);

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Confirm Delete Dialog */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <RiAlertLine className="text-red-500" size={20} />
              </div>
              <h3 className="text-base font-bold text-gray-900">ยืนยันการลบสถานที่</h3>
            </div>
            <p className="text-sm text-gray-500 mb-1">
              คุณต้องการลบ <span className="font-semibold text-gray-800">{confirmProperty?.name}</span> ใช่หรือไม่?
            </p>
            <p className="text-xs text-red-400 mb-5">ข้อมูลทั้งหมด ห้อง สัญญา บิล จะถูกลบถาวร</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2.5 text-sm bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {deleting ? "กำลังลบ..." : "ลบสถานที่"}
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600 flex items-center justify-center">
              <RiHome2Line className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">ระบบจัดการห้องเช่ารายเดือน</h1>
              <p className="text-sm text-violet-600">
                {user ? `สวัสดี, ${user.name}` : "เลือกสถานที่ที่ต้องการจัดการ"}
              </p>
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

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative flex-1 max-w-sm">
            <RiSearchLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาสถานที่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-violet-400 transition-colors"
            />
          </div>
          <button
            onClick={() => navigate("/properties/create")}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-colors whitespace-nowrap"
          >
            <RiAddLine size={18} />
            เพิ่มสถานที่
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-20 text-sm">ไม่พบสถานที่</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <PropertyCard
                key={p.id}
                property={p}
                onClick={() => navigate(`/properties/${p.id}/dashboard`)}
                onDelete={() => setConfirmId(p.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PropertyCard({ property, onClick, onDelete }: { property: Property; onClick: () => void; onDelete: () => void }) {
  const coverImage =
    property.images?.find((img) => img.isCover)?.url ??
    property.images?.[0]?.url ??
    property.coverImage ??
    null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow group"
    >
      <div
        className="h-40 bg-violet-50 flex items-center justify-center"
        style={coverImage ? { backgroundImage: `url(${coverImage})`, backgroundSize: "cover", backgroundPosition: "center" } : {}}
      >
        {!coverImage && <RiHome2Line className="text-violet-200 text-5xl" />}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-violet-600 text-lg leading-tight">{property.name}</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors"
            >
              <RiDeleteBin6Line size={15} />
            </button>
            <RiArrowRightLine className="text-gray-300 group-hover:text-violet-400 transition-colors flex-shrink-0" />
          </div>
        </div>
        <div className="flex items-start gap-1 mb-4">
          <RiMapPinLine className="text-gray-400 text-sm flex-shrink-0 mt-0.5" />
          <p className="text-gray-400 text-xs leading-relaxed">{property.address}</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "ทั้งหมด",  value: property.totalRooms },
            { label: "ว่าง",     value: property.available },
            { label: "จอง",      value: property.reserved },
            { label: "มีผู้เช่า", value: property.occupied },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2 bg-violet-50 rounded-lg px-3 py-2">
              <RiHome2Line className="text-violet-400 text-sm" />
              <span className="text-gray-500 text-xs">{s.label}:</span>
              <span className="text-violet-600 text-sm font-semibold">{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}