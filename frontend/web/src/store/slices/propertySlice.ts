import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { propertyApi } from "../../api/property/propertyApi"
import type { PropertyState, PropertyListItem } from "../../types/property.types"

export const fetchProperties = createAsyncThunk(
  "property/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      const res = await propertyApi.getList()
      console.log("properties:", res)  // ← เพิ่มตรงนี้
      return res
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "Failed to fetch properties")
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProperties.fulfilled, (state, action) => {
        state.isLoading = false
        state.list = action.payload
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { selectProperty } = propertySlice.actions
export default propertySlice.reducer