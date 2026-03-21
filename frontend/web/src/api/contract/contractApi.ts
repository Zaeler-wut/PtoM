import { axiosInstance } from "../axiosInstance";
import { CONTRACT_ENDPOINTS } from "../endpoints";
import type {
  Contract,
  CreateOnlineContractPayload,
  CreateOfflineContractPayload,
  UpdateContractPayload,
} from "../../types/contract.types";

export const contractApi = {
  getList: async (propertyId: string): Promise<Contract[]> => {
    const { data } = await axiosInstance.get<Contract[]>(
      CONTRACT_ENDPOINTS.LIST(propertyId)
    );
    return data;
  },

  getDetail: async (
    propertyId: string,
    contractId: string
  ): Promise<Contract> => {
    const { data } = await axiosInstance.get<Contract>(
      CONTRACT_ENDPOINTS.DETAIL(propertyId, contractId)
    );
    return data;
  },

  update: async (
    propertyId: string,
    contractId: string,
    payload: UpdateContractPayload
  ): Promise<Contract> => {
    const { data } = await axiosInstance.put<Contract>(
      CONTRACT_ENDPOINTS.UPDATE(propertyId, contractId),
      payload
    );
    return data;
  },

  uploadPdf: async (
    propertyId: string,
    contractId: string,
    formData: FormData
  ): Promise<Contract> => {
    const { data } = await axiosInstance.patch<Contract>(
      CONTRACT_ENDPOINTS.UPLOAD_PDF(propertyId, contractId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  createOnline: async (
    propertyId: string,
    payload: CreateOnlineContractPayload
  ): Promise<Contract> => {
    const { data } = await axiosInstance.post<Contract>(
      CONTRACT_ENDPOINTS.CREATE_ONLINE(propertyId),
      payload
    );
    return data;
  },

  createOffline: async (
    propertyId: string,
    payload: CreateOfflineContractPayload
  ): Promise<Contract> => {
    const { data } = await axiosInstance.post<Contract>(
      CONTRACT_ENDPOINTS.CREATE_OFFLINE(propertyId),
      payload
    );
    return data;
  },
};
