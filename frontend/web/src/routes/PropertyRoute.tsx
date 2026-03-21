import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

export default function PropertyRoute() {
  const { propertyId } = useParams();
  const { list } = useAppSelector((s) => s.property);

  // ถ้ายังไม่มี property list เลย → ไปเลือก property ก่อน
  if (!propertyId || !list.find((p) => p.id === propertyId)) {
    return <Navigate to="/properties" replace />;
  }

  return <Outlet />;
}
