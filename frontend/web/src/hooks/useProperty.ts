import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { fetchProperties, setSelectedProperty } from "../store/slices/propertySlice";

export function useProperty() {
  const dispatch = useAppDispatch();
  const { propertyId } = useParams<{ propertyId: string }>();
  const { list, selected, isLoading, error } = useAppSelector((s) => s.property);

  // Auto-select property from URL param
  useEffect(() => {
    if (!propertyId) return;
    if (list.length === 0) {
      dispatch(fetchProperties());
      return;
    }
    const found = list.find((p) => p.id === propertyId);
    if (found && selected?.id !== propertyId) {
      dispatch(setSelectedProperty(found));
    }
  }, [propertyId, list, selected, dispatch]);

  return {
    propertyId: propertyId ?? "",
    property: selected,
    properties: list,
    isLoading,
    error,
  };
}
