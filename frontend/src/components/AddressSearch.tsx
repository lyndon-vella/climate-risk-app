import { useState } from 'react'
import type { Location } from '../App'

interface AddressSearchProps {
  onLocationSelect: (location: Location) => void
}

export default function AddressSearch({ onLocationSelect }: AddressSearchProps) {
  const [country, setCountry] = useState('')
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [address, setAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    if (!address.trim()) {
      setError('Please enter an address')
      return
    }

    setIsSearching(true)
    setError(null)

    // Build full address string
    const fullAddress = [address, city, state, country]
      .filter(Boolean)
      .join(', ')

    try {
      // Use Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(fullAddress)}&limit=1`,
        {
          headers: {
            'User-Agent': 'ClimateRiskApp/1.0'
          }
        }
      )

      const data = await response.json()

      if (data.length === 0) {
        setError('Address not found. Please try a different address.')
        return
      }

      const result = data[0]
      onLocationSelect({
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        address: result.display_name,
        country,
        state,
        city
      })
    } catch (err) {
      console.error('Geocoding error:', err)
      setError('Failed to search address. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="address-search">
      <div className="form-group">
        <label>Country</label>
        <input
          type="text"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          placeholder="e.g., Netherlands"
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="form-group">
        <label>State / Province</label>
        <input
          type="text"
          value={state}
          onChange={(e) => setState(e.target.value)}
          placeholder="e.g., South Holland"
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="form-group">
        <label>City / Town</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g., Rotterdam"
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="form-group">
        <label>Property Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., 123 Main Street"
          onKeyPress={handleKeyPress}
        />
      </div>

      {error && (
        <div style={{ color: '#e53e3e', marginBottom: '15px', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      <button
        className="search-btn"
        onClick={handleSearch}
        disabled={isSearching}
      >
        {isSearching ? 'Searching...' : 'Search Location'}
      </button>
    </div>
  )
}
