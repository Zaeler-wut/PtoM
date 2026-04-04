import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { router } from "expo-router"

const BASE_URL = "http://192.168.1.44:8080/api"

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

// ── In-memory token ──
let _accessToken: string | null = null

export const getAccessToken = () => _accessToken
export const setAccessToken = (token: string | null) => {
  _accessToken = token
}

// ── Request interceptor ──
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── Response interceptor — auto refresh ──
let isRefreshing = false
let failedQueue: { resolve: (token: string) => void; reject: (err: any) => void }[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error)
    else p.resolve(token!)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`
            return api(original)
          })
          .catch((err) => Promise.reject(err))
      }

      original._retry = true
      isRefreshing = true

      try {
        const refreshToken = await SecureStore.getItemAsync("refreshToken")
        if (!refreshToken) throw new Error("No refresh token")

        const res = await axios.post(`${BASE_URL}/auth/refresh-token`, { refreshToken })
        const newToken = res.data.accessToken
        if (!newToken) throw new Error("No token")

        setAccessToken(newToken)
        await SecureStore.setItemAsync("refreshToken", res.data.refreshToken ?? refreshToken)

        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (err) {
        processQueue(err, null)
        setAccessToken(null)
        await SecureStore.deleteItemAsync("refreshToken")
        router.replace("/(auth)/login")
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
