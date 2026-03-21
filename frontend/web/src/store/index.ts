import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import propertyReducer from "./slices/propertySlice";
import dashboardReducer from "./slices/dashboardSlice";
// import roomReducer from "./slices/roomSlice";
// import bookingReducer from "./slices/bookingSlice";
// import contractReducer from "./slices/contractSlice";
// import tenantReducer from "./slices/tenantSlice";
// import billingReducer from "./slices/billingSlice";
// import moveoutReducer from "./slices/moveoutSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    dashboard: dashboardReducer,
    // room: roomReducer,
    // booking: bookingReducer,
    // contract: contractReducer,
    // tenant: tenantReducer,
    // billing: billingReducer,
    // moveout: moveoutReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
