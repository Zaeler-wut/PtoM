import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { tenantApi } from "../../api/tenant/tenantApi";
import type { TenantState } from "../../types/tenant.types";

const initialState: TenantState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

export const fetchTenants = createAsyncThunk(
  "tenant/fetchList",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      return await tenantApi.getList(propertyId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch tenants");
    }
  }
);

export const fetchTenantDetail = createAsyncThunk(
  "tenant/fetchDetail",
  async (
    { propertyId, contractId }: { propertyId: string; contractId: string },
    { rejectWithValue }
  ) => {
    try {
      return await tenantApi.getDetail(propertyId, contractId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch tenant");
    }
  }
);

const tenantSlice = createSlice({
  name: "tenant",
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTenants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchTenants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchTenantDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTenantDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchTenantDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelected, clearError } = tenantSlice.actions;
export default tenantSlice.reducer;
