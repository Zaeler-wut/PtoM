import { axiosInstance } from "../axiosInstance";
import { TENANT_ENDPOINTS } from "../endpoints";
import type { Tenant } from "../../types/tenant.types";

export const tenantApi = {
  getList: async (propertyId: string): Promise<Tenant[]> => {
    const { data } = await axiosInstance.get<Tenant[]>(
      TENANT_ENDPOINTS.LIST(propertyId)
    );
    return data;
  },

  getDetail: async (
    propertyId: string,
    contractId: string
  ): Promise<Tenant> => {
    const { data } = await axiosInstance.get<Tenant>(
      TENANT_ENDPOINTS.DETAIL(propertyId, contractId)
    );
    return data;
  },
};
