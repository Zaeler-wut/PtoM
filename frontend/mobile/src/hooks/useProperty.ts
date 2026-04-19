import { useAppDispatch, useAppSelector } from "../store/hooks"
import { fetchProperties, selectProperty } from "../store/slices/propertySlice"
import type { Property } from "../types/property.types"

export function useProperty() {
  const dispatch = useAppDispatch()
  const { list, isLoading, error } = useAppSelector((s) => s.property)

  const loadList = () => dispatch(fetchProperties())
  const select = (prop: Property) => dispatch(selectProperty(prop))

  return { list, isLoading, error, loadList, select }
}
