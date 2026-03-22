import { axiosInstance } from "../axiosInstance";
import { MOVEOUT_ENDPOINTS } from "../endpoints";
import type {
  MoveOutBill,
  MoveOutPreview,
  MoveOutPreviewPayload,
  CreateMoveOutBillPayload,
  MoveOutBillStatus,
} from "../../types/moveout.types";

export const moveoutApi = {
  getList: async (
    propertyId: string,
    year: number,
    status?: MoveOutBillStatus
  ): Promise<MoveOutBill[]> => {
    const { data } = await axiosInstance.get<MoveOutBill[]>(
      MOVEOUT_ENDPOINTS.LIST(propertyId, year, status)
    );
    return data;
  },

  preview: async (
    propertyId: string,
    contractId: string,
    payload: MoveOutPreviewPayload
  ): Promise<MoveOutPreview> => {
    const { data } = await axiosInstance.post<MoveOutPreview>(
      MOVEOUT_ENDPOINTS.PREVIEW(propertyId, contractId),
      payload
    );
    return data;
  },

  createBill: async (
    propertyId: string,
    contractId: string,
    payload: CreateMoveOutBillPayload
  ): Promise<MoveOutBill> => {
    const { data } = await axiosInstance.post<MoveOutBill>(
      MOVEOUT_ENDPOINTS.CREATE_BILL(propertyId, contractId),
      payload
    );
    return data;
  },

  getBillDetail: async (
    propertyId: string,
    moveOutBillId: string
  ): Promise<MoveOutBill> => {
    const { data } = await axiosInstance.get<MoveOutBill>(
      MOVEOUT_ENDPOINTS.BILL_DETAIL(propertyId, moveOutBillId)
    );
    return data;
  },
};
