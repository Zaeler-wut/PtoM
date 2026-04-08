import { useEffect, useState } from "react"
import { superadminApi } from "../../api/superadmin/superadminApi"
import { RiBuilding2Line, RiSearchLine } from "react-icons/ri"

interface Property {
  id: string
  name: string
  address: string
  totalRooms: number
  createdAt: string
  admin: { firstName: string; lastName: string; email: string } | null
}

export default function PropertyListPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    superadminApi.getProperties().then(setProperties).finally(() => setLoading(false))
  }, [])

  const filtered = properties.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.admin?.email ?? "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">หอพักทั้งหมด</h1>
          <p className="text-sm text-gray-400 mt-1">{properties.length} หอพักในระบบ</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <RiSearchLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อหอพัก หรืออีเมล admin..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/60">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">หอพัก</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Admin</th>
              <th className="text-center px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">ห้อง</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden lg:table-cell">สร้างเมื่อ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <RiBuilding2Line size={16} className="text-orange-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.address}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 hidden md:table-cell">
                  {p.admin ? (
                    <div>
                      <p className="font-medium text-gray-800">{p.admin.firstName} {p.admin.lastName}</p>
                      <p className="text-xs text-gray-400">{p.admin.email}</p>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
                <td className="px-5 py-4 text-center hidden sm:table-cell">
                  <span className="text-sm font-semibold text-gray-800">{p.totalRooms}</span>
                </td>
                <td className="px-5 py-4 hidden lg:table-cell">
                  <span className="text-xs text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "numeric" })}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-14 text-gray-400">
            <RiBuilding2Line size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">{search ? "ไม่พบหอพักที่ค้นหา" : "ยังไม่มีหอพักในระบบ"}</p>
          </div>
        )}
      </div>
    </div>
  )
}
