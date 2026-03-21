const A = "/admin/properties"; // shorthand

// ── Auth ──────────────────────────────────────────────────────────────────────
export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh-token",
} as const;

// ── Property ──────────────────────────────────────────────────────────────────
export const PROPERTY_ENDPOINTS = {
  LIST: "/admin/properties",
  CREATE: "/admin/properties",
  DETAIL: (propertyId: string) => `/admin/properties/${propertyId}`,
  UPDATE: (propertyId: string) => `/admin/properties/${propertyId}`,

  ADD_IMAGE: (propertyId: string) => `${A}/${propertyId}/images`,
  DELETE_IMAGE: (propertyId: string, imageId: string) =>
    `${A}/${propertyId}/images/${imageId}`,
  SET_COVER: (propertyId: string, imageId: string) =>
    `${A}/${propertyId}/images/${imageId}/cover`,

  CREATE_ROOM_TYPE: (propertyId: string) =>
    `${A}/${propertyId}/room-types`,
  ROOM_TYPE_DETAIL: (propertyId: string, roomTypeId: string) =>
    `${A}/${propertyId}/room-types/${roomTypeId}`,
  UPDATE_ROOM_TYPE: (propertyId: string, roomTypeId: string) =>
    `${A}/${propertyId}/room-types/${roomTypeId}`,
  ADD_ROOM_TYPE_IMAGE: (propertyId: string, roomTypeId: string) =>
    `${A}/${propertyId}/room-types/${roomTypeId}/images`,
  DELETE_ROOM_TYPE_IMAGE: (
    propertyId: string,
    roomTypeId: string,
    imageId: string
  ) => `${A}/${propertyId}/room-types/${roomTypeId}/images/${imageId}`,
} as const;

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const DASHBOARD_ENDPOINTS = {
  SUMMARY: (propertyId: string) => `${A}/${propertyId}/dashboards`,
} as const;

// ── Room ──────────────────────────────────────────────────────────────────────
export const ROOM_ENDPOINTS = {
  LIST: (propertyId: string) => `${A}/${propertyId}/rooms`,
  CREATE: (propertyId: string) => `${A}/${propertyId}/rooms`,
} as const;

// ── Booking ───────────────────────────────────────────────────────────────────
export const BOOKING_ENDPOINTS = {
  LIST: (propertyId: string) => `${A}/${propertyId}/bookings`,
  DETAIL: (propertyId: string, bookingId: string) =>
    `${A}/${propertyId}/bookings/${bookingId}`,
  CONTRACT_PREFILL: (propertyId: string, bookingId: string) =>
    `${A}/${propertyId}/bookings/${bookingId}/contract-prefill`,
  CONFIRM: (propertyId: string, bookingId: string) =>
    `${A}/${propertyId}/bookings/${bookingId}/confirm`,
  CANCEL: (propertyId: string, bookingId: string) =>
    `${A}/${propertyId}/bookings/${bookingId}/cancel`,
} as const;

// ── Contract ──────────────────────────────────────────────────────────────────
export const CONTRACT_ENDPOINTS = {
  LIST: (propertyId: string) => `${A}/${propertyId}/contracts`,
  DETAIL: (propertyId: string, contractId: string) =>
    `${A}/${propertyId}/contracts/${contractId}`,
  UPDATE: (propertyId: string, contractId: string) =>
    `${A}/${propertyId}/contracts/${contractId}`,
  UPLOAD_PDF: (propertyId: string, contractId: string) =>
    `${A}/${propertyId}/contracts/${contractId}/pdf`,
  CREATE_ONLINE: (propertyId: string) =>
    `${A}/${propertyId}/contracts/online`,
  CREATE_OFFLINE: (propertyId: string) =>
    `${A}/${propertyId}/contracts/offline`,
} as const;

// ── Tenant ────────────────────────────────────────────────────────────────────
export const TENANT_ENDPOINTS = {
  LIST: (propertyId: string) => `${A}/${propertyId}/tenants`,
  DETAIL: (propertyId: string, contractId: string) =>
    `${A}/${propertyId}/tenants/${contractId}`,
} as const;

// ── Billing ───────────────────────────────────────────────────────────────────
export const BILLING_ENDPOINTS = {
  SUMMARY: (propertyId: string, month: number, year: number) =>
    `${A}/${propertyId}/billing/summary?month=${month}&year=${year}`,
  FEES: (propertyId: string, contractId: string) =>
    `${A}/${propertyId}/billing/${contractId}/fees`,
  INVOICE: (
    propertyId: string,
    contractId: string,
    month: number,
    year: number
  ) =>
    `${A}/${propertyId}/billing/${contractId}/invoice?month=${month}&year=${year}`,
  UPDATE_METER: (
    propertyId: string,
    contractId: string,
    month: number,
    year: number
  ) =>
    `${A}/${propertyId}/billing/${contractId}/meter?month=${month}&year=${year}`,
  SEND_BILL: (
    propertyId: string,
    contractId: string,
    month: number,
    year: number
  ) =>
    `${A}/${propertyId}/billing/${contractId}/send?month=${month}&year=${year}`,
  SEND_ALL: (propertyId: string, month: number, year: number) =>
    `${A}/${propertyId}/billing/send-all?month=${month}&year=${year}`,
  PAYMENTS: (
    propertyId: string,
    month: number,
    year: number,
    status?: string
  ) =>
    `${A}/${propertyId}/billing/payments?month=${month}&year=${year}${
      status ? `&status=${status}` : ""
    }`,
  PAYMENT_DETAIL: (propertyId: string, paymentId: string) =>
    `${A}/${propertyId}/billing/payments/${paymentId}`,
  CONFIRM_PAYMENT: (propertyId: string, paymentId: string) =>
    `${A}/${propertyId}/billing/payments/${paymentId}/confirm`,
  REJECT_PAYMENT: (propertyId: string, paymentId: string) =>
    `${A}/${propertyId}/billing/payments/${paymentId}/reject`,
} as const;

// ── Move Out ──────────────────────────────────────────────────────────────────
export const MOVEOUT_ENDPOINTS = {
  LIST: (propertyId: string, year: number, status?: string) =>
    `${A}/${propertyId}/move-out?year=${year}${
      status ? `&status=${status}` : ""
    }`,
  PREVIEW: (propertyId: string, contractId: string) =>
    `${A}/${propertyId}/move-out/${contractId}/preview`,
  CREATE_BILL: (propertyId: string, contractId: string) =>
    `${A}/${propertyId}/move-out/${contractId}/bill`,
  BILL_DETAIL: (propertyId: string, moveOutBillId: string) =>
    `${A}/${propertyId}/move-out/bills/${moveOutBillId}`,
} as const;
