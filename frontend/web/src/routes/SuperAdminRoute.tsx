import { Navigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../store"

interface Props {
  children: React.ReactNode
}

const SuperAdminRoute = ({ children }: Props) => {
  const { accessToken, user } = useSelector((state: RootState) => state.auth)

  if (!accessToken) return <Navigate to="/login" replace />
  if (user?.role !== "SUPERADMIN") return <Navigate to="/properties" replace />

  return <>{children}</>
}

export default SuperAdminRoute
