import { useEffect, useState } from "react"
import { superadminApi } from "../../api/superadmin/superadminApi"
import {
  RiGroupLine, RiUserLine, RiBuilding2Line,
  RiDoorClosedLine, RiUserAddLine,
} from "react-icons/ri"

interface Stats {
  totalAdmins: number
  activeAdmins: number
  totalUsers: number
  totalProperties: number
  totalRooms: number
  newThisMonth: number
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: number; sub?: string; color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
        {sub && <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">{sub}</span>}
      </div>
      <p className="text-3xl font-bold text-gray-900 mt-4">{value.toLocaleString()}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
    </div>
  )
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    superadminApi.getDashboard().then(setStats).catch(() => {})
  }, [])

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ภาพรวมระบบ</h1>
        <p className="text-sm text-gray-400 mt-1">ข้อมูลทั้งหมดในระบบ PtoM</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          icon={RiGroupLine} label="Admin ทั้งหมด"
          value={stats.totalAdmins} color="bg-violet-500"
          sub={`${stats.activeAdmins} active`}
        />
        <StatCard
          icon={RiUserAddLine} label="Admin ใหม่เดือนนี้"
          value={stats.newThisMonth} color="bg-blue-500"
        />
        <StatCard
          icon={RiUserLine} label="ผู้ใช้ (Tenant)"
          value={stats.totalUsers} color="bg-emerald-500"
        />
        <StatCard
          icon={RiBuilding2Line} label="หอพักทั้งหมด"
          value={stats.totalProperties} color="bg-orange-500"
        />
        <StatCard
          icon={RiDoorClosedLine} label="ห้องทั้งหมด"
          value={stats.totalRooms} color="bg-pink-500"
        />
      </div>
    </div>
  )
}
