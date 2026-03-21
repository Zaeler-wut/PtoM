import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { dashboardApi } from "../../api/dashboard/dashboardApi"
import type { DashboardState } from "../../types/dashboard.types"

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const res = await dashboardApi.getSummary(propertyId)
      // map field ให้ตรงกับ component เดิม
      return {
        ...res,
        currentMonthRevenue: res.monthlyRevenue,
        pendingPayments: res.unpaidBills,
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Failed to fetch dashboard")
    }
  }
)

export const fetchRevenue = createAsyncThunk(
  "dashboard/fetchRevenue",
  async ({ propertyId, months }: { propertyId: string; months?: number }, { rejectWithValue }) => {
    try {
      return await dashboardApi.getRevenue(propertyId, months ?? 6)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Failed to fetch revenue")
    }
  }
)

const initialState: DashboardState = {
  summary: null,
  revenue: null,
  isLoading: false,
  error: null,
}

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false
        state.summary = action.payload
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    builder
      .addCase(fetchRevenue.fulfilled, (state, action) => {
        state.revenue = action.payload
      })
  },
})

export default dashboardSlice.reducer