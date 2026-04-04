export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    refresh: "/auth/refresh-token",
    me: "/auth/me",
  },

  properties: {
    list: "/admin/properties",
    detail: (id: string) => `/admin/properties/${id}`,
  },

  dashboard: {
    summary: (propertyId: string) => `/admin/properties/${propertyId}/dashboard`,
    revenue: (propertyId: string) => `/admin/properties/${propertyId}/revenue`,
  },

  rooms: {
    list: (propertyId: string) => `/admin/properties/${propertyId}/rooms`,
    create: (propertyId: string) => `/admin/properties/${propertyId}/rooms`,
    update: (propertyId: string, roomId: string) => `/admin/properties/${propertyId}/rooms/${roomId}`,
    meterHistory: (propertyId: string, roomId: string) => `/admin/properties/${propertyId}/rooms/${roomId}/meters`,
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
  },

  contracts: {
    list: (propertyId: string) => `/admin/properties/${propertyId}/contracts`,
    detail: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/contracts/${contractId}`,
    update: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/contracts/${contractId}`,
    createOffline: (propertyId: string) => `/admin/properties/${propertyId}/contracts/offline`,
  },

  billing: {
    summary: (propertyId: string) => `/admin/properties/${propertyId}/billing/summary`,
    invoice: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/billing/${contractId}/invoice`,
    updateMeter: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/billing/${contractId}/meter`,
    sendBill: (propertyId: string, contractId: string) => `/admin/properties/${propertyId}/billing/${contractId}/send`,
    payments: (propertyId: string) => `/admin/properties/${propertyId}/billing/payments`,
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
