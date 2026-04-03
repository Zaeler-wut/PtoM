import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import propertyReducer from "./slices/propertySlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
