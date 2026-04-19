import { useState } from "react"
import { superadminApi } from "../../api/superadmin/superadminApi"
import {
  RiSearchLine, RiUserLine, RiLockPasswordLine,
  RiToggleLine, RiToggleFill, RiDeleteBinLine,
} from "react-icons/ri"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  createdAt: string
  lastLogin: string | null
}

function ConfirmDeleteModal({ name, onClose, onConfirm }: {
  name: string; onClose: () => void; onConfirm: (password: string) => Promise<void>
}) {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">ลบบัญชีผู้ใช้</h2>
        <p className="text-sm text-gray-500 mb-1">{name}</p>
        <p className="text-sm text-red-500 mb-4">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
        <label className="text-xs font-medium text-gray-500 mb-1 block">รหัสผ่านของคุณเพื่อยืนยัน</label>
        <input className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 mb-3"
          type="password" placeholder="รหัสผ่าน Superadmin"
          value={password} onChange={e => { setPassword(e.target.value); setError("") }} />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            ยกเลิก
          </button>
          <button onClick={async () => {
            if (!password) return
            setLoading(true); setError("")
            try { await onConfirm(password) }
            catch (e: any) { setError(e.response?.data?.error ?? "เกิดข้อผิดพลาด") }
            finally { setLoading(false) }
          }} disabled={loading || !password}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 disabled:opacity-50">
            {loading ? "กำลังลบ..." : "ลบบัญชี"}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResetPasswordModal({ name, onClose, onConfirm }: {
  name: string; onClose: () => void; onConfirm: (pw: string) => void
}) {
  const [pw, setPw] = useState("")
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Reset รหัสผ่าน</h2>
        <p className="text-sm text-gray-400 mb-4">{name}</p>
        <input
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 mb-3"
          type="password"
          placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
          value={pw}
          onChange={e => setPw(e.target.value)}
        />
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            ยกเลิก
          </button>
          <button onClick={() => pw.length >= 6 && onConfirm(pw)} disabled={pw.length < 6}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40">
            บันทึก
          </button>
        </div>
      </div>
    </div>
  )
}

export default function UserSupportPage() {
  const [query, setQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [resetTarget, setResetTarget] = useState<User | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const result = await superadminApi.searchUsers(query)
      setUsers(result)
      setSearched(true)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (user: User) => {
    await superadminApi.setUserStatus(user.id, !user.isActive)
    setUsers(p => p.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u))
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Support</h1>
        <p className="text-sm text-gray-400 mt-1">ค้นหาผู้ใช้และจัดการบัญชี</p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <RiSearchLine size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="ค้นหาด้วยชื่อ หรืออีเมล..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "กำลังค้นหา..." : "ค้นหา"}
        </button>
      </form>

      {/* Results */}
      {!searched && !loading && (
        <div className="text-center py-16 text-gray-400">
          <RiUserLine size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">พิมพ์ชื่อหรืออีเมลเพื่อค้นหา</p>
        </div>
      )}

      {searched && users.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <RiUserLine size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">ไม่พบผู้ใช้ที่ตรงกับ "{query}"</p>
        </div>
      )}

      {users.length > 0 && (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id}
              className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                user.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <span className="text-emerald-600 font-bold text-sm">
                  {user.firstName.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </p>
                  {!user.isActive && (
                    <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                      ปิดใช้งาน
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>

              {/* Last login */}
              <div className="text-center px-3 hidden sm:block">
                <p className="text-xs text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("th-TH")
                    : "ยังไม่เคย"}
                </p>
                <p className="text-xs text-gray-400">login ล่าสุด</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setResetTarget(user)}
                  title="Reset password"
                  className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-violet-600 transition-colors"
                >
                  <RiLockPasswordLine size={16} />
                </button>
                <button
                  onClick={() => handleToggleStatus(user)}
                  title={user.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  className={`p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    user.isActive ? "text-emerald-500" : "text-gray-300"
                  }`}
                >
                  {user.isActive ? <RiToggleFill size={20} /> : <RiToggleLine size={20} />}
                </button>
                <button onClick={() => setDeleteTarget(user)} title="ลบบัญชี"
                  className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                  <RiDeleteBinLine size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resetTarget && (
        <ResetPasswordModal
          name={`${resetTarget.firstName} ${resetTarget.lastName}`}
          onClose={() => setResetTarget(null)}
          onConfirm={async pw => {
            await superadminApi.resetUserPassword(resetTarget.id, pw)
            setResetTarget(null)
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          name={`${deleteTarget.firstName} ${deleteTarget.lastName}`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async (password) => {
            await superadminApi.deleteUser(deleteTarget.id, password)
            setUsers(p => p.filter(u => u.id !== deleteTarget.id))
            setDeleteTarget(null)
          }}
        />
      )}
    </div>
  )
}
