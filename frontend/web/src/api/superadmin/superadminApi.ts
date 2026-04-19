// superadminApi.ts (web) — API calls สำหรับ superadmin ฝั่ง web
// เรียกใช้ axiosInstance กับ base path /superadmin
// ถูกเรียกใช้จากหน้า SuperadminPage

import api from "../axiosInstance"

const BASE = "/superadmin"

export const superadminApi = {
  // GET /superadmin/dashboard — สรุปภาพรวมระบบ (admin count, tenant count, etc.)
  getDashboard: () => api.get(`${BASE}/dashboard`).then(r => r.data),

  // ADMIN management
  // GET /superadmin/admins — ดึงรายชื่อ admin ทั้งหมด
  getAdmins: () => api.get(`${BASE}/admins`).then(r => r.data),
  // POST /superadmin/admins — สร้าง admin ใหม่
  createAdmin: (data: { firstName: string; lastName: string; email: string; password: string; propertyLimit: number }) =>
    api.post(`${BASE}/admins`, data).then(r => r.data),
  // PATCH /superadmin/admins/:id/limit — แก้ไข property limit ของ admin
  updateLimit: (id: string, propertyLimit: number) =>
    api.patch(`${BASE}/admins/${id}/limit`, { propertyLimit }).then(r => r.data),
  // PATCH /superadmin/admins/:id/status — เปิด/ปิดสถานะ admin
  setAdminStatus: (id: string, isActive: boolean) =>
    api.patch(`${BASE}/admins/${id}/status`, { isActive }).then(r => r.data),
  // POST /superadmin/admins/:id/reset-password — reset รหัสผ่าน admin
  resetAdminPassword: (id: string, password: string) =>
    api.post(`${BASE}/admins/${id}/reset-password`, { password }).then(r => r.data),
  // POST /superadmin/admins/:id/impersonate — ล็อกอินแทน admin (short-lived token)
  impersonate: (id: string) =>
    api.post(`${BASE}/admins/${id}/impersonate`).then(r => r.data),
  // DELETE /superadmin/admins/:id — ลบ admin (ต้องส่ง password superadmin มาด้วย)
  deleteAdmin: (id: string, password: string) =>
    api.delete(`${BASE}/admins/${id}`, { data: { password } }).then(r => r.data),

  // PROPERTIES
  // GET /superadmin/properties — ดึง property ทั้งหมดในระบบ
  getProperties: () => api.get(`${BASE}/properties`).then(r => r.data),

  // USERS (tenants)
  // GET /superadmin/users/search?q= — ค้นหา user ด้วยชื่อหรืออีเมล
  searchUsers: (q: string) =>
    api.get(`${BASE}/users/search`, { params: { q } }).then(r => r.data),
  // PATCH /superadmin/users/:id/status — เปิด/ปิดสถานะ user
  setUserStatus: (id: string, isActive: boolean) =>
    api.patch(`${BASE}/users/${id}/status`, { isActive }).then(r => r.data),
  // POST /superadmin/users/:id/reset-password — reset รหัสผ่าน user
  resetUserPassword: (id: string, password: string) =>
    api.post(`${BASE}/users/${id}/reset-password`, { password }).then(r => r.data),
  // DELETE /superadmin/users/:id — ลบ user (cascade ทุกอย่าง, ต้องส่ง password superadmin)
  deleteUser: (id: string, password: string) =>
    api.delete(`${BASE}/users/${id}`, { data: { password } }).then(r => r.data),
}
