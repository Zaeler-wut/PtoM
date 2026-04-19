// moveoutApi.ts (web) — API calls สำหรับระบบแจ้งออกฝั่ง web admin
// เรียกใช้ axiosInstance และ ENDPOINTS
// ถูกเรียกใช้จาก moveoutSlice.ts และ MoveOutPage

import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type {
  MoveOutListResponse,
  MoveOutBillInput,
  MoveOutPreviewResponse,
  CreateMoveOutBillResponse,
  MoveOutBillDetail,
} from "../../types/moveout.types"

// GET /api/admin/properties/:propertyId/move-out — ดึงรายการ contract ที่แจ้งออก (MOVE_OUT_NOTICE)
export const getMoveOutList = (propertyId: string) =>
  api.get<MoveOutListResponse>(ENDPOINTS.moveout.list(propertyId)).then((r) => r.data)

// POST /api/admin/properties/:propertyId/move-out/:contractId/preview — คำนวณ preview ค่าใช้จ่ายสุดท้าย
export const previewMoveOutBill = (propertyId: string, contractId: string, data: MoveOutBillInput) =>
  api.post<MoveOutPreviewResponse>(ENDPOINTS.moveout.preview(propertyId, contractId), data).then((r) => r.data)

// POST /api/admin/properties/:propertyId/move-out/:contractId/bill — สร้างบิลสุดท้าย (สิ้นสุดสัญญา)
export const createMoveOutBill = (propertyId: string, contractId: string, data: MoveOutBillInput) =>
  api.post<CreateMoveOutBillResponse>(ENDPOINTS.moveout.createBill(propertyId, contractId), data).then((r) => r.data)

// GET /api/admin/properties/:propertyId/move-out/bills/:moveOutBillId — ดึงรายละเอียดบิลสุดท้าย
export const getMoveOutBillDetail = (propertyId: string, moveOutBillId: string) =>
  api.get<MoveOutBillDetail>(ENDPOINTS.moveout.billDetail(propertyId, moveOutBillId)).then((r) => r.data)
