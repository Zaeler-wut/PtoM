import { axiosInstance } from "../axiosInstance";
import { PROPERTY_ENDPOINTS } from "../endpoints";
import type {
  Property,
  RoomType,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  CreateRoomTypePayload,
  UpdateRoomTypePayload,
} from "../../types/property.types";

export const propertyApi = {
  // ── Property ───────────────────────────────────────────────────────────────
  getList: async (): Promise<Property[]> => {
    const { data } = await axiosInstance.get<Property[]>(
      PROPERTY_ENDPOINTS.LIST
    );
    return data;
  },

  create: async (payload: CreatePropertyPayload): Promise<Property> => {
    const { data } = await axiosInstance.post<Property>(
      PROPERTY_ENDPOINTS.CREATE,
      payload
    );
    return data;
  },

  getDetail: async (propertyId: string): Promise<Property> => {
    const { data } = await axiosInstance.get<Property>(
      PROPERTY_ENDPOINTS.DETAIL(propertyId)
    );
    return data;
  },

  update: async (
    propertyId: string,
    payload: UpdatePropertyPayload
  ): Promise<Property> => {
    const { data } = await axiosInstance.put<Property>(
      PROPERTY_ENDPOINTS.UPDATE(propertyId),
      payload
    );
    return data;
  },

  // ── Property Images ────────────────────────────────────────────────────────
  addImage: async (
    propertyId: string,
    formData: FormData
  ): Promise<Property> => {
    const { data } = await axiosInstance.post<Property>(
      PROPERTY_ENDPOINTS.ADD_IMAGE(propertyId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteImage: async (
    propertyId: string,
    imageId: string
  ): Promise<void> => {
    await axiosInstance.delete(
      PROPERTY_ENDPOINTS.DELETE_IMAGE(propertyId, imageId)
    );
  },

  setCover: async (
    propertyId: string,
    imageId: string
  ): Promise<void> => {
    await axiosInstance.patch(
      PROPERTY_ENDPOINTS.SET_COVER(propertyId, imageId)
    );
  },

  // ── Room Types ─────────────────────────────────────────────────────────────
  createRoomType: async (
    propertyId: string,
    payload: CreateRoomTypePayload
  ): Promise<RoomType> => {
    const { data } = await axiosInstance.post<RoomType>(
      PROPERTY_ENDPOINTS.CREATE_ROOM_TYPE(propertyId),
      payload
    );
    return data;
  },

  getRoomTypeDetail: async (
    propertyId: string,
    roomTypeId: string
  ): Promise<RoomType> => {
    const { data } = await axiosInstance.get<RoomType>(
      PROPERTY_ENDPOINTS.ROOM_TYPE_DETAIL(propertyId, roomTypeId)
    );
    return data;
  },

  updateRoomType: async (
    propertyId: string,
    roomTypeId: string,
    payload: UpdateRoomTypePayload
  ): Promise<RoomType> => {
    const { data } = await axiosInstance.put<RoomType>(
      PROPERTY_ENDPOINTS.UPDATE_ROOM_TYPE(propertyId, roomTypeId),
      payload
    );
    return data;
  },

  addRoomTypeImage: async (
    propertyId: string,
    roomTypeId: string,
    formData: FormData
  ): Promise<RoomType> => {
    const { data } = await axiosInstance.post<RoomType>(
      PROPERTY_ENDPOINTS.ADD_ROOM_TYPE_IMAGE(propertyId, roomTypeId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  deleteRoomTypeImage: async (
    propertyId: string,
    roomTypeId: string,
    imageId: string
  ): Promise<void> => {
    await axiosInstance.delete(
      PROPERTY_ENDPOINTS.DELETE_ROOM_TYPE_IMAGE(propertyId, roomTypeId, imageId)
    );
  },
};
