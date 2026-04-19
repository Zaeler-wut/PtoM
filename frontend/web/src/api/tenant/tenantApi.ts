// tenantApi.ts (web) — API calls สำหรับจัดการข้อมูลผู้เช่าฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก tenantSlice.ts และ TenantPage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { Tenant, TenantDetail, UpdateTenantPersonalInput } from "../../types/tenant.types"

// GET /api/admin/properties/:propertyId/tenants — ดึงรายชื่อ tenant ทั้งหมดของ property
export const getTenants = (propertyId: string) =>
  api.get<Tenant[]>(ENDPOINTS.tenants.list(propertyId)).then((r) => r.data)

// GET /api/admin/properties/:propertyId/tenants/:contractId — ดึงข้อมูล tenant ผ่าน contractId
export const getTenantDetail = (propertyId: string, contractId: string) =>
  api.get<TenantDetail>(ENDPOINTS.tenants.detail(propertyId, contractId)).then((r) => r.data)

// PATCH /api/admin/properties/:propertyId/tenants/:contractId — แก้ไขข้อมูลส่วนตัว tenant (ชื่อ, เบอร์, ฯลฯ)
export const updateTenantPersonalInfo = (
  propertyId: string,
  contractId: string,
  data: UpdateTenantPersonalInput
) => api.patch(ENDPOINTS.tenants.update(propertyId, contractId), data).then((r) => r.data)
