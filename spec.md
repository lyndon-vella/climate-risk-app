# NZ Climate Risk Assessment App - Specification

## Overview

A web application for **New Zealand** that allows users to assess property flood risk from sea level rise. Users enter a New Zealand property address and select a sea level rise scenario (1m to 70m) to visualize flood impact and receive risk assessment with actionable advice.

**Live Demo:** https://lyndon-vella.github.io/climate-risk-app/

**Coverage:** New Zealand only (using LINZ 8m DEM data)

---

## Requirements

### Functional Requirements

#### FR1: Address Input
- Users select from 16 New Zealand regions via dropdown
- Enter city/town and property address
- System geocodes using Nominatim with NZ country filter
- Validates coordinates are within New Zealand bounds

#### FR2: Map Display
- Display topographic/terrain map centered on New Zealand (Wellington)
- Flag/pin the property location on the map
- Show 50km radius circle around the property
- Support pan, zoom, and 3D tilt controls
- 3D terrain visualization with elevation exaggeration

#### FR3: Elevation Data
- Display property elevation in meters above sea level
- Show elevation on hover for any point on the map
- **Elevation accuracy: 8m resolution** (LINZ NZ DEM via Open Topo Data)

#### FR4: Sea Level Rise Selection
- 10 discrete options: 1m, 2m, 3m, 4m, 5m, 8m, 15m, 25m, 40m, 70m
- Display climate scenario context for each level
- Default selection: 1m

| Level | Scenario Description |
|-------|---------------------|
| 1m | Projected by 2100 under moderate emissions (RCP 4.5) |
| 2m | Projected by 2100 under high emissions (RCP 8.5) |
| 3m | Possible with accelerated ice sheet collapse |
| 4m | Extreme scenario - major ice sheet instability |
| 5m | Catastrophic scenario - complete Greenland ice sheet melt |
| 8m | Worst case - Greenland + West Antarctic ice sheet collapse |
| 15m | Complete West Antarctic + partial East Antarctic melt |
| 25m | Major Antarctic ice sheet collapse |
| 40m | Near-complete Antarctic melt (multi-century timescale) |
| 70m | Total ice sheet melt - all ice on Earth (theoretical maximum) |

#### FR5: Flood Visualization
- Sample ~300 elevation points in a 20x20 grid within 50km radius
- Fetch real elevation data from LINZ NZ DEM (8m resolution)
- Display flooded areas (elevation ≤ sea level rise) as blue circles with heatmap
- Display safe areas (elevation > sea level rise) as green circles
- Show legend with count of flooded vs safe points
- Updates dynamically when sea level selection changes

#### FR6: Risk Assessment
- Calculate risk level: Low, Medium, High, Critical
- Display risk score (0-100)
- Show elevation buffer (property elevation minus sea level rise)
- Provide detailed risk description

| Risk Level | Condition |
|------------|-----------|
| Critical | Property below projected sea level |
| High | 0-2m buffer above sea level |
| Medium | 2-5m buffer above sea level |
| Low | 5m+ buffer above sea level |

#### FR7: Recommendations
- Display actionable advice based on risk level
- 5-6 specific recommendations per risk level
- Cover: insurance, structural, planning, and emergency preparedness

### Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load time | < 3 seconds |
| Map interaction | < 100ms response |
| Elevation query | < 5 seconds (batch of ~300 points) |
| Mobile responsive | Yes (≥320px width) |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Hosting | GitHub Pages (static site) |
| Coverage | New Zealand only |

---

## Tech Stack

### Frontend

| Technology | Purpose | Version |
|------------|---------|---------|
| React | UI framework | 18.x |
| TypeScript | Type safety | 5.x |
| Vite | Build tool | 5.x |
| Mapbox GL JS | Map rendering | 3.x |
| CSS (vanilla) | Styling | - |

### External APIs (No Backend Required)

| Service | Purpose | Cost |
|---------|---------|------|
| Mapbox | Maps, terrain, 3D visualization | Free tier: 50k loads/month |
| Nominatim (OSM) | Address geocoding | Free, unlimited |
| Open Topo Data | NZ DEM elevation queries (8m) | Free, unlimited |

### Data Sources

| Source | Resolution | Coverage | License |
|--------|------------|----------|---------|
| **LINZ NZ DEM** | **8m** | New Zealand | CC-BY-4.0 |
| Mapbox Terrain DEM | 30m | Global | Mapbox terms |

---

## New Zealand Regions

The app supports all 16 New Zealand regions:

| North Island | South Island |
|--------------|--------------|
| Northland | Tasman |
| Auckland | Nelson |
| Waikato | Marlborough |
| Bay of Plenty | West Coast |
| Gisborne | Canterbury |
| Hawke's Bay | Otago |
| Taranaki | Southland |
| Manawatū-Whanganui | |
| Wellington | |

---

## Design Guidelines

### Color Palette

```
Primary Blue:    #3182ce (buttons, links, highlights)
Dark Blue:       #1a365d (headings)
Text Dark:       #2d3748 (body text)
Text Muted:      #718096 (secondary text)
Background:      #f5f5f5 (page background)
Surface:         #ffffff (cards, sidebar)
Border:          #e2e8f0 (dividers, inputs)
```

### Risk Level Colors

