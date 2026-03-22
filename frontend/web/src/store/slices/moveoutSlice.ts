import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { moveoutApi } from "../../api/moveout/moveoutApi";
import type {
  MoveOutState,
  MoveOutBillStatus,
  MoveOutPreviewPayload,
  CreateMoveOutBillPayload,
} from "../../types/moveout.types";

const initialState: MoveOutState = {
  list: [],
  selected: null,
  preview: null,
  year: new Date().getFullYear(),
  statusFilter: "ALL",
  isLoading: false,
  error: null,
};

export const fetchMoveOuts = createAsyncThunk(
  "moveout/fetchList",
  async (
    {
      propertyId,
      year,
      status,
    }: { propertyId: string; year: number; status?: MoveOutBillStatus },
    { rejectWithValue }
  ) => {
    try {
      return await moveoutApi.getList(propertyId, year, status);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch move-outs");
    }
  }
);

export const fetchMoveOutBillDetail = createAsyncThunk(
  "moveout/fetchDetail",
  async (
    { propertyId, moveOutBillId }: { propertyId: string; moveOutBillId: string },
    { rejectWithValue }
  ) => {
    try {
      return await moveoutApi.getBillDetail(propertyId, moveOutBillId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch move-out bill");
    }
  }
);

export const previewMoveOut = createAsyncThunk(
  "moveout/preview",
  async (
    {
      propertyId,
      contractId,
      payload,
    }: { propertyId: string; contractId: string; payload: MoveOutPreviewPayload },
    { rejectWithValue }
  ) => {
    try {
      return await moveoutApi.preview(propertyId, contractId, payload);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to preview move-out");
    }
  }
);

export const createMoveOutBill = createAsyncThunk(
  "moveout/createBill",
  async (
    {
      propertyId,
      contractId,
      payload,
    }: { propertyId: string; contractId: string; payload: CreateMoveOutBillPayload },
    { rejectWithValue }
  ) => {
    try {
      return await moveoutApi.createBill(propertyId, contractId, payload);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to create move-out bill");
    }
  }
);

const moveoutSlice = createSlice({
  name: "moveout",
  initialState,
  reducers: {
    setYear(state, action: { payload: number }) {
      state.year = action.payload;
    },
    setStatusFilter(state, action: { payload: MoveOutBillStatus | "ALL" }) {
      state.statusFilter = action.payload;
    },
    clearSelected(state) {
      state.selected = null;
      state.preview = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMoveOuts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMoveOuts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchMoveOuts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchMoveOutBillDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMoveOutBillDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchMoveOutBillDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(previewMoveOut.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(previewMoveOut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preview = action.payload;
      })
      .addCase(previewMoveOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createMoveOutBill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createMoveOutBill.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
        state.list.push(action.payload);
      })
      .addCase(createMoveOutBill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setYear, setStatusFilter, clearSelected, clearError } =
  moveoutSlice.actions;
export default moveoutSlice.reducer;
