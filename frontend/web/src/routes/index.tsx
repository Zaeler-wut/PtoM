import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import PropertyListPage from "../pages/property/PropertyListPage";
import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import RoomListPage from "../pages/room/RoomListPage";
import PropertySettingsPage from "../pages/property/PropertySettingsPage";


export const router = createBrowserRouter([
  // ── Public ──
  { path: "/login", element: <LoginPage /> },

  // ── Protected ──
  {
    path: "/properties",
    element: (
      <ProtectedRoute>
        <PropertyListPage />
      </ProtectedRoute>
    ),
  },

  {
    path: "/properties/:propertyId",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      // { path: "rooms", element: <RoomListPage /> },
      // { path: "tenants", element: <TenantListPage /> },
      // { path: "bookings", element: <BookingListPage /> },
      // { path: "contracts", element: <ContractListPage /> },
      // { path: "billing", element: <BillingSummaryPage /> },
      // { path: "move-out", element: <MoveOutListPage /> },
      // { path: "edit", element: <PropertyEditPage /> },
    ],
  },

  // ── Default ──
  { path: "/", element: <Navigate to="/login" replace /> },
  { path: "*", element: <Navigate to="/login" replace /> },
])