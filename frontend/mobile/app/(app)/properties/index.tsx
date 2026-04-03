import { useEffect } from "react"
import { useRouter } from "expo-router"
import { useProperty } from "../../../src/hooks/useProperty"
import PropertyListScreen from "../../../src/screens/property/PropertyListScreen"

export default function PropertiesPage() {
  const router = useRouter()
  const { list, isLoading, loadList, select } = useProperty()

  useEffect(() => { loadList() }, [])

  const handleSelect = (propertyId: string) => {
    const prop = list.find((p) => p.id === propertyId)
    if (prop) select(prop)
    router.push(`/(app)/${propertyId}/dashboard`)
  }

  return (
    <PropertyListScreen
      properties={list}
      isLoading={isLoading}
      onSelectProperty={handleSelect}
    />
  )
}
