import { useEffect } from "react"
import { useRouter, useSegments } from "expo-router"
import { useAuth } from "../../hooks/useAuth"

export function AppInitializer() {
  const { isLoggedIn, restore } = useAuth()
  const router = useRouter()
  const segments = useSegments()

  useEffect(() => {
    restore()
  }, [])

  useEffect(() => {
    const inAuth = segments[0] === "(auth)"
    if (!isLoggedIn && !inAuth) {
      router.replace("/(auth)/login")
    } else if (isLoggedIn && inAuth) {
      router.replace("/(app)/properties")
    }
  }, [isLoggedIn, segments])

  return null
}
