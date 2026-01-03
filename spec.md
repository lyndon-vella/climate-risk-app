# Climate Risk Assessment App - Specification

## Overview

A web application that allows users to assess property flood risk from sea level rise. Users enter a property address and select a sea level rise scenario (1-5 meters) to visualize flood impact and receive risk assessment with actionable advice.

---

## Requirements

### Functional Requirements

#### FR1: Address Input
- Users can enter: country, state/province, city/town, and property address
- System geocodes the address to coordinates
- Invalid addresses display clear error messages
- Address autocomplete (future enhancement)

#### FR2: Map Display
- Display topographic/terrain map centered on the property
- Flag/pin the property location on the map
- Show 50km radius circle around the property
- Support pan, zoom, and 3D tilt controls

#### FR3: Elevation Data
- Display property elevation in meters above sea level
- Show elevation on hover for any point on the map
- Elevation accuracy: within 30m resolution (global DEM data)

#### FR4: Sea Level Rise Selection
- Provide 5 discrete options: 1m, 2m, 3m, 4m, 5m
- Display climate scenario context for each level
- Default selection: 1m

#### FR5: Flood Visualization
- Display transparent flood overlay on the map
- Color-coded by severity (green → yellow → orange → red → dark red)
- Overlay updates dynamically when sea level selection changes
- Coverage: 50km radius around property

#### FR6: Risk Assessment
- Calculate risk level: Low, Medium, High, Critical
- Display risk score (0-100)
- Show elevation buffer (property elevation minus sea level rise)
- Provide detailed risk description

#### FR7: Recommendations
- Display actionable advice based on risk level
- 5-6 specific recommendations per risk level
- Cover: insurance, structural, planning, and emergency preparedness

### Non-Functional Requirements

| Requirement | Target |
|-------------|--------|
| Page load time | < 3 seconds |
| Map interaction | < 100ms response |
| Elevation query | < 2 seconds |
| Mobile responsive | Yes (≥320px width) |
| Browser support | Chrome, Firefox, Safari, Edge (latest 2 versions) |
| Accessibility | WCAG 2.1 AA |
| Uptime | 99% (dependent on third-party APIs) |

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

### Backend

| Technology | Purpose | Version |
|------------|---------|---------|
| Python | Runtime | 3.11+ |
| FastAPI | API framework | 0.109+ |
| uvicorn | ASGI server | 0.27+ |
| httpx | HTTP client | 0.26+ |

### External APIs

| Service | Purpose | Cost |
|---------|---------|------|
| Mapbox | Maps, terrain, geocoding | Free tier: 50k loads/month |
| Nominatim (OSM) | Address geocoding | Free, unlimited |
| Open-Elevation | Elevation queries | Free, unlimited |
| Open-Meteo | Elevation fallback | Free, unlimited |

### Data Sources

| Source | Resolution | Coverage | License |
|--------|------------|----------|---------|
| Copernicus DEM | 30m | Global | Free (non-commercial) |
| SRTM | 30m | 60°N to 56°S | Public domain |
| Mapbox Terrain | 30m | Global | Mapbox terms |

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

### Sea Level Rise Colors

| Level | Color | Hex |
|-------|-------|-----|
| 1m | Green | #48bb78 |
| 2m | Yellow | #ecc94b |
| 3m | Orange | #ed8936 |
| 4m | Red | #e53e3e |
| 5m | Dark red | #742a2a |

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

### Component Patterns

