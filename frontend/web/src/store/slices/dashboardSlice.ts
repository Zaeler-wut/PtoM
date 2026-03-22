import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { dashboardApi } from "../../api/dashboard/dashboardApi";
import type { DashboardState } from "../../types/dashboard.types";

const initialState: DashboardState = {
  summary: null,
  isLoading: false,
  error: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  "dashboard/fetchSummary",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      return await dashboardApi.getSummary(propertyId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch dashboard");
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;
