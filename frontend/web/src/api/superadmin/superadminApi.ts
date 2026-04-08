import api from "../axiosInstance"

const BASE = "/superadmin"

export const superadminApi = {
  getDashboard: () => api.get(`${BASE}/dashboard`).then(r => r.data),

  // Admins
  getAdmins: () => api.get(`${BASE}/admins`).then(r => r.data),
  createAdmin: (data: { firstName: string; lastName: string; email: string; password: string; propertyLimit: number }) =>
    api.post(`${BASE}/admins`, data).then(r => r.data),
  updateLimit: (id: string, propertyLimit: number) =>
    api.patch(`${BASE}/admins/${id}/limit`, { propertyLimit }).then(r => r.data),
  setAdminStatus: (id: string, isActive: boolean) =>
    api.patch(`${BASE}/admins/${id}/status`, { isActive }).then(r => r.data),
  resetAdminPassword: (id: string, password: string) =>
    api.post(`${BASE}/admins/${id}/reset-password`, { password }).then(r => r.data),
  impersonate: (id: string) =>
    api.post(`${BASE}/admins/${id}/impersonate`).then(r => r.data),

  // Properties
  getProperties: () => api.get(`${BASE}/properties`).then(r => r.data),

  // Users
  searchUsers: (q: string) =>
    api.get(`${BASE}/users/search`, { params: { q } }).then(r => r.data),
  setUserStatus: (id: string, isActive: boolean) =>
    api.patch(`${BASE}/users/${id}/status`, { isActive }).then(r => r.data),
  resetUserPassword: (id: string, password: string) =>
    api.post(`${BASE}/users/${id}/reset-password`, { password }).then(r => r.data),
}