**Buttons**
- Primary: Blue background (#3182ce), white text, 14px padding
- Hover: Darker blue (#2c5282)
- Disabled: Gray (#a0aec0)

**Inputs**
- Border: 1px solid #e2e8f0
- Focus: Blue border (#3182ce) with subtle shadow
- Padding: 12px

**Cards**
- Background: white
- Border: 1px solid #e2e8f0
- Border radius: 12px
- Padding: 20px

---

## Milestones

### Phase 1: Foundation (MVP)
**Goal:** Basic working app with core functionality

| Task | Status |
|------|--------|
| Project structure setup | ✅ Complete |
| React + Vite frontend scaffold | ✅ Complete |
| FastAPI backend scaffold | ✅ Complete |
| Mapbox integration with terrain layer | ✅ Complete |
| Address search with Nominatim | ✅ Complete |
| Basic elevation display | ✅ Complete |

**Deliverable:** Users can search an address and see it on a terrain map

---

### Phase 2: Core Features
**Goal:** Full risk assessment functionality

| Task | Status |
|------|--------|
| Sea level rise selector (1-5m) | ✅ Complete |
| Property elevation API | ✅ Complete |
| Hover elevation display | ✅ Complete |
| Risk calculation algorithm | ✅ Complete |
| Risk display component | ✅ Complete |
| Recommendations engine | ✅ Complete |

**Deliverable:** Users receive complete risk assessment with advice

---

### Phase 3: Visualization
**Goal:** Enhanced map visualization

| Task | Status |
|------|--------|
| 50km radius circle | ✅ Complete |
| Flood overlay (simplified) | ✅ Complete |
| Color-coded severity | ✅ Complete |
| 3D terrain with pitch/tilt | ✅ Complete |

**Deliverable:** Visual flood impact representation on map

---

### Phase 4: Polish
**Goal:** Production-ready quality

| Task | Status |
|------|--------|
| Loading states | ✅ Complete |
| Error handling | ✅ Complete |
| Mobile responsive layout | ✅ Complete |
| Input validation | ✅ Complete |
| Environment configuration | ✅ Complete |

**Deliverable:** Robust, user-friendly application

---

### Phase 5: Future Enhancements
**Goal:** Advanced features for v2

| Task | Priority | Status |
|------|----------|--------|
| Address autocomplete | High | Planned |
| Accurate DEM-based flood modeling | High | Planned |
| Save/share property reports | Medium | Planned |
| Multiple property comparison | Medium | Planned |
| PDF export of risk report | Medium | Planned |
| User accounts | Low | Planned |
| Historical flood data overlay | Low | Planned |
| Storm surge modeling | Low | Planned |
| Real-time tide integration | Low | Planned |

---

## API Endpoints

### Elevation

```
GET /api/elevation?lat={lat}&lng={lng}

Response:
{
  "elevation": 12.5,
  "lat": 51.5074,
  "lng": -0.1278,
  "source": "open-elevation",
  "unit": "meters"
}
```

### Geocode

```
GET /api/geocode?address={address}&country={country}

Response:
{
  "results": [
    {
      "lat": 51.5074,
      "lng": -0.1278,
      "display_name": "London, UK",
      "type": "city"
    }
  ]
}
```

### Risk Assessment

```
GET /api/risk?lat={lat}&lng={lng}&sea_level_rise={meters}

Response:
{
  "location": { "lat": 51.5074, "lng": -0.1278 },
  "elevation": { "value": 12.5, "unit": "meters" },
  "scenario": { "sea_level_rise": 2, "unit": "meters" },
  "risk": {
    "level": "medium",
    "title": "Medium Risk",
    "score": 45,
    "buffer": 10.5,
    "description": "...",
    "advice": ["...", "..."]
  }
}
```

---

## File Structure

```
climate-risk-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Map.tsx
│   │   │   ├── AddressSearch.tsx
│   │   │   ├── SeaLevelSelector.tsx
│   │   │   ├── ElevationDisplay.tsx
│   │   │   └── RiskAssessment.tsx
│   │   ├── hooks/
│   │   │   ├── useElevation.ts
│   │   │   └── useGeocode.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env.example
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routers/
│   │   │   ├── elevation.py
│   │   │   ├── geocode.py
│   │   │   └── risk.py
│   │   └── services/
│   │       └── risk_calculator.py
│   ├── requirements.txt
│   └── .env.example
└── spec.md
```
