import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { propertyApi } from "../../api/property/propertyApi";
import type {
  PropertyState,
  Property,
  RoomType,
  CreatePropertyPayload,
  UpdatePropertyPayload,
  CreateRoomTypePayload,
  UpdateRoomTypePayload,
} from "../../types/property.types";

const initialState: PropertyState = {
  list: [],
  selected: null,
  selectedRoomType: null,
  isLoading: false,
  error: null,
};

// ── Thunks ────────────────────────────────────────────────────────────────────
export const fetchProperties = createAsyncThunk(
  "property/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      return await propertyApi.getList();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch properties");
    }
  }
);

export const fetchPropertyDetail = createAsyncThunk(
  "property/fetchDetail",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      return await propertyApi.getDetail(propertyId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch property");
    }
  }
);

export const createProperty = createAsyncThunk(
  "property/create",
  async (payload: CreatePropertyPayload, { rejectWithValue }) => {
    try {
      return await propertyApi.create(payload);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to create property");
    }
  }
);

export const updateProperty = createAsyncThunk(
  "property/update",
  async (
    { propertyId, payload }: { propertyId: string; payload: UpdatePropertyPayload },
    { rejectWithValue }
  ) => {
    try {
      return await propertyApi.update(propertyId, payload);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to update property");
    }
  }
);

export const fetchRoomTypeDetail = createAsyncThunk(
  "property/fetchRoomTypeDetail",
  async (
    { propertyId, roomTypeId }: { propertyId: string; roomTypeId: string },
    { rejectWithValue }
  ) => {
    try {
      return await propertyApi.getRoomTypeDetail(propertyId, roomTypeId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch room type");
    }
  }
);

export const createRoomType = createAsyncThunk(
  "property/createRoomType",
  async (
    { propertyId, payload }: { propertyId: string; payload: CreateRoomTypePayload },
    { rejectWithValue }
  ) => {
    try {
      return await propertyApi.createRoomType(propertyId, payload);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to create room type");
    }
  }
);

export const updateRoomType = createAsyncThunk(
  "property/updateRoomType",
  async (
    {
      propertyId,
      roomTypeId,
      payload,
    }: { propertyId: string; roomTypeId: string; payload: UpdateRoomTypePayload },
    { rejectWithValue }
  ) => {
    try {
      return await propertyApi.updateRoomType(propertyId, roomTypeId, payload);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to update room type");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    setSelectedProperty(state, action: { payload: Property }) {
      state.selected = action.payload;
    },
    clearSelectedProperty(state) {
      state.selected = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchList
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchDetail
    builder
      .addCase(fetchPropertyDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchPropertyDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // create
    builder
      .addCase(createProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // update
    builder
      .addCase(updateProperty.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selected = action.payload;
        const idx = state.list.findIndex((p) => p.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // fetchRoomTypeDetail
    builder
      .addCase(fetchRoomTypeDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoomTypeDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRoomType = action.payload;
      })
      .addCase(fetchRoomTypeDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // createRoomType
    builder
      .addCase(createRoomType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRoomType.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.selected) {
          state.selected.roomTypes = [
            ...(state.selected.roomTypes ?? []),
            action.payload,
          ];
        }
      })
      .addCase(createRoomType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // updateRoomType
    builder
      .addCase(updateRoomType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRoomType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedRoomType = action.payload;
        if (state.selected?.roomTypes) {
          const idx = state.selected.roomTypes.findIndex(
            (rt: RoomType) => rt.id === action.payload.id
          );
          if (idx !== -1) state.selected.roomTypes[idx] = action.payload;
        }
      })
      .addCase(updateRoomType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setSelectedProperty, clearSelectedProperty, clearError } =
  propertySlice.actions;
export default propertySlice.reducer;
