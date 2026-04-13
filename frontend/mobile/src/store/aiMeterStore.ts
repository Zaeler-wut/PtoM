import type { GeminiMeterResult } from '../lib/geminiService'

export interface AiMeterDraft {
  electric: string
  water: string
}

// Module-level store — temporary data passed from MeterUploadScreen to MeterFormScreen
export const aiMeterStore = {
  drafts: {} as Record<string, AiMeterDraft>,

  /** Populate drafts from Gemini results, keyed by roomNumber */
  set(results: GeminiMeterResult[]) {
    const map: Record<string, AiMeterDraft> = {}
    for (const r of results) {
      if (!r.roomNumber || r.meterValue == null) continue
      const rn = r.roomNumber
      if (!map[rn]) map[rn] = { electric: '', water: '' }
      if (r.type === 'electric') map[rn].electric = String(r.meterValue)
      else map[rn].water = String(r.meterValue)
    }
    this.drafts = map
  },

  /** Get draft for a room (matches roomNumber, case-insensitive, trimmed) */
  getForRoom(roomNumber: string): AiMeterDraft | null {
    const key = roomNumber.trim()
    return this.drafts[key] ?? null
  },

  clear() {
    this.drafts = {}
  },
}
