import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { bookingApi } from "../../api/booking/bookingApi";
import type { BookingState } from "../../types/booking.types";

const initialState: BookingState = {
  list: [],
  selected: null,
  prefill: null,
  isLoading: false,
  error: null,
};

export const fetchBookings = createAsyncThunk(
  "booking/fetchList",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      return await bookingApi.getList(propertyId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch bookings");
    }
  }
);

export const fetchBookingDetail = createAsyncThunk(
  "booking/fetchDetail",
  async (
    { propertyId, bookingId }: { propertyId: string; bookingId: string },
    { rejectWithValue }
  ) => {
    try {
      return await bookingApi.getDetail(propertyId, bookingId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch booking");
    }
  }
);

export const fetchContractPrefill = createAsyncThunk(
  "booking/fetchPrefill",
  async (
    { propertyId, bookingId }: { propertyId: string; bookingId: string },
    { rejectWithValue }
  ) => {
    try {
      return await bookingApi.getContractPrefill(propertyId, bookingId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch prefill");
    }
  }
);

export const confirmBooking = createAsyncThunk(
  "booking/confirm",
  async (
    { propertyId, bookingId }: { propertyId: string; bookingId: string },
    { rejectWithValue }
  ) => {
    try {
      return await bookingApi.confirm(propertyId, bookingId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to confirm booking");
    }
  }
);

export const cancelBooking = createAsyncThunk(
  "booking/cancel",
  async (
    {
      propertyId,
      bookingId,
      reason,
    }: { propertyId: string; bookingId: string; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      return await bookingApi.cancel(propertyId, bookingId, reason);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to cancel booking");
    }
  }
);

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    clearSelected(state) {
      state.selected = null;
      state.prefill = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchBookingDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBookingDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchBookingDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchContractPrefill.fulfilled, (state, action) => {
      state.prefill = action.payload;
    });

    // confirm → update item in list
    builder
      .addCase(confirmBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(confirmBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.list.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(confirmBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // cancel → update item in list
    builder
      .addCase(cancelBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const idx = state.list.findIndex((b) => b.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
        if (state.selected?.id === action.payload.id) {
          state.selected = action.payload;
        }
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelected, clearError } = bookingSlice.actions;
export default bookingSlice.reducer;
