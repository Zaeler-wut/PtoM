// authSlice.ts — Redux slice สำหรับ Authentication ฝั่ง web admin
// จัดการ state: user, accessToken, isLoading, error
// เรียกใช้ authApi สำหรับ login/logout
// ถูกเรียกใช้จาก LoginPage และ App (restore session)

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { authApi } from "../../api/auth/authApi"
import { setAccessToken } from "../../api/axiosInstance"
import type { AuthState, LoginPayload } from "../../types/auth.types"

// thunk: login — เรียก authApi.login แล้วเก็บ token ใน memory
// แปลง error message เป็นภาษาไทยก่อน rejectWithValue
export const loginThunk = createAsyncThunk(
  "auth/login",
  async (data: LoginPayload, { rejectWithValue }) => {
    try {
      const res = await authApi.login(data)
      setAccessToken(res.accessToken)  // เก็บใน memory (ไม่ใช้ localStorage)
      return res
    } catch (err: any) {
      const msg = err.response?.data?.error ?? ""
      if (msg === "User account is inactive") return rejectWithValue("บัญชีนี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ")
      if (msg === "Invalid credentials") return rejectWithValue("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
      return rejectWithValue(msg || "เกิดข้อผิดพลาด กรุณาลองใหม่")
    }
  }
)

// thunk: logout — เรียก authApi.logout แล้ว clear token เสมอใน finally
export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authApi.logout()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Logout failed")
    } finally {
      setAccessToken(null)  // clear memory แม้ logout fail
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
    // ล้าง error message (ใช้ก่อนเปิด form login ใหม่)
    clearError: (state) => { state.error = null },
    // restore session หลัง refresh token สำเร็จ — เซ็ต user + token ใน state
    setUser: (state, action) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      setAccessToken(action.payload.accessToken)
    },
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
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
      })
  },
})

export const { clearError, setUser } = authSlice.actions
export default authSlice.reducer
