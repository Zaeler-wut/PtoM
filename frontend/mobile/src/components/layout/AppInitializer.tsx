import { useEffect } from "react"
import { useAppDispatch } from "../../store/hooks"
import { restoreAuthThunk } from "../../store/slices/authSlice"

export function AppInitializer() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(restoreAuthThunk())
  }, [])

  return null
}
