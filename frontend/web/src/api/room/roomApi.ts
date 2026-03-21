import { axiosInstance } from "../axiosInstance";
import { ROOM_ENDPOINTS } from "../endpoints";
import type { Room, CreateRoomPayload } from "../../types/room.types";

export const roomApi = {
  getList: async (propertyId: string): Promise<Room[]> => {
    const { data } = await axiosInstance.get<Room[]>(
      ROOM_ENDPOINTS.LIST(propertyId)
    );
    return data;
  },

  create: async (
    propertyId: string,
    payload: CreateRoomPayload
  ): Promise<Room> => {
    const { data } = await axiosInstance.post<Room>(
      ROOM_ENDPOINTS.CREATE(propertyId),
      payload
    );
    return data;
  },
};
