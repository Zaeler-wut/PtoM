import AsyncStorage from '@react-native-async-storage/async-storage'
import type { GeminiMeterResult } from '../lib/geminiService'

export interface AiMeterDraft {
  electric: string
  water: string
}

const STORAGE_KEY = 'ai_meter_drafts'

export const aiMeterStore = {
  drafts: {} as Record<string, AiMeterDraft>,

  async set(results: GeminiMeterResult[]) {
    const map: Record<string, AiMeterDraft> = { ...this.drafts }
    for (const r of results) {
      if (!r.roomNumber) continue
      const rn = r.roomNumber.trim()
      if (!map[rn]) map[rn] = { electric: '', water: '' }
      if (r.type === 'electric') map[rn].electric = r.meterValue != null ? String(r.meterValue) : ''
      else map[rn].water = r.meterValue != null ? String(r.meterValue) : ''
    }
    this.drafts = map
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  },

  async load() {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY)
      if (raw) this.drafts = JSON.parse(raw)
    } catch {
      this.drafts = {}
    }
  },

  getForRoom(roomNumber: string): AiMeterDraft | null {
    const key = roomNumber.trim()
    return this.drafts[key] ?? null
  },

  setForRoom(roomNumber: string, draft: AiMeterDraft) {
    this.drafts[roomNumber.trim()] = draft
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.drafts))
  },

  async clear() {
    this.drafts = {}
    await AsyncStorage.removeItem(STORAGE_KEY)
  },
}
