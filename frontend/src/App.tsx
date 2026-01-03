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
      const response = await fetch(`/api/elevation?lat=${loc.lat}&lng=${loc.lng}`)
      const data = await response.json()
      setPropertyElevation(data.elevation)
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
        <h1>Climate Risk Assessment</h1>

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
