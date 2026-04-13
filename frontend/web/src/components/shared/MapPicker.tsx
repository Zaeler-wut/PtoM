import { useEffect, useRef, useState } from "react"
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { RiMapPinFill, RiSearchLine, RiCrosshairLine } from "react-icons/ri"

// Fix Leaflet default marker icons in Vite/webpack
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// ─── Component ที่คอย sync map center เมื่อ lat/lng เปลี่ยน ───────────────
function MapUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng])
  return null
}

// ─── คลิกบนแผนที่เพื่อย้ายหมุด ────────────────────────────────────────────
function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

// ─── Nominatim search result ───────────────────────────────────────────────
interface NominatimResult {
  display_name: string
  lat: string
  lon: string
}

interface Props {
  lat: number | null | undefined
  lng: number | null | undefined
  onChange: (lat: number, lng: number) => void
}

const DEFAULT_LAT = 13.7563  // Bangkok
const DEFAULT_LNG = 100.5018

export default function MapPicker({ lat, lng, onChange }: Props) {
  const markerRef = useRef<L.Marker>(null)
  const currentLat = lat ?? DEFAULT_LAT
  const currentLng = lng ?? DEFAULT_LNG

  const [search, setSearch] = useState("")
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [locating, setLocating] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // ปิด dropdown เมื่อคลิกนอก
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setResults([])
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleSearch = async () => {
    if (!search.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5&countrycodes=th`,
        { headers: { "Accept-Language": "th" } }
      )
      const data: NominatimResult[] = await res.json()
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const handleSelectResult = (r: NominatimResult) => {
    onChange(parseFloat(r.lat), parseFloat(r.lon))
    setSearch(r.display_name.split(",")[0])
    setResults([])
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false),
      { timeout: 8000 }
    )
  }

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex gap-2" ref={searchRef}>
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleSearch())}
            placeholder="ค้นหาสถานที่ เช่น มหาวิทยาลัย, ห้างสรรพสินค้า..."
            className="w-full px-3 py-2.5 pl-9 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
          />
          <RiSearchLine className="absolute left-3 top-3 text-gray-400" size={14} />
          {/* Dropdown results */}
          {results.length > 0 && (
            <div className="absolute z-[1000] top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {results.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectResult(r)}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-purple-50 border-b border-gray-50 last:border-none"
                >
                  <span className="font-medium text-gray-800">{r.display_name.split(",")[0]}</span>
                  <span className="block text-xs text-gray-400 mt-0.5 truncate">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="px-4 py-2.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-60 flex items-center gap-1.5"
        >
          {searching ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <RiSearchLine size={14} />
          )}
          ค้นหา
        </button>
        <button
          type="button"
          onClick={handleCurrentLocation}
          disabled={locating}
          title="ใช้ตำแหน่งปัจจุบัน"
          className="px-3 py-2.5 bg-blue-50 text-blue-600 border border-blue-200 text-sm rounded-lg hover:bg-blue-100 disabled:opacity-60 flex items-center gap-1.5"
        >
          {locating ? (
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <RiCrosshairLine size={16} />
          )}
        </button>
      </div>

      {/* Map */}
      <div className="rounded-xl overflow-hidden border border-gray-200" style={{ height: 360 }}>
        <MapContainer
          center={[currentLat, currentLng]}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            ref={markerRef}
            position={[currentLat, currentLng]}
            icon={markerIcon}
            draggable={true}
            eventHandlers={{
              dragend() {
                const pos = markerRef.current?.getLatLng()
                if (pos) onChange(pos.lat, pos.lng)
              },
            }}
          />
          <ClickHandler onChange={onChange} />
          <MapUpdater lat={currentLat} lng={currentLng} />
        </MapContainer>
      </div>

      {/* Coordinates display */}
      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
        <RiMapPinFill className="text-purple-500 flex-shrink-0" size={13} />
        {lat && lng ? (
          <span>
            ละติจูด <strong className="text-gray-700">{lat.toFixed(6)}</strong>
            {" · "}
            ลองติจูด <strong className="text-gray-700">{lng.toFixed(6)}</strong>
          </span>
        ) : (
          <span className="text-gray-400">ยังไม่ได้ปักหมุด — คลิกบนแผนที่หรือลากหมุดเพื่อตั้งตำแหน่ง</span>
        )}
      </div>
      <p className="text-xs text-gray-400">💡 คลิกบนแผนที่ หรือลากหมุด เพื่อเลือกตำแหน่งที่แน่นอน</p>
    </div>
  )
}
