import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { Tenant } from "../../types/tenant.types"

export const getTenants = (propertyId: string) =>
  api.get<Tenant[]>(ENDPOINTS.tenants.list(propertyId)).then((r) => r.data)
