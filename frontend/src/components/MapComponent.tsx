import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/images/marker-icon-2x.png',
  iconUrl: '/images/marker-icon.png',
  shadowUrl: '/images/marker-shadow.png',
})

interface MapComponentProps {
  center: { lat: number; lng: number }
  zoom?: number
  onLocationSelect?: (location: { lat: number; lng: number }) => void
  selectedLocation?: { lat: number; lng: number } | null
  readonly?: boolean
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect, readonly }: { onLocationSelect?: (location: { lat: number; lng: number }) => void, readonly?: boolean }) {
  useMapEvents({
    click(e) {
      if (!readonly && onLocationSelect) {
        onLocationSelect({
          lat: e.latlng.lat,
          lng: e.latlng.lng
        })
      }
    },
  })
  
  return null
}

export default function MapComponent({ 
  center, 
  zoom = 13, 
  onLocationSelect, 
  selectedLocation,
  readonly = false 
}: MapComponentProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
        Loading map...
      </div>
    )
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      style={{ height: '256px', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {!readonly && (
        <MapClickHandler onLocationSelect={onLocationSelect} readonly={readonly} />
      )}
      
      {selectedLocation && (
        <Marker 
          position={[selectedLocation.lat, selectedLocation.lng]}
        />
      )}
    </MapContainer>
  )
}