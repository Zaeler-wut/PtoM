import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type {
  ContractListItem,
  ContractDetail,
  CreateContractInput,
  UpdateContractInput,
} from "../../types/contract.types"

export const getContracts = (propertyId: string) =>
  api.get<ContractListItem[]>(ENDPOINTS.contracts.list(propertyId)).then((r) => r.data)

export const getContractDetail = (propertyId: string, contractId: string) =>
  api.get<ContractDetail>(ENDPOINTS.contracts.detail(propertyId, contractId)).then((r) => r.data)

export const createOnlineContract = (propertyId: string, data: CreateContractInput) =>
  api.post(ENDPOINTS.contracts.createOnline(propertyId), data).then((r) => r.data)

export const createOfflineContract = (propertyId: string, data: CreateContractInput) =>
  api.post(ENDPOINTS.contracts.createOffline(propertyId), data).then((r) => r.data)

export const updateContract = (propertyId: string, contractId: string, data: UpdateContractInput) =>
  api.put(ENDPOINTS.contracts.update(propertyId, contractId), data).then((r) => r.data)

export const uploadContractPdf = (propertyId: string, contractId: string, pdfUrl: string) =>
  api.patch(ENDPOINTS.contracts.uploadPdf(propertyId, contractId), { pdfUrl }).then((r) => r.data)
