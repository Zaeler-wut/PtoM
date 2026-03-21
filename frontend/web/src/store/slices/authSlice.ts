import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AuthState, LoginPayload, RegisterPayload } from "../../types/auth.types";
import { authApi } from "../../api/auth/authApi";

const initialState: AuthState = {
  accessToken: null,
  user: null,
  isLoading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (payload: LoginPayload, { rejectWithValue }) => {
    try {
      return await authApi.login(payload);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Login failed");
    }
  }
);

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      return await authApi.register(payload);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message ?? "Register failed");
    }
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await authApi.logout();
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokens(state, action) {
      state.accessToken = action.payload.accessToken;
    },
    logout(state) {
      state.accessToken = null;
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(registerThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(logoutThunk.fulfilled, (state) => {
      state.accessToken = null;
      state.user = null;
    });
  },
});

export const { setTokens, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
