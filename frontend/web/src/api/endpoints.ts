export const ENDPOINTS = {
  // AUTH
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    refresh: "/auth/refresh-token",
  },

  // ADMIN
  properties: {
    list: "/admin/properties",
    create: "/admin/properties",
    detail: (id: string) => `/admin/properties/${id}`,
    update: (id: string) => `/admin/properties/${id}`,
    images: (id: string) => `/admin/properties/${id}/images`,
    deleteImage: (id: string, imgId: string) => `/admin/properties/${id}/images/${imgId}`,
    setCover: (id: string, imgId: string) => `/admin/properties/${id}/images/${imgId}/cover`,
    roomTypes: (id: string) => `/admin/properties/${id}/room-types`,
    roomType: (id: string, rtId: string) => `/admin/properties/${id}/room-types/${rtId}`,
    roomTypeImages: (id: string, rtId: string) => `/admin/properties/${id}/room-types/${rtId}/images`,
    deleteRoomTypeImage: (id: string, rtId: string, imgId: string) => `/admin/properties/${id}/room-types/${rtId}/images/${imgId}`,
  },

  dashboard: {
    summary: (propertyId: string) => `/admin/properties/${propertyId}/dashboard`,
    revenue: (propertyId: string) => `/admin/properties/${propertyId}/revenue`,
  },

  rooms: {
    list: (propertyId: string) => `/admin/properties/${propertyId}/rooms`,
    create: (propertyId: string) => `/admin/properties/${propertyId}/rooms`,
    update: (propertyId: string, roomId: string) => `/admin/properties/${propertyId}/rooms/${roomId}`,
  },

  tenants: {
    list: (propertyId: string) => `/admin/properties/${propertyId}/tenants`,
    detail: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/tenants/${contractId}`,
  },

  bookings: {
    list: (propertyId: string) => `/admin/properties/${propertyId}/bookings`,
    detail: (propertyId: string, bookingId: string) => `/admin/properties/${propertyId}/bookings/${bookingId}`,
    confirm: (propertyId: string, bookingId: string) => `/admin/properties/${propertyId}/bookings/${bookingId}/confirm`,
    cancel: (propertyId: string, bookingId: string) => `/admin/properties/${propertyId}/bookings/${bookingId}/cancel`,
    contractPrefill: (propertyId: string, bookingId: string) => `/admin/properties/${propertyId}/bookings/${bookingId}/contract-prefill`,
  },

  contracts: {
    list: (propertyId: string) => `/admin/properties/${propertyId}/contracts`,
    detail: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/contracts/${contractId}`,
    update: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/contracts/${contractId}`,
    uploadPdf: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/contracts/${contractId}/pdf`,
    createOnline: (propertyId: string) => `/admin/properties/${propertyId}/contracts/online`,
    createOffline: (propertyId: string) => `/admin/properties/${propertyId}/contracts/offline`,
  },

  billing: {
    summary: (propertyId: string) => `/admin/properties/${propertyId}/billing/summary`,
    fees: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/billing/${contractId}/fees`,
    invoice: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/billing/${contractId}/invoice`,
    updateMeter: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/billing/${contractId}/meter`,
    sendBill: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/billing/${contractId}/send`,
    sendAll: (propertyId: string) => `/admin/properties/${propertyId}/billing/send-all`,
    payments: (propertyId: string) => `/admin/properties/${propertyId}/billing/payments`,
    paymentDetail: (propertyId: string, paymentId: string) => `/admin/properties/${propertyId}/billing/payments/${paymentId}`,
    confirmPayment: (propertyId: string, paymentId: string) => `/admin/properties/${propertyId}/billing/payments/${paymentId}/confirm`,
    rejectPayment: (propertyId: string, paymentId: string) => `/admin/properties/${propertyId}/billing/payments/${paymentId}/reject`,
  },

  moveout: {
    list: (propertyId: string) => `/admin/properties/${propertyId}/move-out`,
    preview: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/move-out/${contractId}/preview`,
    createBill: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/move-out/${contractId}/bill`,
    billDetail: (propertyId: string, moveOutBillId: string) => `/admin/properties/${propertyId}/move-out/bills/${moveOutBillId}`,
  },
}