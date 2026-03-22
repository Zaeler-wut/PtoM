import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
})

// ── Request interceptor — แนบ accessToken จาก memory ──
api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ── In-memory token store ──
let _accessToken: string | null = null

export const getAccessToken = () => _accessToken
export const setAccessToken = (token: string | null) => { _accessToken = token }

// ── Response interceptor — auto refresh token ──
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
        const res = await axios.post("/api/auth/refresh-token", {}, {
          withCredentials: true,
        })

        const newToken = res.data.accessToken
        setAccessToken(newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        original.headers.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        return api(original)
      } catch (err) {
        processQueue(err, null)
        setAccessToken(null)
        window.location.href = "/login"
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api