// ── Property ──────────────────────────────────────────────────────────────────
export interface Property {
  id: string;
  name: string;
  address: string;
  googleMap: string | null;
  description: string | null;
  priceMin: number;
  priceMax: number;
  contractTerm: string | null;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  paymentQrUrl: string | null;
  logoUrl: string | null;
  preparingDays: number;
  createdAt: string;

  // relations (optional — depends on which endpoint)
  roomTypes?: RoomType[];
  images?: PropertyImage[];
  facilities?: PropertyFacility[];
  admins?: PropertyAdmin[];
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  url: string;
  isCover: boolean;
}

export interface PropertyAdmin {
  id: string;
  propertyId: string;
  userId: string;
}

export interface Facility {
  id: string;
  name: string;
}

export interface PropertyFacility {
  id: string;
  propertyId: string;
  facilityId: string;
  facility: Facility;
}

// ── Room Type ─────────────────────────────────────────────────────────────────
export interface RoomType {
  id: string;
  propertyId: string;
  name: string;
  description: string | null;
  size: number | null;
  maxOccupants: number;
  roomPrice: number;
  furniturePrice: number | null;
  bookingFee: number;
  advanceRent: number;
  securityDeposit: number;
  waterRate: number;
  electricRate: number;
  allowOnlineBooking: boolean;

  // relations
  images?: RoomTypeImage[];
  facilities?: RoomFacility[];
  fees?: RoomTypeFee[];
}

export interface RoomTypeImage {
  id: string;
  roomTypeId: string;
  url: string;
}

export interface RoomTypeFee {
  id: string;
  roomTypeId: string;
  title: string;
  amount: number;
}

export interface RoomFacility {
  id: string;
  roomTypeId: string;
  facilityId: string;
  facility: Facility;
}

// ── Payloads ──────────────────────────────────────────────────────────────────
export interface CreatePropertyPayload {
  name: string;
  address: string;
  googleMap?: string;
  description?: string;
  priceMin: number;
  priceMax: number;
  contractTerm?: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  preparingDays?: number;
  facilityIds?: string[];
}

export interface UpdatePropertyPayload extends Partial<CreatePropertyPayload> {}

export interface CreateRoomTypePayload {
  name: string;
  description?: string;
  size?: number;
  maxOccupants: number;
  roomPrice: number;
  furniturePrice?: number;
  bookingFee: number;
  advanceRent: number;
  securityDeposit: number;
  waterRate: number;
  electricRate: number;
  allowOnlineBooking?: boolean;
  facilityIds?: string[];
  fees?: { title: string; amount: number }[];
}

export interface UpdateRoomTypePayload extends Partial<CreateRoomTypePayload> {}

// ── Redux State ───────────────────────────────────────────────────────────────
export interface PropertyState {
  list: Property[];
  selected: Property | null;
  selectedRoomType: RoomType | null;
  isLoading: boolean;
  error: string | null;
}
