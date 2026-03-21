import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { contractApi } from "../../api/contract/contractApi";
import type {
  Contract,
  ContractState,
  CreateOnlineContractPayload,
  CreateOfflineContractPayload,
  UpdateContractPayload,
} from "../../types/contract.types";

const initialState: ContractState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
};

export const fetchContracts = createAsyncThunk(
  "contract/fetchList",
  async (propertyId: string, { rejectWithValue }) => {
    try { return await contractApi.getList(propertyId); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch contracts");
    }
  }
);

export const fetchContractDetail = createAsyncThunk(
  "contract/fetchDetail",
  async ({ propertyId, contractId }: { propertyId: string; contractId: string }, { rejectWithValue }) => {
    try { return await contractApi.getDetail(propertyId, contractId); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch contract");
    }
  }
);

export const updateContract = createAsyncThunk(
  "contract/update",
  async ({ propertyId, contractId, payload }: { propertyId: string; contractId: string; payload: UpdateContractPayload }, { rejectWithValue }) => {
    try { return await contractApi.update(propertyId, contractId, payload); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to update contract");
    }
  }
);

export const createOnlineContract = createAsyncThunk(
  "contract/createOnline",
  async ({ propertyId, payload }: { propertyId: string; payload: CreateOnlineContractPayload }, { rejectWithValue }) => {
    try { return await contractApi.createOnline(propertyId, payload); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to create contract");
    }
  }
);

export const createOfflineContract = createAsyncThunk(
  "contract/createOffline",
  async ({ propertyId, payload }: { propertyId: string; payload: CreateOfflineContractPayload }, { rejectWithValue }) => {
    try { return await contractApi.createOffline(propertyId, payload); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to create contract");
    }
  }
);

const contractSlice = createSlice({
  name: "contract",
  initialState,
  reducers: {
    clearSelected(state) { state.selected = null; },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContracts.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchContracts.fulfilled, (state, action: PayloadAction<Contract[]>) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(fetchContractDetail.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(fetchContractDetail.fulfilled, (state, action: PayloadAction<Contract>) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchContractDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(updateContract.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(updateContract.fulfilled, (state, action: PayloadAction<Contract>) => {
        state.isLoading = false;
        state.selected = action.payload;
        const idx = state.list.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createOnline
    builder
      .addCase(createOnlineContract.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createOnlineContract.fulfilled, (state, action: PayloadAction<Contract>) => {
        state.isLoading = false;
        state.selected = action.payload;
        state.list.push(action.payload);
      })
      .addCase(createOnlineContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createOffline
    builder
      .addCase(createOfflineContract.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(createOfflineContract.fulfilled, (state, action: PayloadAction<Contract>) => {
        state.isLoading = false;
        state.selected = action.payload;
        state.list.push(action.payload);
      })
      .addCase(createOfflineContract.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelected, clearError } = contractSlice.actions;
export default contractSlice.reducer;