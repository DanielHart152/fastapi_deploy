"use client"

import { useEffect, useRef } from 'react'

interface LocationMention {
  id: string
  location: string
  coordinates: { lat: number; lng: number }
  mentions: number
  context: string
  timestamp: string
  speakers: string[]
  category: "office" | "remote" | "travel" | "venue" | "client"
  importance: "high" | "medium" | "low"
}

interface MapComponentProps {
  mentions: LocationMention[]
  selectedLocation: LocationMention | null
  onLocationSelect: (location: LocationMention) => void
  isFullscreen?: boolean
}

export default function MapComponent({ mentions, selectedLocation, onLocationSelect, isFullscreen = false }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (!mapRef.current) return

    let isMounted = true

    const loadLeaflet = async () => {
      if (typeof window === 'undefined') return

      // Load CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Load JS
      if (!(window as any).L) {
        return new Promise((resolve) => {
          const script = document.createElement('script')
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
          script.onload = () => {
            if (isMounted) {
              setTimeout(() => initMap(), 100) // Small delay to ensure L is fully loaded
            }
            resolve(true)
          }
          document.head.appendChild(script)
        })
      } else {
        initMap()
      }
    }

    const initMap = () => {
      if (!mapRef.current || !(window as any).L || !isMounted) return

      try {
        const L = (window as any).L

        // Initialize map
        const map = L.map(mapRef.current).setView([37.7749, -122.4194], 10)

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)

        mapInstanceRef.current = map
        updateMarkers()
      } catch (error) {
        console.error('Failed to initialize map:', error)
      }
    }

    loadLeaflet()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove()
        } catch (error) {
          console.error('Error removing map:', error)
        }
      }
    }
  }, [])

  const updateMarkers = () => {
    if (!mapInstanceRef.current || !(window as any).L || mentions.length === 0) return

    try {
      const L = (window as any).L
      const map = mapInstanceRef.current

      // Clear existing markers
      markersRef.current.forEach(marker => {
        try {
          map.removeLayer(marker)
        } catch (e) {
          console.warn('Error removing marker:', e)
        }
      })
      markersRef.current = []

      // Add new markers with smart symbols
      const newMarkers = mentions.map(mention => {
        const color = mention.importance === 'high' ? '#ef4444' : 
                     mention.importance === 'medium' ? '#f59e0b' : '#6b7280'
        
        // Create custom icon based on category
        const getSymbol = (category) => {
          switch(category) {
            case 'office': return '🏢'
            case 'remote': return '🏠'
            case 'travel': return '✈️'
            case 'venue': return '📍'
            case 'client': return '🤝'
            default: return '📍'
          }
        }

        const customIcon = L.divIcon({
          html: `
            <div style="
              background: ${color};
              border: 2px solid #ffffff;
              border-radius: 50%;
              width: 32px;
              height: 32px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${getSymbol(mention.category)}
            </div>
            <div style="
              position: absolute;
              top: -8px;
              right: -8px;
              background: #ef4444;
              color: white;
              border-radius: 50%;
              width: 18px;
              height: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 10px;
              font-weight: bold;
              border: 1px solid white;
            ">
              ${mention.mentions}
            </div>
          `,
          className: 'custom-marker',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })

        const marker = L.marker([mention.coordinates.lat, mention.coordinates.lng], {
          icon: customIcon
        })

        if (map && marker) {
          marker.addTo(map)

          // Add popup
          marker.bindPopup(`
            <div style="color: #000; padding: 8px;">
              <h4 style="margin: 0 0 8px 0; font-weight: bold;">${mention.location}</h4>
              <p style="margin: 0 0 4px 0; font-size: 12px;">${mention.context}</p>
              <div style="display: flex; gap: 8px; font-size: 11px; color: #666;">
                <span>Mentions: ${mention.mentions}</span>
                <span>Time: ${mention.timestamp}</span>
              </div>
            </div>
          `)

          // Add click handler
          marker.on('click', () => {
            onLocationSelect(mention)
          })
        }

        return marker
      }).filter(Boolean)

      markersRef.current = newMarkers

      // Fit map to show all markers
      if (newMarkers.length > 0 && L.featureGroup) {
        try {
          const group = new L.featureGroup(newMarkers)
          map.fitBounds(group.getBounds().pad(0.1))
        } catch (error) {
          console.warn('Error fitting bounds:', error)
        }
      }
    } catch (error) {
      console.error('Error updating markers:', error)
    }
  }

  useEffect(() => {
    updateMarkers()
  }, [mentions])

  // Resize map when fullscreen changes
  useEffect(() => {
    if (mapInstanceRef.current && (window as any).L) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize()
      }, 100)
    }
  }, [isFullscreen])

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg border border-white/10"
      style={{ minHeight: '400px' }}
    />
  )
}