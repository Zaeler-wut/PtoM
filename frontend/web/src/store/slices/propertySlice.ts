import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { propertyApi } from "../../api/property/propertyApi"
import type { PropertyState, Property, PropertyListItem, UpdatePropertyPayload } from "../../types/property.types"

export const fetchProperties = createAsyncThunk(
  "property/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      return await propertyApi.getList()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Failed to fetch properties")
    }
  }
)

export const fetchPropertyDetail = createAsyncThunk(
  "property/fetchDetail",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const res = await propertyApi.getDetail(propertyId)
      console.log("fetchPropertyDetail:", {
        id: res.id,
        facilities: res.facilities,
        googleMap: res.googleMap,
      })
      return res
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Failed to fetch property detail")
    }
  }
)

export const updateProperty = createAsyncThunk(
  "property/update",
  async (
    { propertyId, payload }: { propertyId: string; payload: UpdatePropertyPayload },
    { rejectWithValue }
  ) => {
    try {
      return await propertyApi.update(propertyId, payload)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Failed to update property")
    }
  }
)

const initialState: PropertyState = {
  list: [],
  selected: null,
  isLoading: false,
  error: null,
}

const propertySlice = createSlice({
  name: "property",
  initialState,
  reducers: {
    selectProperty: (state, action: { payload: PropertyListItem }) => {
      state.selected = action.payload
    },
    clearSelected: (state) => {
      state.selected = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchProperties.fulfilled, (state, action) => { state.isLoading = false; state.list = action.payload })
      .addCase(fetchProperties.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    builder
      .addCase(fetchPropertyDetail.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(fetchPropertyDetail.fulfilled, (state, action) => { state.isLoading = false; state.selected = action.payload })
      .addCase(fetchPropertyDetail.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })

    builder
      .addCase(updateProperty.pending, (state) => { state.isLoading = true; state.error = null })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.isLoading = false
        state.selected = action.payload
        const idx = state.list.findIndex((p) => p.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(updateProperty.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
  },
})

export const { selectProperty, clearSelected } = propertySlice.actions
export default propertySlice.reducer