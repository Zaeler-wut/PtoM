import { useNavigate, useLocation } from "react-router-dom";
import {
  RiDashboardLine, RiDoorClosedLine, RiGroupLine, RiCalendarLine,
  RiFileTextLine, RiReceiptLine, RiPriceTag3Line, RiSettings3Line,
  RiBuilding2Line, RiCloseLine, RiArrowLeftLine, RiDoorOpenLine, RiUserLine,
} from "react-icons/ri";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutThunk } from "../../store/slices/authSlice";

interface SidebarProps {
  propertyId: string;
  propertyName?: string;
}

export function Sidebar({ propertyId, propertyName }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  const menuItems = [
    { icon: RiDashboardLine, label: "Dashboard", path: `/properties/${propertyId}/dashboard` },
    { icon: RiDoorClosedLine, label: "จัดการห้อง", path: `/properties/${propertyId}/rooms` },
    { icon: RiGroupLine, label: "ผู้เช่า", path: `/properties/${propertyId}/tenants` },
    { icon: RiCalendarLine, label: "การจอง", path: `/properties/${propertyId}/bookings` },
    { icon: RiFileTextLine, label: "สัญญาเช่า", path: `/properties/${propertyId}/contracts` },
    { icon: RiReceiptLine, label: "ออกบิลรายเดือน", path: `/properties/${propertyId}/billing` },
    { icon: RiDoorOpenLine, label: "บิลแจ้งออก", path: `/properties/${propertyId}/move-out` },
    { icon: RiPriceTag3Line, label: "ตั้งค่าประเภทห้องและราคา", path: `/properties/${propertyId}/edit` },
    { icon: RiSettings3Line, label: "ตั้งค่ารายละเอียดสถานที่", path: `/properties/${propertyId}/settings` },
  ];

  const handleLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/login");
  };

  return (
    <div className="w-64 bg-slate-800 h-screen sticky top-0 text-white flex flex-col flex-shrink-0 overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-purple-600 p-2 rounded-lg">
            <RiBuilding2Line size={24} />
          </div>
          <span className="font-bold text-lg">PtoM</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <RiCloseLine size={20} />
        </button>
      </div>

      {/* Property */}
      <div className="p-5 border-b border-slate-700">
        <p className="text-xs text-purple-400 mb-1">สถานที่เลือก</p>
        <p className="text-sm font-medium">{propertyName ?? "หอพักสวนสยาม"}</p>
      </div>

      {/* User */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
            <RiUserLine size={20} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400">ผู้จัดการ</p>
            <p className="text-sm font-medium">
              {user ? `${user.firstName} ${user.lastName}` : "Wutthipong"}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-slate-700"
                  }`}
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back to properties */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={() => navigate("/properties")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <RiArrowLeftLine size={18} />
          <span>กลับไปเลือกสถานที่</span>
        </button>
      </div>
    </div>
  );
}