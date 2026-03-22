import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { billingApi } from "../../api/billing/billingApi";
import type { BillingState, PaymentStatus } from "../../types/billing.types";

const currentDate = new Date();

const initialState: BillingState = {
  summary: null,
  payments: [],
  selectedPayment: null,
  invoice: null,
  fees: null,
  month: currentDate.getMonth() + 1,
  year: currentDate.getFullYear(),
  isLoading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────
export const fetchBillingSummary = createAsyncThunk(
  "billing/fetchSummary",
  async (
    { propertyId, month, year }: { propertyId: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.getSummary(propertyId, month, year);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch billing summary");
    }
  }
);

export const fetchInvoice = createAsyncThunk(
  "billing/fetchInvoice",
  async (
    {
      propertyId,
      contractId,
      month,
      year,
    }: { propertyId: string; contractId: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.getInvoice(propertyId, contractId, month, year);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch invoice");
    }
  }
);

export const fetchPayments = createAsyncThunk(
  "billing/fetchPayments",
  async (
    {
      propertyId,
      month,
      year,
      status,
    }: { propertyId: string; month: number; year: number; status?: PaymentStatus },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.getPayments(propertyId, month, year, status);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch payments");
    }
  }
);

export const fetchPaymentDetail = createAsyncThunk(
  "billing/fetchPaymentDetail",
  async (
    { propertyId, paymentId }: { propertyId: string; paymentId: string },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.getPaymentDetail(propertyId, paymentId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch payment");
    }
  }
);

export const confirmPayment = createAsyncThunk(
  "billing/confirmPayment",
  async (
    { propertyId, paymentId }: { propertyId: string; paymentId: string },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.confirmPayment(propertyId, paymentId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to confirm payment");
    }
  }
);

export const rejectPayment = createAsyncThunk(
  "billing/rejectPayment",
  async (
    { propertyId, paymentId }: { propertyId: string; paymentId: string },
    { rejectWithValue }
  ) => {
    try {
      return await billingApi.rejectPayment(propertyId, paymentId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to reject payment");
    }
  }
);

export const sendBill = createAsyncThunk(
  "billing/sendBill",
  async (
    {
      propertyId,
      contractId,
      month,
      year,
    }: { propertyId: string; contractId: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      await billingApi.sendBill(propertyId, contractId, month, year);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to send bill");
    }
  }
);

export const sendAllBills = createAsyncThunk(
  "billing/sendAll",
  async (
    { propertyId, month, year }: { propertyId: string; month: number; year: number },
    { rejectWithValue }
  ) => {
    try {
      await billingApi.sendAll(propertyId, month, year);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to send all bills");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const billingSlice = createSlice({
  name: "billing",
  initialState,
  reducers: {
    setMonthYear(state, action: { payload: { month: number; year: number } }) {
      state.month = action.payload.month;
      state.year = action.payload.year;
    },
    clearSelectedPayment(state) {
      state.selectedPayment = null;
    },
    clearInvoice(state) {
      state.invoice = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBillingSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBillingSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchBillingSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchInvoice.fulfilled, (state, action) => {
        state.invoice = action.payload;
      });

    builder
      .addCase(fetchPayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.payments = action.payload;
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchPaymentDetail.fulfilled, (state, action) => {
        state.selectedPayment = action.payload;
      });

    // confirm → update in list
    builder
      .addCase(confirmPayment.fulfilled, (state, action) => {
        const idx = state.payments.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.payments[idx] = action.payload;
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      });

    // reject → update in list
    builder
      .addCase(rejectPayment.fulfilled, (state, action) => {
        const idx = state.payments.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.payments[idx] = action.payload;
        if (state.selectedPayment?.id === action.payload.id) {
          state.selectedPayment = action.payload;
        }
      });
  },
});

export const { setMonthYear, clearSelectedPayment, clearInvoice, clearError } =
  billingSlice.actions;
export default billingSlice.reducer;
