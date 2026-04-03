import { createAsyncThunk, createSlice } from "@reduxjs/toolkit"
import { propertyApi } from "../../api/property/propertyApi"
import type { PropertyState, Property } from "../../types/property.types"

export const fetchProperties = createAsyncThunk(
  "property/fetchList",
  async (_, { rejectWithValue }) => {
    try {
      return await propertyApi.getList()
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "โหลดข้อมูลไม่สำเร็จ")
    }
  }
)

export const fetchPropertyDetail = createAsyncThunk(
  "property/fetchDetail",
  async (propertyId: string, { rejectWithValue }) => {
    try {
      return await propertyApi.getDetail(propertyId)
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.error ?? "โหลดข้อมูลไม่สำเร็จ")
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
    selectProperty: (state, action: { payload: Property }) => {
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
      .addCase(fetchPropertyDetail.pending, (state) => { state.isLoading = true })
      .addCase(fetchPropertyDetail.fulfilled, (state, action) => {
        state.isLoading = false
        state.selected = action.payload
      })
      .addCase(fetchPropertyDetail.rejected, (state, action) => { state.isLoading = false; state.error = action.payload as string })
  },
})

export const { selectProperty, clearSelected } = propertySlice.actions
export default propertySlice.reducer
