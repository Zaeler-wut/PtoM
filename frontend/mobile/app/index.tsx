import { Redirect } from 'expo-router'
import { ActivityIndicator, View } from 'react-native'
import { useAppSelector } from '../src/store/hooks'

export default function Index() {
  const { isRestored, user } = useAppSelector((s) => s.auth)

  if (!isRestored) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0F13' }}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    )
  }

  if (!user) return <Redirect href={'/(auth)/login' as any} />

  console.log('user role:', user.role)

  if (user.role === 'ADMIN') return <Redirect href={'/(app)/(admin)/index' as any} />

  return <Redirect href={'/(app)/(tenant)/index' as any} />
}
