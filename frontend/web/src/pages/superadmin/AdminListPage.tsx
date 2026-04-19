import { useEffect, useState } from "react"
import { superadminApi } from "../../api/superadmin/superadminApi"
import {
  RiAddLine, RiEditLine, RiLockPasswordLine,
  RiEyeLine, RiToggleLine, RiToggleFill, RiGroupLine, RiDeleteBinLine,
} from "react-icons/ri"

interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  isActive: boolean
  createdAt: string
  lastLogin: string | null
  adminLimit: { propertyLimit: number } | null
  managedProperties: { property: { id: string; name: string } }[]
}

// ── Modal: สร้าง admin ────────────────────────────────────────
function CreateAdminModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", propertyLimit: 3 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError("")
    try {
      await superadminApi.createAdmin(form)
      onCreated()
    } catch (err: any) {
      setError(err.response?.data?.error ?? "เกิดข้อผิดพลาด")
    } finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-5">สร้างบัญชี Admin</h2>
        <form onSubmit={handle} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">ชื่อ</label>
              <input className="input" value={form.firstName}
                onChange={e => setForm(p => ({ ...p, firstName: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">นามสกุล</label>
              <input className="input" value={form.lastName}
                onChange={e => setForm(p => ({ ...p, lastName: e.target.value }))} required />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">อีเมล</label>
            <input className="input" type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">รหัสผ่าน</label>
            <input className="input" type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required minLength={6} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">
              จำนวนหอพักที่ดูแลได้ (สูงสุด)
            </label>
            <input className="input" type="number" min={1} max={99} value={form.propertyLimit}
              onChange={e => setForm(p => ({ ...p, propertyLimit: parseInt(e.target.value) }))} required />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
              ยกเลิก
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50">
              {loading ? "กำลังสร้าง..." : "สร้างบัญชี"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal: Reset Password ────────────────────────────────────
function ResetPasswordModal({ name, onClose, onConfirm }: {
  name: string; onClose: () => void; onConfirm: (pw: string) => void
}) {
  const [pw, setPw] = useState("")
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">Reset รหัสผ่าน</h2>
        <p className="text-sm text-gray-400 mb-4">{name}</p>
        <input className="input mb-3" type="password" placeholder="รหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
          value={pw} onChange={e => setPw(e.target.value)} />
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

// ── Modal: Edit Limit ────────────────────────────────────────
function EditLimitModal({ name, current, onClose, onConfirm }: {
  name: string; current: number; onClose: () => void; onConfirm: (n: number) => void
}) {
  const [val, setVal] = useState(current)
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">แก้ไข Property Limit</h2>
        <p className="text-sm text-gray-400 mb-4">{name}</p>
        <input className="input mb-3" type="number" min={1} max={99}
          value={val} onChange={e => setVal(parseInt(e.target.value))} />
        <div className="flex gap-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">
            ยกเลิก
          </button>
          <button onClick={() => onConfirm(val)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700">
            บันทึก
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal: ยืนยันลบ ──────────────────────────────────────────
function ConfirmDeleteModal({ name, onClose, onConfirm }: {
  name: string; onClose: () => void; onConfirm: (password: string) => Promise<void>
}) {
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1">ลบบัญชี Admin</h2>
        <p className="text-sm text-gray-500 mb-1">{name}</p>
        <p className="text-sm text-red-500 mb-4">การดำเนินการนี้ไม่สามารถยกเลิกได้</p>
        <label className="text-xs font-medium text-gray-500 mb-1 block">รหัสผ่านของคุณเพื่อยืนยัน</label>
        <input className="input mb-3" type="password" placeholder="รหัสผ่าน Superadmin"
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

// ── Main ─────────────────────────────────────────────────────
export default function AdminListPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [resetTarget, setResetTarget] = useState<Admin | null>(null)
  const [limitTarget, setLimitTarget] = useState<Admin | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null)

  const load = () => {
    superadminApi.getAdmins().then(setAdmins).finally(() => setLoading(false))
  }
  useEffect(load, [])

  const handleImpersonate = async (admin: Admin) => {
    const { accessToken } = await superadminApi.impersonate(admin.id)
    // เปิด web admin ใน tab ใหม่พร้อม token
    const url = `/properties?impersonate=${accessToken}`
    window.open(url, "_blank")
  }

  const handleStatus = async (admin: Admin) => {
    await superadminApi.setAdminStatus(admin.id, !admin.isActive)
    setAdmins(p => p.map(a => a.id === admin.id ? { ...a, isActive: !a.isActive } : a))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
          <p className="text-sm text-gray-400 mt-1">{admins.length} บัญชีทั้งหมด</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <RiAddLine size={18} />
          สร้างบัญชี Admin
        </button>
      </div>

      <div className="space-y-3">
        {admins.map(admin => {
          const used = admin.managedProperties.length
          const limit = admin.adminLimit?.propertyLimit ?? 3
          return (
            <div key={admin.id}
              className={`bg-white rounded-2xl border p-4 flex items-center gap-4 transition-all ${
                admin.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              {/* Avatar */}
              <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center flex-shrink-0">
                <span className="text-violet-600 font-bold text-sm">
                  {admin.firstName.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                    {admin.firstName} {admin.lastName}
                  </p>
                  {!admin.isActive && (
                    <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                      ปิดใช้งาน
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{admin.email}</p>
              </div>

              {/* Property limit */}
              <div className="text-center px-3 hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{used}/{limit}</p>
                <p className="text-xs text-gray-400">หอพัก</p>
              </div>

              {/* Last login */}
              <div className="text-center px-3 hidden lg:block">
                <p className="text-xs text-gray-500">
                  {admin.lastLogin
                    ? new Date(admin.lastLogin).toLocaleDateString("th-TH")
                    : "ยังไม่เคย"}
                </p>
                <p className="text-xs text-gray-400">login ล่าสุด</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => setLimitTarget(admin)} title="แก้ไข limit"
                  className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-violet-600 transition-colors">
                  <RiEditLine size={16} />
                </button>
                <button onClick={() => setResetTarget(admin)} title="Reset password"
                  className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-violet-600 transition-colors">
                  <RiLockPasswordLine size={16} />
                </button>
                <button onClick={() => handleImpersonate(admin)} title="สวมรอย"
                  className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-blue-600 transition-colors">
                  <RiEyeLine size={16} />
                </button>
                <button onClick={() => handleStatus(admin)}
                  title={admin.isActive ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                  className={`p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    admin.isActive ? "text-emerald-500" : "text-gray-300"
                  }`}
                >
                  {admin.isActive ? <RiToggleFill size={20} /> : <RiToggleLine size={20} />}
                </button>
                <button onClick={() => setDeleteTarget(admin)} title="ลบบัญชี"
                  className="p-2 rounded-lg hover:bg-gray-50 text-gray-400 hover:text-red-500 transition-colors">
                  <RiDeleteBinLine size={16} />
                </button>
              </div>
            </div>
          )
        })}

        {admins.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <RiGroupLine size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">ยังไม่มี Admin ในระบบ</p>
          </div>
        )}
      </div>

      {showCreate && (
        <CreateAdminModal onClose={() => setShowCreate(false)} onCreated={() => { setShowCreate(false); load() }} />
      )}
      {resetTarget && (
        <ResetPasswordModal
          name={`${resetTarget.firstName} ${resetTarget.lastName}`}
          onClose={() => setResetTarget(null)}
          onConfirm={async pw => {
            await superadminApi.resetAdminPassword(resetTarget.id, pw)
            setResetTarget(null)
          }}
        />
      )}
      {limitTarget && (
        <EditLimitModal
          name={`${limitTarget.firstName} ${limitTarget.lastName}`}
          current={limitTarget.adminLimit?.propertyLimit ?? 3}
          onClose={() => setLimitTarget(null)}
          onConfirm={async n => {
            await superadminApi.updateLimit(limitTarget.id, n)
            setLimitTarget(null); load()
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDeleteModal
          name={`${deleteTarget.firstName} ${deleteTarget.lastName}`}
          onClose={() => setDeleteTarget(null)}
          onConfirm={async (password) => {
            await superadminApi.deleteAdmin(deleteTarget.id, password)
            setDeleteTarget(null)
            load()
          }}
        />
      )}
    </div>
  )
}
