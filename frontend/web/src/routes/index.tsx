import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import RoomListPage from "../pages/room/RoomListPage";
import PropertySettingsPage from "../pages/property/PropertySettingsPage";
import RoomTypePage from "../pages/property/RoomTypePage";
import MoveOutListPage from "../pages/moveout/MoveOutListPage";
import BillingSummaryPage from "../pages/billing/BillingSummaryPage";
import BookingListPage from "../pages/booking/BookingListPage";

const PROPERTY_ID = "test-id";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/properties/:propertyId",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "rooms", element: <RoomListPage /> },
      { path: "settings", element: <PropertySettingsPage /> },
      { path: "edit", element: <RoomTypePage /> },
      { path: "move-out", element: <MoveOutListPage /> },
      { path: "billing", element: <BillingSummaryPage /> },
      { path: "bookings", element: <BookingListPage /> },
    ],
  },
  { path: "/", element: <Navigate to={`/properties/${PROPERTY_ID}/dashboard`} replace /> },
  { path: "*", element: <Navigate to={`/properties/${PROPERTY_ID}/dashboard`} replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}