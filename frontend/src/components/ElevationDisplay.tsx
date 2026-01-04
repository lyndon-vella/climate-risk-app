interface ElevationDisplayProps {
  elevation: number | null
  isLoading: boolean
  address: string
}

export default function ElevationDisplay({ elevation, isLoading, address }: ElevationDisplayProps) {
  return (
    <div className="elevation-display">
      <div className="label">Property Elevation</div>
      {isLoading ? (
        <div className="loading">
          <span>Loading elevation data...</span>
        </div>
      ) : elevation !== null ? (
        <>
          <div className="value">{elevation.toFixed(1)}m</div>
          <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '5px' }}>
            above mean sea level
          </div>
        </>
      ) : (
        <div style={{ color: '#e53e3e', fontSize: '0.9rem' }}>
          Elevation data unavailable
          <div style={{ color: '#718096', fontSize: '0.8rem', marginTop: '5px' }}>
            Location may be in the sea or outside NZ DEM coverage
          </div>
        </div>
      )}
      <div style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '10px' }}>
        {address.length > 50 ? address.substring(0, 50) + '...' : address}
      </div>
    </div>
  )
}
