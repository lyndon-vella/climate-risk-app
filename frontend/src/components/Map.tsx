import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import type { Location } from '../App'

// You'll need to replace this with your Mapbox access token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'YOUR_MAPBOX_TOKEN'

interface MapProps {
  location: Location | null
  seaLevelRise: number
  onHoverElevation: (elevation: number | null) => void
}

interface FloodPoint {
  lng: number
  lat: number
  elevation: number
  flooded: boolean
}

export default function Map({ location, seaLevelRise, onHoverElevation }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [floodPoints, setFloodPoints] = useState<FloodPoint[]>([])
  const [isLoadingFlood, setIsLoadingFlood] = useState(false)

  // Generate grid points within radius
  const generateGridPoints = useCallback((centerLat: number, centerLng: number, radiusKm: number, gridSize: number) => {
    const points: { lat: number; lng: number }[] = []
    const step = (radiusKm * 2) / gridSize

    for (let i = 0; i <= gridSize; i++) {
      for (let j = 0; j <= gridSize; j++) {
        const dx = -radiusKm + (i * step)
        const dy = -radiusKm + (j * step)

        // Check if point is within circle
        if (Math.sqrt(dx * dx + dy * dy) <= radiusKm) {
          const lat = centerLat + (dy / 111)
          const lng = centerLng + (dx / (111 * Math.cos(centerLat * Math.PI / 180)))
          points.push({ lat, lng })
        }
      }
    }
    return points
  }, [])

  // Fetch elevations for points using NZ 8m DEM API
  const fetchElevations = useCallback(async (points: { lat: number; lng: number }[]): Promise<number[]> => {
    // Open Topo Data NZ DEM API (8m resolution)
    // Format: locations=lat,lng|lat,lng|...
    const locations = points.map(p => `${p.lat},${p.lng}`).join('|')

    try {
      const response = await fetch(
        `https://api.opentopodata.org/v1/nzdem8m?locations=${locations}`
      )
      const data = await response.json()

      if (data.status === 'OK' && data.results) {
        return data.results.map((r: { elevation: number | null }) => r.elevation ?? 0)
      }
      return []
    } catch (error) {
      console.error('Failed to fetch elevations:', error)
      return []
    }
  }, [])

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: [174.7633, -41.2865], // New Zealand (Wellington)
      zoom: 5
    })

    map.current.on('load', () => {
      if (!map.current) return

      map.current.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      })

      // Set terrain after source is added
      map.current.setTerrain({ source: 'mapbox-dem', exaggeration: 1.5 })

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

    map.current.on('mousemove', (e) => {
      if (!map.current) return
      const elevation = map.current.queryTerrainElevation([e.lngLat.lng, e.lngLat.lat])
      onHoverElevation(elevation ?? null)
    })

    map.current.on('mouseout', () => {
      onHoverElevation(null)
    })

    map.current.addControl(new mapboxgl.NavigationControl())

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [onHoverElevation])

  // Fetch flood data when location changes
  useEffect(() => {
    if (!location || !isMapLoaded) return

    const loadFloodData = async () => {
      setIsLoadingFlood(true)

      // Generate grid of points (20x20 grid within 50km radius)
      const points = generateGridPoints(location.lat, location.lng, 50, 20)

      // Fetch elevations in batches (API may have limits)
      const batchSize = 100
      const allElevations: number[] = []

      for (let i = 0; i < points.length; i += batchSize) {
        const batch = points.slice(i, i + batchSize)
        const elevations = await fetchElevations(batch)
        allElevations.push(...elevations)
      }

      // Create flood points with elevation data
      const floodData: FloodPoint[] = points.map((point, index) => ({
        lng: point.lng,
        lat: point.lat,
        elevation: allElevations[index] || 0,
        flooded: (allElevations[index] || 0) <= seaLevelRise
      }))

      setFloodPoints(floodData)
      setIsLoadingFlood(false)
    }

    loadFloodData()
  }, [location, isMapLoaded, generateGridPoints, fetchElevations])

  // Update flood visualization when sea level or flood points change
  useEffect(() => {
    if (!map.current || !isMapLoaded || floodPoints.length === 0) return

    // Update flooded status based on current sea level rise
    const updatedPoints = floodPoints.map(p => ({
      ...p,
      flooded: p.elevation <= seaLevelRise
    }))

    updateFloodVisualization(updatedPoints)
  }, [seaLevelRise, floodPoints, isMapLoaded])

  // Update marker and fly to location
  useEffect(() => {
    if (!map.current || !location || !isMapLoaded) return

    if (marker.current) {
      marker.current.remove()
    }

    marker.current = new mapboxgl.Marker({ color: '#3182ce' })
      .setLngLat([location.lng, location.lat])
      .setPopup(new mapboxgl.Popup().setHTML(`<strong>${location.address}</strong>`))
      .addTo(map.current)

    map.current.flyTo({
      center: [location.lng, location.lat],
      zoom: 10,
      pitch: 45,
      bearing: 0,
      duration: 2000
    })

    updateRadiusCircle(location)
  }, [location, isMapLoaded])

  const updateFloodVisualization = (points: FloodPoint[]) => {
    if (!map.current) return

    const floodedSourceId = 'flooded-points'
    const safeSourceId = 'safe-points'
    const floodedLayerId = 'flooded-layer'
    const safeLayerId = 'safe-layer'
    const floodedHeatmapId = 'flooded-heatmap'

    // Remove existing layers
    ;[floodedLayerId, safeLayerId, floodedHeatmapId].forEach(id => {
      if (map.current!.getLayer(id)) map.current!.removeLayer(id)
    })
    ;[floodedSourceId, safeSourceId].forEach(id => {
      if (map.current!.getSource(id)) map.current!.removeSource(id)
    })

    const floodedFeatures = points
      .filter(p => p.flooded)
      .map(p => ({
        type: 'Feature' as const,
        properties: { elevation: p.elevation },
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] }
      }))

    const safeFeatures = points
      .filter(p => !p.flooded)
      .map(p => ({
        type: 'Feature' as const,
        properties: { elevation: p.elevation },
        geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] }
      }))

    // Add flooded points source and layer
    map.current.addSource(floodedSourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: floodedFeatures }
    })

    // Add heatmap for flooded areas
    map.current.addLayer({
      id: floodedHeatmapId,
      type: 'heatmap',
      source: floodedSourceId,
      paint: {
        'heatmap-weight': 1,
        'heatmap-intensity': 0.8,
        'heatmap-radius': 30,
        'heatmap-opacity': 0.6,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(0,0,255,0)',
          0.2, 'rgba(0,100,255,0.4)',
          0.4, 'rgba(0,150,255,0.5)',
          0.6, 'rgba(0,200,255,0.6)',
          0.8, 'rgba(0,220,255,0.7)',
          1, 'rgba(0,240,255,0.8)'
        ]
      }
    })

    // Add flooded points as circles
    map.current.addLayer({
      id: floodedLayerId,
      type: 'circle',
      source: floodedSourceId,
      paint: {
        'circle-radius': 6,
        'circle-color': '#0066cc',
        'circle-opacity': 0.7,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#003366'
      }
    })

    // Add safe points source and layer
    map.current.addSource(safeSourceId, {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: safeFeatures }
    })

    map.current.addLayer({
      id: safeLayerId,
      type: 'circle',
      source: safeSourceId,
      paint: {
        'circle-radius': 4,
        'circle-color': '#22c55e',
        'circle-opacity': 0.5,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#166534'
      }
    })
  }

  const updateRadiusCircle = (loc: Location) => {
    if (!map.current) return

    const sourceId = 'radius-circle'
    const layerId = 'radius-circle-layer'
    const fillLayerId = 'radius-circle-fill'

    const radiusKm = 50
    const points = 64
    const coords = []

    for (let i = 0; i < points; i++) {
      const angle = (i / points) * 2 * Math.PI
      const dx = radiusKm * Math.cos(angle)
      const dy = radiusKm * Math.sin(angle)
      const lat = loc.lat + (dy / 111)
      const lng = loc.lng + (dx / (111 * Math.cos(loc.lat * Math.PI / 180)))
      coords.push([lng, lat])
    }
    coords.push(coords[0])

    const circleGeoJson: GeoJSON.Feature = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [coords] }
    }

    if (map.current.getLayer(layerId)) map.current.removeLayer(layerId)
    if (map.current.getLayer(fillLayerId)) map.current.removeLayer(fillLayerId)
    if (map.current.getSource(sourceId)) map.current.removeSource(sourceId)

    map.current.addSource(sourceId, { type: 'geojson', data: circleGeoJson })

    map.current.addLayer({
      id: fillLayerId,
      type: 'fill',
      source: sourceId,
      paint: {
        'fill-color': 'rgba(49, 130, 206, 0.03)',
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
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {isLoadingFlood && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '50px',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '0.85rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          Loading flood data...
        </div>
      )}
      {!isLoadingFlood && floodPoints.length > 0 && (
        <div style={{
          position: 'absolute',
          bottom: '30px',
          right: '10px',
          background: 'rgba(255,255,255,0.95)',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '0.8rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: '6px' }}>Flood Risk Legend</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#0066cc', border: '1px solid #003366' }}></span>
            <span>Flooded ({floodPoints.filter(p => p.elevation <= seaLevelRise).length} points)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', border: '1px solid #166534' }}></span>
            <span>Safe ({floodPoints.filter(p => p.elevation > seaLevelRise).length} points)</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: '#718096', borderTop: '1px solid #e2e8f0', paddingTop: '6px' }}>
            Data: LINZ NZ DEM 8m
          </div>
        </div>
      )}
    </div>
  )
}
