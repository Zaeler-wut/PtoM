import "../src/global.css"
import { Stack } from "expo-router"
import { Provider } from "react-redux"
import { store } from "../src/store"
import { AppInitializer } from "../src/components/layout/AppInitializer"
import { StatusBar } from "expo-status-bar"

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="light" backgroundColor="#7C5CFC" translucent={false} />
      <AppInitializer />
      <Stack screenOptions={{ headerShown: false }} />
    </Provider>
  )
}
