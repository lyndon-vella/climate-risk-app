import { useState } from 'react'
import type { Location } from '../App'

interface AddressSearchProps {
  onLocationSelect: (location: Location) => void
}

const NZ_REGIONS = [
  'Northland',
  'Auckland',
  'Waikato',
  'Bay of Plenty',
  'Gisborne',
  'Hawke\'s Bay',
  'Taranaki',
  'Manawatū-Whanganui',
  'Wellington',
  'Tasman',
  'Nelson',
  'Marlborough',
  'West Coast',
  'Canterbury',
  'Otago',
  'Southland'
]

export default function AddressSearch({ onLocationSelect }: AddressSearchProps) {
  const [region, setRegion] = useState('')
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

    // Build full address string with New Zealand
    const fullAddress = [address, city, region, 'New Zealand']
      .filter(Boolean)
      .join(', ')

    try {
      // Use Nominatim (OpenStreetMap) for geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?` +
        `format=json&q=${encodeURIComponent(fullAddress)}&countrycodes=nz&limit=1`,
        {
          headers: {
            'User-Agent': 'NZClimateRiskApp/1.0'
          }
        }
      )

      const data = await response.json()

      if (data.length === 0) {
        setError('Address not found in New Zealand. Please try a different address.')
        return
      }

      const result = data[0]

      // Validate the result is in New Zealand bounds
      const lat = parseFloat(result.lat)
      const lng = parseFloat(result.lon)

      if (lat < -47.5 || lat > -34 || lng < 166 || lng > 179) {
        setError('Address must be within New Zealand.')
        return
      }

      onLocationSelect({
        lat,
        lng,
        address: result.display_name,
        country: 'New Zealand',
        state: region,
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
        <label>Region</label>
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">Select region...</option>
          {NZ_REGIONS.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>City / Town</label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g., Auckland, Wellington, Christchurch"
          onKeyPress={handleKeyPress}
        />
      </div>

      <div className="form-group">
        <label>Property Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="e.g., 123 Queen Street"
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
