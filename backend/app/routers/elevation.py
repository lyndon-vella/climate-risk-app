from fastapi import APIRouter, HTTPException, Query
import httpx

router = APIRouter()


@router.get("/elevation")
async def get_elevation(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
):
    """
    Get elevation for a given coordinate.
    Uses Open-Elevation API (free, no API key required).
    Falls back to Open-Meteo if Open-Elevation fails.
    """

    # Try Open-Elevation API first
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.open-elevation.com/api/v1/lookup",
                params={"locations": f"{lat},{lng}"}
            )

            if response.status_code == 200:
                data = response.json()
                if data.get("results") and len(data["results"]) > 0:
                    elevation = data["results"][0]["elevation"]
                    return {
                        "elevation": elevation,
                        "lat": lat,
                        "lng": lng,
                        "source": "open-elevation",
                        "unit": "meters"
                    }
    except Exception as e:
        print(f"Open-Elevation API error: {e}")

    # Fallback to Open-Meteo API
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://api.open-meteo.com/v1/elevation",
                params={"latitude": lat, "longitude": lng}
            )

            if response.status_code == 200:
                data = response.json()
                if "elevation" in data and len(data["elevation"]) > 0:
                    elevation = data["elevation"][0]
                    return {
                        "elevation": elevation,
                        "lat": lat,
                        "lng": lng,
                        "source": "open-meteo",
                        "unit": "meters"
                    }
    except Exception as e:
        print(f"Open-Meteo API error: {e}")

    raise HTTPException(
        status_code=503,
        detail="Unable to fetch elevation data. Please try again later."
    )


@router.get("/elevation/batch")
async def get_elevation_batch(
    coordinates: str = Query(
        ...,
        description="Comma-separated lat,lng pairs. Example: '51.5,0.1|52.5,0.2'"
    )
):
    """
    Get elevation for multiple coordinates.
    Format: lat1,lng1|lat2,lng2|...
    """

    try:
        # Parse coordinates
        pairs = coordinates.split("|")
        locations = []

        for pair in pairs:
            lat, lng = pair.split(",")
            locations.append({"latitude": float(lat), "longitude": float(lng)})

        # Use Open-Meteo for batch requests (more reliable)
        async with httpx.AsyncClient(timeout=30.0) as client:
            lats = ",".join(str(loc["latitude"]) for loc in locations)
            lngs = ",".join(str(loc["longitude"]) for loc in locations)

            response = await client.get(
                "https://api.open-meteo.com/v1/elevation",
                params={"latitude": lats, "longitude": lngs}
            )

            if response.status_code == 200:
                data = response.json()
                elevations = data.get("elevation", [])

                results = []
                for i, loc in enumerate(locations):
                    results.append({
                        "lat": loc["latitude"],
                        "lng": loc["longitude"],
                        "elevation": elevations[i] if i < len(elevations) else None
                    })

                return {
                    "results": results,
                    "source": "open-meteo",
                    "unit": "meters"
                }

    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid coordinates format or API error: {str(e)}"
        )
