import { axiosInstance } from "../axiosInstance";
import { AUTH_ENDPOINTS } from "../endpoints";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
} from "../../types/auth.types";

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(
      AUTH_ENDPOINTS.LOGIN,
      payload
    );
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>(
      AUTH_ENDPOINTS.REGISTER,
      payload
    );
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post(AUTH_ENDPOINTS.LOGOUT);
  },

  refreshToken: async (): Promise<{ accessToken: string }> => {
    const { data } = await axiosInstance.post<{ accessToken: string }>(
      AUTH_ENDPOINTS.REFRESH
    );
    return data;
  },
};
