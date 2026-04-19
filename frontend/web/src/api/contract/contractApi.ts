// contractApi.ts (web) — API calls สำหรับจัดการสัญญาเช่าฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก contractSlice.ts และ ContractPage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type {
  ContractListItem,
  ContractDetail,
  CreateContractInput,
  UpdateContractInput,
} from "../../types/contract.types"

// GET /api/admin/properties/:propertyId/contracts — ดึงรายการสัญญาทั้งหมดของ property
export const getContracts = (propertyId: string) =>
  api.get<ContractListItem[]>(ENDPOINTS.contracts.list(propertyId)).then((r) => r.data)

// GET /api/admin/properties/:propertyId/contracts/:contractId — ดึงรายละเอียดสัญญา
export const getContractDetail = (propertyId: string, contractId: string) =>
  api.get<ContractDetail>(ENDPOINTS.contracts.detail(propertyId, contractId)).then((r) => r.data)

// POST /api/admin/properties/:propertyId/contracts/online — สร้างสัญญาจาก booking online
export const createOnlineContract = (propertyId: string, data: CreateContractInput) =>
  api.post(ENDPOINTS.contracts.createOnline(propertyId), data).then((r) => r.data)

// POST /api/admin/properties/:propertyId/contracts/offline — สร้างสัญญา offline (walk-in)
export const createOfflineContract = (propertyId: string, data: CreateContractInput) =>
  api.post(ENDPOINTS.contracts.createOffline(propertyId), data).then((r) => r.data)

// PUT /api/admin/properties/:propertyId/contracts/:contractId — แก้ไขสัญญา (เช่น เปลี่ยนสถานะ)
export const updateContract = (propertyId: string, contractId: string, data: UpdateContractInput) =>
  api.put(ENDPOINTS.contracts.update(propertyId, contractId), data).then((r) => r.data)

// PATCH /api/admin/properties/:propertyId/contracts/:contractId/pdf — บันทึก URL ของ PDF สัญญาที่ upload แล้ว
export const uploadContractPdf = (propertyId: string, contractId: string, pdfUrl: string) =>
  api.patch(ENDPOINTS.contracts.uploadPdf(propertyId, contractId), { pdfUrl }).then((r) => r.data)
