import { axiosInstance } from "../axiosInstance";
import { BOOKING_ENDPOINTS } from "../endpoints";
import type { Booking, ContractPrefill } from "../../types/booking.types";

export const bookingApi = {
  getList: async (propertyId: string): Promise<Booking[]> => {
    const { data } = await axiosInstance.get<Booking[]>(
      BOOKING_ENDPOINTS.LIST(propertyId)
    );
    return data;
  },

  getDetail: async (
    propertyId: string,
    bookingId: string
  ): Promise<Booking> => {
    const { data } = await axiosInstance.get<Booking>(
      BOOKING_ENDPOINTS.DETAIL(propertyId, bookingId)
    );
    return data;
  },

  getContractPrefill: async (
    propertyId: string,
    bookingId: string
  ): Promise<ContractPrefill> => {
    const { data } = await axiosInstance.get<ContractPrefill>(
      BOOKING_ENDPOINTS.CONTRACT_PREFILL(propertyId, bookingId)
    );
    return data;
  },

  confirm: async (
    propertyId: string,
    bookingId: string
  ): Promise<Booking> => {
    const { data } = await axiosInstance.patch<Booking>(
      BOOKING_ENDPOINTS.CONFIRM(propertyId, bookingId)
    );
    return data;
  },

  cancel: async (
    propertyId: string,
    bookingId: string,
    reason?: string
  ): Promise<Booking> => {
    const { data } = await axiosInstance.patch<Booking>(
      BOOKING_ENDPOINTS.CANCEL(propertyId, bookingId),
      { reason }
    );
    return data;
  },
};
