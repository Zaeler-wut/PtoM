import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { logoutThunk } from "../../store/slices/authSlice"
import {
  RiDashboardLine, RiGroupLine, RiBuilding2Line,
  RiUserSearchLine, RiLogoutBoxLine,
} from "react-icons/ri"

const NAV = [
  { icon: RiDashboardLine, label: "ภาพรวม", to: "/superadmin/dashboard" },
  { icon: RiGroupLine, label: "Admin", to: "/superadmin/admins" },
  { icon: RiBuilding2Line, label: "หอพักทั้งหมด", to: "/superadmin/properties" },
  { icon: RiUserSearchLine, label: "User Support", to: "/superadmin/users" },
]

export default function SuperAdminLayout() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user } = useAppSelector(s => s.auth)

  const handleLogout = async () => {
    await dispatch(logoutThunk())
    navigate("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-100 flex flex-col fixed h-full z-10">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">S</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">SuperAdmin</p>
              <p className="text-xs text-gray-400">PtoM System</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-violet-50 text-violet-700"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
          >
            <RiLogoutBoxLine size={18} />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="ml-56 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
