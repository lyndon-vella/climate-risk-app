import { useState, useCallback } from 'react'
import Map from './components/Map'
import AddressSearch from './components/AddressSearch'
import SeaLevelSelector from './components/SeaLevelSelector'
import ElevationDisplay from './components/ElevationDisplay'
import RiskAssessment from './components/RiskAssessment'

export interface Location {
  lng: number
  lat: number
  address: string
  country?: string
  state?: string
  city?: string
}

function App() {
  const [location, setLocation] = useState<Location | null>(null)
  const [seaLevelRise, setSeaLevelRise] = useState<number>(1)
  const [propertyElevation, setPropertyElevation] = useState<number | null>(null)
  const [hoverElevation, setHoverElevation] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLocationSelect = useCallback(async (loc: Location) => {
    setLocation(loc)
    setIsLoading(true)

    try {
      // Call NZ DEM 8m API (LINZ data via Open Topo Data)
      const response = await fetch(
        `https://api.opentopodata.org/v1/nzdem8m?locations=${loc.lat},${loc.lng}`
      )

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const elevation = data.results[0].elevation
        // Handle null elevation (point in sea or outside coverage)
        if (elevation !== null && elevation !== undefined) {
          setPropertyElevation(elevation)
        } else {
          console.warn('Elevation is null - location may be in sea or outside NZ DEM coverage')
          setPropertyElevation(null)
        }
      } else {
        console.error('API returned error:', data)
        setPropertyElevation(null)
      }
    } catch (error) {
      console.error('Failed to fetch elevation:', error)
      setPropertyElevation(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleHoverElevation = useCallback((elevation: number | null) => {
    setHoverElevation(elevation)
  }, [])

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1>NZ Climate Risk Assessment</h1>

        <AddressSearch onLocationSelect={handleLocationSelect} />

        <SeaLevelSelector
          value={seaLevelRise}
          onChange={setSeaLevelRise}
        />

        {location && (
          <ElevationDisplay
            elevation={propertyElevation}
            isLoading={isLoading}
            address={location.address}
          />
        )}

        {location && propertyElevation !== null && (
          <RiskAssessment
            elevation={propertyElevation}
            seaLevelRise={seaLevelRise}
          />
        )}
      </aside>

      <main className="map-container">
        <Map
          location={location}
          seaLevelRise={seaLevelRise}
          onHoverElevation={handleHoverElevation}
        />
        {hoverElevation !== null && (
          <div className="hover-elevation">
            Elevation: <strong>{hoverElevation.toFixed(1)}m</strong>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
