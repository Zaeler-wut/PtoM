import { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  RiHome2Line, RiDoorOpenLine, RiCalendarEventLine, RiUser3Line,
  RiCheckboxCircleLine, RiLineChartLine, RiMoneyDollarCircleLine,
  RiToolsLine, RiTimeLine, RiFileCheckLine,
} from "react-icons/ri";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchDashboardSummary } from "../../store/slices/dashboardSlice";
import { fetchRooms } from "../../store/slices/roomSlice";
import { fetchBookings } from "../../store/slices/bookingSlice";
import { SummaryCard } from "../../components/shared/SummaryCard";
import { formatCurrency } from "../../utils/formatCurrency";

const mockRevenueData = [
  { month: "ส.ค. 25", revenue: 165000 },
  { month: "ก.ย. 25", revenue: 172000 },
  { month: "ต.ค. 25", revenue: 168000 },
  { month: "พ.ย. 25", revenue: 175000 },
  { month: "ธ.ค. 25", revenue: 180000 },
  { month: "ม.ค. 26", revenue: 178000 },
  { month: "ก.พ. 26", revenue: 175000 },
];

const mockRoomStatusData = [
  { month: "ส.ค.", available: 15, occupied: 35 },
  { month: "ก.ย.", available: 12, occupied: 38 },
  { month: "ต.ค.", available: 14, occupied: 36 },
  { month: "พ.ย.", available: 10, occupied: 40 },
  { month: "ธ.ค.", available: 11, occupied: 39 },
  { month: "ม.ค.", available: 9, occupied: 41 },
  { month: "ก.พ.", available: 11, occupied: 39 },
];

export default function DashboardPage() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const { summary } = useAppSelector((s) => s.dashboard);
  const { list: rooms } = useAppSelector((s) => s.room);
  const { list: bookings } = useAppSelector((s) => s.booking);
  const { selected: property } = useAppSelector((s) => s.property);

  useEffect(() => {
    if (!propertyId) return;
    Promise.all([
      dispatch(fetchDashboardSummary(propertyId)),
      dispatch(fetchRooms(propertyId)),
      dispatch(fetchBookings(propertyId)),
    ]);
  }, [propertyId, dispatch]);

  const roomStats = {
    total: rooms.length,
    available: rooms.filter((r) => r.status === "AVAILABLE").length,
    reserved: rooms.filter((r) => r.status === "RESERVED").length,
    occupied: rooms.filter((r) => r.status === "OCCUPIED").length,
    preparing: rooms.filter((r) => r.status === "PREPARING").length,
    maintenance: rooms.filter((r) => r.status === "MAINTENANCE").length,
  };

  const pendingBookings = bookings.filter((b) => b.status === "PENDING").length;
  const confirmedBookings = bookings.filter((b) => b.status === "CONFIRMED").length;
  const currentMonth = new Date().toLocaleDateString("th-TH", { month: "long", year: "numeric" });

  const statsCards = [
    { title: "ห้องทั้งหมด", value: roomStats.total, subtitle: "ห้อง", icon: RiHome2Line, bgColor: "bg-purple-50/40", iconColor: "text-purple-800", borderColor: "border-purple-100" },
    { title: "ห้องว่าง", value: roomStats.available, subtitle: "ห้อง", icon: RiDoorOpenLine, bgColor: "bg-purple-50/40", iconColor: "text-purple-800", borderColor: "border-purple-100" },
    { title: "ห้องที่ถูกจอง", value: roomStats.reserved, subtitle: "รอเข้าอยู่", icon: RiCalendarEventLine, bgColor: "bg-cyan-50/40", iconColor: "text-cyan-800", borderColor: "border-cyan-100" },
    { title: "ห้องที่มีผู้เช่า", value: roomStats.occupied, subtitle: "ห้อง", icon: RiUser3Line, bgColor: "bg-pink-50/40", iconColor: "text-pink-800", borderColor: "border-pink-100" },
    { title: "ห้องที่จองได้", value: roomStats.available + roomStats.preparing, subtitle: `ว่าง ${roomStats.available} + เตรียมว่าง ${roomStats.preparing}`, icon: RiCheckboxCircleLine, bgColor: "bg-green-50/40", iconColor: "text-green-800", borderColor: "border-green-100" },
    { title: "รายได้ประจำเดือน", value: formatCurrency(summary?.currentMonthRevenue ?? 0), subtitle: currentMonth, icon: RiLineChartLine, bgColor: "bg-emerald-50/40", iconColor: "text-emerald-800", borderColor: "border-emerald-100" },
    { title: "บิลรอชำระ", value: summary?.pendingPayments ?? 0, subtitle: "รายการ", icon: RiMoneyDollarCircleLine, bgColor: "bg-orange-50/40", iconColor: "text-orange-800", borderColor: "border-orange-100" },
    { title: "ห้องปิดปรับปรุง", value: roomStats.maintenance, subtitle: "ห้อง", icon: RiToolsLine, bgColor: "bg-red-50/40", iconColor: "text-red-800", borderColor: "border-red-100" },
    { title: "รอยืนยันการจอง", value: pendingBookings, subtitle: "รายการ", icon: RiTimeLine, bgColor: "bg-sky-50/40", iconColor: "text-sky-800", borderColor: "border-sky-100" },
    { title: "บิลรอยืนยัน", value: confirmedBookings, subtitle: "รายการ", icon: RiFileCheckLine, bgColor: "bg-violet-50/40", iconColor: "text-violet-800", borderColor: "border-violet-100" },
  ];

  return (
    <div className="bg-purple-50 min-h-screen">
      <div className="px-2 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900 mb-1">DASHBOARD</h1>
        <p className="text-sm text-gray-600">{property?.name ?? ""}</p>
      </div>
 
      {/* แถว 1-2: 4 การ์ด */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {statsCards.slice(0, 8).map((card, i) => (
          <SummaryCard key={i} {...card} />
        ))}
      </div>
 
      {/* แถว 3: 2 การ์ดกว้าง */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {statsCards.slice(8).map((card, i) => (
          <SummaryCard key={i} {...card} />
        ))}
      </div>
 
      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 max-w-6xl">
        {/* Area Chart */}
        <div className="bg-white rounded-xl p-5 pl-8 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-purple-900 mb-4">รายได้ 7 เดือนย้อนหลัง</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockRevenueData}>
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
                contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                formatter={(value) => formatCurrency(Number(value))}
              />
              <Area type="monotone" dataKey="revenue" stroke="#a78bfa" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
 
        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-5 pl-8 shadow-sm border border-gray-100">
          <h3 className="text-base font-semibold text-purple-900 mb-4">สถานะห้องพัก</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockRoomStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "8px" }}
              />
              <Bar dataKey="available" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="occupied" fill="#a78bfa" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>
    </div>
  );
}