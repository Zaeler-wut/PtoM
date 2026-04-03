import "../src/global.css"
import { Stack } from "expo-router"
import { Provider } from "react-redux"
import { store } from "../src/store"
import { AppInitializer } from "../src/components/layout/AppInitializer"

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppInitializer />
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  )
}
