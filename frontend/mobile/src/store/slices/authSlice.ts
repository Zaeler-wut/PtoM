import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import * as SecureStore from "expo-secure-store"
import { authApi } from "../../api/auth/authApi"
import { setAccessToken } from "../../api/axiosInstance"
import type { AuthState, LoginPayload } from "../../types/auth.types"

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data)
      setAccessToken(res.accessToken)
      await SecureStore.setItemAsync("refreshToken", res.refreshToken)
      return res
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "เข้าสู่ระบบไม่สำเร็จ")
    }
  }
)

export const restoreAuthThunk = createAsyncThunk(
  "auth/restore",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await SecureStore.getItemAsync("refreshToken")
      if (!refreshToken) throw new Error("No token")
      const res = await authApi.refresh(refreshToken)
      setAccessToken(res.accessToken)
      await SecureStore.setItemAsync("refreshToken", res.refreshToken)
      const user = await authApi.me()
      return { accessToken: res.accessToken, user }
    } catch (err: any) {
      return rejectWithValue("Session expired")
    }
  }
)

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
    } catch {}
    finally {
      setAccessToken(null)
      await SecureStore.deleteItemAsync("refreshToken")
    }
  }
)

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(restoreAuthThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
      })
      .addCase(restoreAuthThunk.rejected, (state) => {
        state.user = null
        state.accessToken = null
      })

    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
      })
  },
})

export const { clearError } = authSlice.actions
export default authSlice.reducer
