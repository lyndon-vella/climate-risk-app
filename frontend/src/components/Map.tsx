import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Location } from '../App'

// You'll need to replace this with your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN'

interface MapProps {
  location: Location | null
  onHoverElevation: (elevation: number | null) => void
}

export default function Map({ location, onHoverElevation }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const radiusCircle = useRef<mapboxgl.Marker | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12', // Topographic style
      center: [0, 20],
      zoom: 2,
      terrain: { source: 'mapbox-dem', exaggeration: 1.5 }
    })

    map.current.on('load', () => {
      if (!map.current) return

      // Add terrain source for 3D elevation
      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      })

      // Add sky layer for better 3D effect
      map.current.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
        }
      })

      setIsMapLoaded(true)
    })

    // Handle mouse move for elevation display
    map.current.on('mousemove', async (e) => {
      if (!map.current) return

      const { lng, lat } = e.lngLat

      // Query elevation from terrain
      const elevation = map.current.queryTerrainElevation([lng, lat])
      onHoverElevation(elevation)
    })

    map.current.on('mouseout', () => {
      onHoverElevation(null)
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl())

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onHoverElevation])

  // Update marker and fly to location when location changes
  useEffect(() => {
    if (!map.current || !location || !isMapLoaded) return

    // Remove existing marker
    if (marker.current) {
      marker.current.remove()
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({ color: '#3182ce' })
      .setLngLat([location.lng, location.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <strong>${location.address}</strong>
      `))
      .addTo(map.current)

    // Fly to location
    map.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 13,
      pitch: 45,
      bearing: 0,
      duration: 2000
    })

    // Add 50km radius circle
    updateRadiusCircle(location)
  }, [location, isMapLoaded])

  const updateRadiusCircle = (loc: Location) => {
    if (!map.current) return

    const sourceId = 'radius-circle'
    const layerId = 'radius-circle-layer'
    const fillLayerId = 'radius-circle-fill'

    // Create a circle with 50km radius
    const radiusKm = 50
    const points = 64
    const coords = []

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI
      const dx = radiusKm * Math.cos(angle)
      const dy = radiusKm * Math.sin(angle)

      // Convert km to degrees (approximate)
      const lat = loc.lat + (dy / 111)
      const lng = loc.lng + (dx / (111 * Math.cos(loc.lat * Math.PI / 180)))

      coords.push([lng, lat])
    }
    coords.push(coords[0]) // Close the circle

    const circleGeoJson: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [coords]
      }
    }

    // Remove existing layers and source
    if (map.current.getLayer(layerId)) {
      map.current.removeLayer(layerId)
    }
    if (map.current.getLayer(fillLayerId)) {
      map.current.removeLayer(fillLayerId)
    }
    if (map.current.getSource(sourceId)) {
      map.current.removeSource(sourceId)
    }

    // Add new source and layers
    map.current.addSource(sourceId, {
      type: 'geojson',
      data: circleGeoJson
    })

    map.current.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': 'rgba(49, 130, 206, 0.05)',
        'fill-outline-color': '#3182ce'
      }
    })

    map.current.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#3182ce',
        'line-width': 2,
        'line-dasharray': [2, 2]
      }
    })
  }

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
  )
}