| Level | Background | Text | Hex |
|-------|------------|------|-----|
| Low | Light green | Dark green | #c6f6d5 / #22543d |
| Medium | Light yellow | Dark yellow | #fefcbf / #744210 |
| High | Light red | Dark red | #fed7d7 / #822727 |
| Critical | Dark red | White | #742a2a / #ffffff |

### Sea Level Rise Button Colors

| Level | Color | Hex |
|-------|-------|-----|
| 1m | Green | #48bb78 |
| 2m | Yellow | #ecc94b |
| 3m | Orange | #ed8936 |
| 4m | Red | #e53e3e |
| 5m | Dark red | #742a2a |
| 8m | Near black | #1a202c |
| 15m | Dark purple | #2d1b4e |
| 25m | Dark gray | #1e1e1e |
| 40m | Near black | #0d0d0d |
| 70m | Black | #000000 |

### Flood Visualization Colors

| Type | Color | Hex |
|------|-------|-----|
| Flooded points | Blue | #0066cc |
| Flooded heatmap | Cyan gradient | rgba(0,240,255,0.8) |
| Safe points | Green | #22c55e |

### Typography

```
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
Heading 1:   1.5rem, weight 600
Body:        1rem, weight 400
Small:       0.875rem
Caption:     0.75rem
```

### Layout

- Sidebar width: 380px (fixed)
- Map: fills remaining viewport
- Border radius: 8px (inputs, cards), 12px (large cards)
- Spacing scale: 8px, 12px, 15px, 20px

---

## Deployment

### GitHub Pages

The app is deployed as a static site on GitHub Pages using GitHub Actions.

**Live URL:** https://lyndon-vella.github.io/climate-risk-app/

### CI/CD Pipeline

```yaml
Trigger: Push to main branch
Steps:
  1. Checkout code
  2. Setup Node.js 20
  3. Install dependencies (npm ci)
  4. Build (npm run build)
  5. Deploy to GitHub Pages
```

### Environment Variables

| Variable | Description | Where to Set |
|----------|-------------|--------------|
| VITE_MAPBOX_TOKEN | Mapbox API access token | GitHub Secrets |

---

## Milestones

### Phase 1: Foundation ✅
- Project structure setup
- React + Vite + TypeScript frontend
- Mapbox integration with terrain layer
- Address search with Nominatim

### Phase 2: Core Features ✅
- Sea level rise selector (1-70m, 10 options)
- Property elevation display
- Hover elevation display
- Risk calculation algorithm
- Risk display with recommendations

### Phase 3: Visualization ✅
- 50km radius circle
- Flood visualization with elevation sampling
- Blue heatmap for flooded areas
- Green markers for safe areas
- Dynamic legend with point counts

### Phase 4: Deployment ✅
- GitHub Actions workflow
- GitHub Pages hosting
- TypeScript build fixes
- Production optimization

### Phase 5: NZ Data Integration ✅
- Integrated LINZ NZ DEM 8m elevation data
- NZ-only address search with region dropdown
- Map centered on New Zealand
- Bounds validation for NZ coordinates

### Phase 6: Future Enhancements

| Task | Priority | Status |
|------|----------|--------|
| Address autocomplete | High | Planned |
| Use LINZ 1m LiDAR data | High | Planned |
| Save/share property reports | Medium | Planned |
| Multiple property comparison | Medium | Planned |
| PDF export of risk report | Medium | Planned |
| Coastal proximity analysis | Medium | Planned |
| Integration with NZ council flood maps | Medium | Planned |
| Historical flood data overlay | Low | Planned |
| Storm surge modeling | Low | Planned |

---

## File Structure

```
climate-risk-app/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.tsx              # Mapbox map with NZ DEM flood visualization
│   │   │   ├── AddressSearch.tsx    # NZ region dropdown + address input
│   │   │   ├── SeaLevelSelector.tsx # 1-70m sea level buttons
│   │   │   ├── ElevationDisplay.tsx # Property elevation display
│   │   │   └── RiskAssessment.tsx   # Risk level and advice
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   └── vite-env.d.ts
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/                    # Optional - not required for static deployment
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   └── services/
│   └── requirements.txt
├── spec.md
└── README.md
```

---

## API Usage

### Nominatim Geocoding (Frontend)
```javascript
GET https://nominatim.openstreetmap.org/search?format=json&q={address}&countrycodes=nz&limit=1
```

### Open Topo Data NZ DEM (Frontend)
```javascript
// Single point (8m resolution)
GET https://api.opentopodata.org/v1/nzdem8m?locations={lat},{lng}

// Multiple points (pipe-separated)
GET https://api.opentopodata.org/v1/nzdem8m?locations={lat1},{lng1}|{lat2},{lng2}|...

// Response format
{
  "results": [
    { "elevation": 12.5, "location": { "lat": -41.28, "lng": 174.77 } }
  ],
  "status": "OK"
}
```

### Mapbox (Frontend)
- Map tiles: `mapbox://styles/mapbox/outdoors-v12`
- Terrain DEM: `mapbox://mapbox.mapbox-terrain-dem-v1`

---

## Data Attribution

- **Elevation Data:** LINZ NZ DEM 8m, licensed under CC-BY-4.0
- **Geocoding:** OpenStreetMap via Nominatim
- **Map Tiles:** Mapbox
