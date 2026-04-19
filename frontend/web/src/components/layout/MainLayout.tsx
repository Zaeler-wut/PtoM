import { useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchPropertyDetail, clearSelected } from "../../store/slices/propertySlice";
import { ToastProvider } from "../shared/Toast";

export default function MainLayout() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const dispatch = useAppDispatch();
  const { selected: property } = useAppSelector((s) => s.property);

  useEffect(() => {
    if (!propertyId) return;
    if (property?.id && property.id !== propertyId) {
      dispatch(clearSelected());
    }
    dispatch(fetchPropertyDetail(propertyId));
  }, [propertyId, dispatch]);

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar propertyId={propertyId ?? ""} propertyName={property?.name} propertyLogoUrl={property?.logoUrl} />
        <main className="flex-1 min-w-0 overflow-auto">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  );
}
