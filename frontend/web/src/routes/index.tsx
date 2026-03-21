import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import PropertyListPage from "../pages/property/PropertyListPage";
import MainLayout from "../components/layout/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import RoomListPage from "../pages/room/RoomListPage";

const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  { path: "/properties", element: <PropertyListPage /> },
  {
    path: "/properties/:propertyId",
    element: <MainLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "rooms", element: <RoomListPage /> },
    ],
  },
  { path: "/", element: <Navigate to="/properties/test-id/rooms" replace /> },
  { path: "*", element: <Navigate to="/properties/test-id/rooms" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}