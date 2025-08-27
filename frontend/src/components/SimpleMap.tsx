import { useState, useEffect } from 'react'

interface SimpleMapProps {
  center: { lat: number; lng: number }
  zoom?: number
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  selectedLocation?: { lat: number; lng: number } | null
  readonly?: boolean
}

export default function SimpleMap({ 
  center, 
  zoom = 13, 
  onLocationSelect, 
  selectedLocation,
  readonly = false 
}: SimpleMapProps) {
  const [mapCenter, setMapCenter] = useState(center)
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(selectedLocation)

  useEffect(() => {
    setMapCenter(center)
  }, [center])

  useEffect(() => {
    setMarkerPosition(selectedLocation)
  }, [selectedLocation])

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (readonly || !onLocationSelect) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Convert pixel coordinates to approximate lat/lng (simple approximation)
    const lat = mapCenter.lat + (rect.height / 2 - y) * 0.0001 * zoom
    const lng = mapCenter.lng + (x - rect.width / 2) * 0.0001 * zoom
    
    const newLocation = { lat, lng }
    setMarkerPosition(newLocation)
    onLocationSelect(newLocation)
  }

  return (
    <div className="relative w-full h-64 bg-gray-100 border border-gray-300 rounded-lg overflow-hidden">
      {/* Map tiles using OpenStreetMap */}
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapCenter.lng - 0.01},${mapCenter.lat - 0.01},${mapCenter.lng + 0.01},${mapCenter.lat + 0.01}&layer=mapnik&marker=${markerPosition?.lat || mapCenter.lat},${markerPosition?.lng || mapCenter.lng}`}
        style={{ width: '100%', height: '100%', border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      
      {/* Click overlay for coordinate selection */}
      {!readonly && (
        <div 
          className="absolute inset-0 cursor-crosshair"
          onClick={handleMapClick}
          style={{ background: 'transparent' }}
          title="Click to set location"
        />
      )}
      
      {/* Location info overlay */}
      {markerPosition && (
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs">
          📍 {markerPosition.lat.toFixed(6)}, {markerPosition.lng.toFixed(6)}
        </div>
      )}
      
      {!readonly && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
          Click to set location
        </div>
      )}
    </div>
  )
}