import { useCallback } from 'react'
import { useRouter, useFocusEffect } from 'expo-router'
import { useProperty } from '../../../src/hooks/useProperty'
import PropertyListScreen from '../../../src/screens/property/PropertyListScreen'

export default function AdminHomePage() {
  const router = useRouter()
  const { list, isLoading, loadList, select } = useProperty()

  useFocusEffect(useCallback(() => { loadList() }, []))

  const handleSelect = (propertyId: string) => {
    const prop = list.find(p => p.id === propertyId)
    if (prop) select(prop)
    router.push(`/(app)/${propertyId}/dashboard` as any)
  }

  return (
    <PropertyListScreen
      properties={list}
      isLoading={isLoading}
      onSelectProperty={handleSelect}
    />
  )
}
