import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import * as SecureStore from "expo-secure-store"
import { authApi, type RegisterPayload } from "../../api/auth/authApi"
import { setAccessToken } from "../../api/axiosInstance"
import type { AuthState, LoginPayload } from "../../types/auth.types"

export const registerThunk = createAsyncThunk(
  "auth/register",
  async (data: RegisterPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.register(data)
      if (!res.accessToken || !res.refreshToken) throw new Error("Invalid response from server")
      setAccessToken(res.accessToken)
      await SecureStore.setItemAsync("refreshToken", res.refreshToken)
      return res
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? err?.message ?? "สมัครสมาชิกไม่สำเร็จ")
    }
  }
)

export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data)
      setAccessToken(res.accessToken)
      await SecureStore.setItemAsync("refreshToken", res.refreshToken)
      return res
    } catch (err: any) {
      // Network error (ไม่มี response = backend ไม่ตอบ)
      if (!err.response) {
        console.error("[login] network error:", err.message)
        return rejectWithValue("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ")
      }
      console.error("[login] status:", err.response.status, "body:", JSON.stringify(err.response.data))
      const msg = err.response?.data?.error ?? ""
      if (msg === "User account is inactive") return rejectWithValue("บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ")
      if (err.response.status === 401) return rejectWithValue("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      return rejectWithValue(msg || "เกิดข้อผิดพลาด กรุณาลองใหม่")
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
      if (!res.accessToken) throw new Error("No token")
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
  async () => {
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
  isRestored: false,
  error: null,
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null },
    clearAuth: (state) => {
      state.user = null
      state.accessToken = null
    },
    updateUserName: (state, action: { payload: { firstName: string; lastName: string } }) => {
      if (state.user) {
        state.user.name = `${action.payload.firstName} ${action.payload.lastName}`
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
        state.isRestored = true
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(loginThunk.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.isLoading = false
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
        state.isRestored = true
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(restoreAuthThunk.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
        state.isRestored = true
      })
      .addCase(restoreAuthThunk.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.isRestored = true
      })

    builder
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
      })
  },
})

export const { clearError, clearAuth, updateUserName } = authSlice.actions
export default authSlice.reducer
