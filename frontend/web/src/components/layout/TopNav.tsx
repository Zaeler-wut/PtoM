import { NavLink, useNavigate } from "react-router-dom"
import {
  RiDashboardLine, RiDoorClosedLine, RiGroupLine, RiCalendarLine,
  RiFileTextLine, RiReceiptLine, RiPriceTag3Line, RiSettings3Line,
  RiBuilding2Line, RiArrowLeftLine, RiDoorOpenLine, RiLogoutBoxLine,
} from "react-icons/ri"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { logoutThunk } from "../../store/slices/authSlice"

interface TopNavProps {
  propertyId: string
  propertyName?: string
  propertyLogoUrl?: string | null
}

export function TopNav({ propertyId, propertyName, propertyLogoUrl }: TopNavProps) {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)

  const menuItems = [
    { icon: RiDashboardLine,  label: "Dashboard",        path: `/properties/${propertyId}/dashboard` },
    { icon: RiDoorClosedLine, label: "จัดการห้อง",       path: `/properties/${propertyId}/rooms` },
    { icon: RiGroupLine,      label: "ผู้เช่า",           path: `/properties/${propertyId}/tenants` },
    { icon: RiCalendarLine,   label: "การจอง",           path: `/properties/${propertyId}/bookings` },
    { icon: RiFileTextLine,   label: "สัญญาเช่า",        path: `/properties/${propertyId}/contracts` },
    { icon: RiReceiptLine,    label: "ออกบิล",           path: `/properties/${propertyId}/billing` },
    { icon: RiDoorOpenLine,   label: "บิลแจ้งออก",       path: `/properties/${propertyId}/move-out` },
    { icon: RiPriceTag3Line,  label: "ประเภทห้อง",       path: `/properties/${propertyId}/room-types` },
    { icon: RiSettings3Line,  label: "ตั้งค่า",           path: `/properties/${propertyId}/settings` },
  ]

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-30 bg-slate-800 text-white shadow-md">
      {/* Top row: brand + property + user */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          {propertyLogoUrl ? (
            <img src={propertyLogoUrl} alt="logo" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="bg-purple-600 p-1.5 rounded-lg">
              <RiBuilding2Line size={18} />
            </div>
          )}
          <span className="font-bold text-base">PtoM</span>
          <span className="text-slate-500 text-sm">|</span>
          <span className="text-sm font-medium text-slate-200">{propertyName ?? "—"}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs font-medium text-slate-200 leading-none">{user?.name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <RiLogoutBoxLine size={14} />
            ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Nav row */}
      <div className="flex items-center gap-0.5 px-3 overflow-x-auto scrollbar-none">
        <button
          onClick={() => navigate("/properties")}
          className="flex items-center gap-1.5 px-3 py-2.5 text-xs text-slate-400 hover:text-white whitespace-nowrap transition-colors flex-shrink-0"
        >
          <RiArrowLeftLine size={13} />
          เลือกสถานที่
        </button>
        <div className="w-px h-4 bg-slate-600 mx-1 flex-shrink-0" />
        {menuItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 border-b-2 ${
                isActive
                  ? "border-purple-400 text-white"
                  : "border-transparent text-slate-400 hover:text-white hover:border-slate-500"
              }`
            }
          >
            <Icon size={14} />
            {label}
          </NavLink>
        ))}
      </div>
    </header>
  )
}
