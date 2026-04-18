import { useEffect } from "react"
import { useParams } from "react-router-dom"
import {
  RiHome2Line, RiDoorOpenLine, RiCalendarEventLine, RiUser3Line,
  RiCheckboxCircleLine, RiLineChartLine, RiMoneyDollarCircleLine,
  RiToolsLine, RiTimeLine, RiFileCheckLine,
} from "react-icons/ri"
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts"
import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { fetchDashboardSummary, fetchRevenue } from "../../store/slices/dashboardSlice"
import { SummaryCard } from "../../components/shared/SummaryCard"
import { formatCurrency } from "../../utils/formatCurrency"

export default function DashboardPage() {
  const { propertyId } = useParams<{ propertyId: string }>()
  const dispatch = useAppDispatch()
  const { summary, revenue, isLoading } = useAppSelector((s) => s.dashboard)
  const { user } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (!propertyId) return
    Promise.all([
      dispatch(fetchDashboardSummary(propertyId)),
      dispatch(fetchRevenue({ propertyId, months: 6 })),
    ])
  }, [propertyId, dispatch])

  // ── Revenue chart data จาก API ──
  const revenueData = revenue?.months.map((m) => ({
    month: m.label,
    revenue: m.revenue,
  })) ?? []

  const currentMonth = new Date().toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  })

  const statsCards = [
    {
      title: "ห้องทั้งหมด",
      value: summary?.totalRooms ?? 0,
      subtitle: "ห้อง",
      icon: RiHome2Line,
      bgColor: "bg-purple-50/40",
      iconColor: "text-purple-800",
      borderColor: "border-purple-100",
    },
    {
      title: "ห้องว่าง",
      value: summary?.available ?? 0,
      subtitle: "ห้อง",
      icon: RiDoorOpenLine,
      bgColor: "bg-purple-50/40",
      iconColor: "text-purple-800",
      borderColor: "border-purple-100",
    },
    {
      title: "ห้องที่ถูกจอง",
      value: summary?.reserved ?? 0,
      subtitle: "รอเข้าอยู่",
      icon: RiCalendarEventLine,
      bgColor: "bg-cyan-50/40",
      iconColor: "text-cyan-800",
      borderColor: "border-cyan-100",
    },
    {
      title: "ห้องที่มีผู้เช่า",
      value: (summary?.occupied ?? 0) + (summary?.preparing ?? 0),
      subtitle: "ห้อง",
      icon: RiUser3Line,
      bgColor: "bg-pink-50/40",
      iconColor: "text-pink-800",
      borderColor: "border-pink-100",
    },
    {
      title: "ห้องที่จองได้",
      value: summary?.bookableRooms ?? 0,
      subtitle: `ว่าง ${summary?.available ?? 0} + เตรียมว่าง ${summary?.preparing ?? 0}`,
      icon: RiCheckboxCircleLine,
      bgColor: "bg-green-50/40",
      iconColor: "text-green-800",
      borderColor: "border-green-100",
    },
    {
      title: "รายได้ประจำเดือน",
      value: formatCurrency(summary?.monthlyRevenue ?? 0),
      subtitle: currentMonth,
      icon: RiLineChartLine,
      bgColor: "bg-emerald-50/40",
      iconColor: "text-emerald-800",
      borderColor: "border-emerald-100",
    },
    {
      title: "บิลรอชำระ",
      value: summary?.unpaidBills ?? 0,
      subtitle: "รายการ",
      icon: RiMoneyDollarCircleLine,
      bgColor: "bg-orange-50/40",
      iconColor: "text-orange-800",
      borderColor: "border-orange-100",
    },
    {
      title: "ห้องปิดปรับปรุง",
      value: summary?.maintenance ?? 0,
      subtitle: "ห้อง",
      icon: RiToolsLine,
      bgColor: "bg-red-50/40",
      iconColor: "text-red-800",
      borderColor: "border-red-100",
    },
    {
      title: "รอยืนยันการจอง",
      value: summary?.pendingBookings ?? 0,
      subtitle: "รายการ",
      icon: RiTimeLine,
      bgColor: "bg-sky-50/40",
      iconColor: "text-sky-800",
      borderColor: "border-sky-100",
    },
    {
      title: "บิลรอตรวจสอบชำระเงิน",
      value: summary?.verifyingBills ?? 0,
      subtitle: "รายการ",
      icon: RiFileCheckLine,
      bgColor: "bg-violet-50/40",
      iconColor: "text-violet-800",
      borderColor: "border-violet-100",
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="bg-purple-50 min-h-screen">
    <div className="px-8 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900 mb-1">DASHBOARD</h1>
        <p className="text-sm text-purple-600">
          {user ? `${user.name}` : ""}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {statsCards.slice(0, 8).map((card, i) => (
          <SummaryCard key={i} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {statsCards.slice(8).map((card, i) => (
          <SummaryCard key={i} {...card} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Revenue Area Chart — ดึงจาก API */}
        <div className="bg-white rounded-xl p-5 pl-8 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-purple-900">
              รายได้ 6 เดือนย้อนหลัง
            </h3>
            {revenue && (
              <span className="text-xs text-gray-400">
                รวม {formatCurrency(revenue.totalRevenue)}
              </span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [formatCurrency(Number(value)), "รายได้"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#a78bfa"
                strokeWidth={2}
                fill="url(#colorRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Room Status Bar Chart — จาก summary */}
        <div className="bg-white rounded-xl p-5 pl-8 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-purple-900 mb-4">
            สถานะห้องพักปัจจุบัน
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  status: "ว่าง",
                  count: summary?.available ?? 0,
                  fill: "#10b981",
                },
                {
                  status: "จองแล้ว",
                  count: summary?.reserved ?? 0,
                  fill: "#06b6d4",
                },
                {
                  status: "มีผู้เช่า",
                  count: summary?.occupied ?? 0,
                  fill: "#a78bfa",
                },
                {
                  status: "เตรียมว่าง",
                  count: summary?.preparing ?? 0,
                  fill: "#f59e0b",
                },
                {
                  status: "ซ่อมบำรุง",
                  count: summary?.maintenance ?? 0,
                  fill: "#ef4444",
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
                formatter={(value) => [`${value} ห้อง`, "จำนวน"]}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} fill="#a78bfa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
    </div>
  )
}