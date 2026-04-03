import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { Tenant, TenantDetail, UpdateTenantPersonalInput } from "../../types/tenant.types"

export const getTenants = (propertyId: string) =>
  api.get<Tenant[]>(ENDPOINTS.tenants.list(propertyId)).then((r) => r.data)

export const getTenantDetail = (propertyId: string, contractId: string) =>
  api.get<TenantDetail>(ENDPOINTS.tenants.detail(propertyId, contractId)).then((r) => r.data)

export const updateTenantPersonalInfo = (
  propertyId: string,
  contractId: string,
  data: UpdateTenantPersonalInput
) => api.patch(ENDPOINTS.tenants.update(propertyId, contractId), data).then((r) => r.data)
