import { Outlet, useParams } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAppSelector } from "../../store/hooks";

export default function MainLayout() {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { selected: property } = useAppSelector((s) => s.property);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar propertyId={propertyId ?? ""} propertyName={property?.name} />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}