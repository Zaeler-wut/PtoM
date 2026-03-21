import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { authApi } from "../../api/auth/authApi"
import type { AuthState, LoginPayload } from "../../types/auth.types"

// ─────────────────────────────────────────
// THUNKS
// ─────────────────────────────────────────

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data)
      sessionStorage.setItem("accessToken", res.accessToken)
      return res
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Login failed")
    }
  }
)

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
      sessionStorage.removeItem("accessToken")
    } catch (err: any) {
      sessionStorage.removeItem("accessToken")
      return rejectWithValue(err.response?.data?.error ?? "Logout failed")
    }
  }
)

// ─────────────────────────────────────────
// SLICE
// ─────────────────────────────────────────

const initialState: AuthState = {
  user: null,
  accessToken: sessionStorage.getItem("accessToken"),
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    setAccessToken: (state, action) => { state.accessToken = action.payload },
  },
  extraReducers: (builder) => {
    // LOGIN
    builder
      .addCase(loginThunk.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // LOGOUT
    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.error = null
      })
  },
})

export const { clearError, setAccessToken } = authSlice.actions
export default authSlice.reducer