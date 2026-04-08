import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"
import type { AdminPropertyCard, RoomMeter } from "../../types/adminMeter.types"

export const adminMeterApi = {
  getProperties: async (): Promise<AdminPropertyCard[]> => {
    const res = await api.get(ENDPOINTS.adminMobile.properties)
    return res.data
  },

  getRooms: async (propertyId: string, month: number, year: number): Promise<RoomMeter[]> => {
    const res = await api.get(ENDPOINTS.adminMobile.rooms(propertyId), {
      params: { month, year },
    })
    return res.data
  },

  saveMeter: async (data: {
    roomId: string
    month: number
    year: number
    waterMeter: number
    electricMeter: number
  }) => {
    const res = await api.post(ENDPOINTS.adminMobile.saveMeter, data)
    return res.data
  },
}
