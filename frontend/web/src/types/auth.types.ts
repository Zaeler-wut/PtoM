// ── Enums ────────────────────────────────────────────────────────────────────
export type Role = "USER" | "ADMIN";

// ── User Model ───────────────────────────────────────────────────────────────
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  lineId: string | null;
  citizenId: string | null;
  address: string | null;
  role: Role;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  type: string;
}

// ── Auth Payloads ─────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// ── Redux State ───────────────────────────────────────────────────────────────
export interface AuthState {
  accessToken: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
