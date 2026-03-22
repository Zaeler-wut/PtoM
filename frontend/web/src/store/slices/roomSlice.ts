import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roomApi } from "../../api/room/roomApi";
import type { RoomState, CreateRoomPayload } from "../../types/room.types";

const initialState: RoomState = {
  list: [],
  isLoading: false,
  error: null,
};

export const fetchRooms = createAsyncThunk(
  "room/fetchList",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      return await roomApi.getList(propertyId);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to fetch rooms");
    }
  }
);

export const createRoom = createAsyncThunk(
  "room/create",
  async (
    { propertyId, payload }: { propertyId: string; payload: CreateRoomPayload },
    { rejectWithValue }
  ) => {
    try {
      return await roomApi.create(propertyId, payload);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(e.response?.data?.message ?? "Failed to create room");
    }
  }
);

const roomSlice = createSlice({
  name: "room",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list = action.payload;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.list.push(action.payload);
      })
      .addCase(createRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = roomSlice.actions;
export default roomSlice.reducer;
