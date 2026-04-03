import { useAppDispatch, useAppSelector } from "../store/hooks"
import { fetchProperties, fetchPropertyDetail, selectProperty, clearSelected } from "../store/slices/propertySlice"
import type { Property } from "../types/property.types"

export function useProperty() {
  const dispatch = useAppDispatch()
  const { list, selected, isLoading, error } = useAppSelector((s) => s.property)

  const loadList = () => dispatch(fetchProperties())
  const loadDetail = (id: string) => dispatch(fetchPropertyDetail(id))
  const select = (property: Property) => dispatch(selectProperty(property))
  const clear = () => dispatch(clearSelected())

  return { list, selected, isLoading, error, loadList, loadDetail, select, clear }
}
