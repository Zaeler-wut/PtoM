import api from "../axiosInstance"
import { ENDPOINTS } from "../endpoints"

export interface RoomTypeDetail {
  id: string
  name: string
  description: string | null
  size: number | null
  maxOccupants: number | null
  roomPrice: number
  furniturePrice: number
  bookingFee: number
  advanceRent: number
  securityDeposit: number
  waterRate: number
  electricRate: number
  availableRooms: number
  preparingCount: number
  preparingAvailableDate: string | null
  totalRooms: number
  images: string[]
  facilities: string[]
  propertyName: string
  propertyId: string
  payment: {
    paymentQrUrl: string | null
    bankName: string
    bankAccount: string
    bankHolder: string
  }
}

export interface BookingInfo {
  propertyName: string
  roomTypeName: string
  roomPrice: number
  furniturePrice: number
  bookingFee: number
  payment: {
    paymentQrUrl: string | null
    bankName: string
    bankAccount: string
    bankHolder: string
  }
  maxMoveInDate: string
  minMoveInDate: string
}

export interface CreateBookingResponse {
  bookingId: string
  propertyName: string
  roomTypeName: string
  roomPrice: number
  bookingFee: number
  moveInDate: string
  firstName: string
  lastName: string
  status: string
  paidAmount: number
}

export const mobileBookingApi = {
  getRoomTypeDetail: async (propertyId: string, roomTypeId: string): Promise<RoomTypeDetail> => {
    const res = await api.get(ENDPOINTS.mobileProperties.roomTypeDetail(propertyId, roomTypeId))
    return res.data
  },

  getBookingInfo: async (propertyId: string, roomTypeId: string): Promise<BookingInfo> => {
    const res = await api.get(ENDPOINTS.mobileProperties.bookingInfo(propertyId, roomTypeId))
    return res.data
  },

  uploadSlip: async (uri: string): Promise<string> => {
    const formData = new FormData()
    const filename = uri.split('/').pop() ?? 'slip.jpg'
    const match = /\.(\w+)$/.exec(filename)
    const type = match ? `image/${match[1]}` : 'image/jpeg'
    formData.append('file', { uri, name: filename, type } as any)
    const res = await api.post(ENDPOINTS.upload.image, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.url as string
  },

  createBooking: async (
    propertyId: string,
    roomTypeId: string,
    data: { moveInDate: string; slipUrl: string }
  ): Promise<CreateBookingResponse> => {
    const res = await api.post(
      ENDPOINTS.mobileProperties.createBooking(propertyId, roomTypeId),
      data
    )
    return res.data
  },
}
