import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type {
  MoveOutListResponse,
  MoveOutBillInput,
  MoveOutPreviewResponse,
  CreateMoveOutBillResponse,
  MoveOutBillDetail,
} from "../../types/moveout.types"

export const getMoveOutList = (propertyId: string) =>
  api.get<MoveOutListResponse>(ENDPOINTS.moveout.list(propertyId)).then((r) => r.data)

export const previewMoveOutBill = (propertyId: string, contractId: string, data: MoveOutBillInput) =>
  api.post<MoveOutPreviewResponse>(ENDPOINTS.moveout.preview(propertyId, contractId), data).then((r) => r.data)

export const createMoveOutBill = (propertyId: string, contractId: string, data: MoveOutBillInput) =>
  api.post<CreateMoveOutBillResponse>(ENDPOINTS.moveout.createBill(propertyId, contractId), data).then((r) => r.data)

export const getMoveOutBillDetail = (propertyId: string, moveOutBillId: string) =>
  api.get<MoveOutBillDetail>(ENDPOINTS.moveout.billDetail(propertyId, moveOutBillId)).then((r) => r.data)
