from fastapi import APIRouter, HTTPException, Query
import httpx

router = APIRouter()


@router.get("/geocode")
async def geocode_address(
    address: str = Query(..., description="Full address to geocode"),
    country: str = Query(None, description="Country name to narrow search"),
    limit: int = Query(5, description="Maximum number of results")
):
    """
    Geocode an address to coordinates using Nominatim (OpenStreetMap).
    Free service, no API key required.
    """

    # Build query with optional country filter
    query = address
    if country:
        query = f"{address}, {country}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/search",
                params={
                    "q": query,
                    "format": "json",
                    "limit": limit,
                    "addressdetails": 1
                },
                headers={
                    "User-Agent": "ClimateRiskApp/1.0 (contact@example.com)"
                }
            )

            if response.status_code == 200:
                data = response.json()

                if not data:
                    return {
                        "results": [],
                        "message": "No results found for this address"
                    }

                results = []
                for item in data:
                    results.append({
                        "lat": float(item["lat"]),
                        "lng": float(item["lon"]),
                        "display_name": item["display_name"],
                        "type": item.get("type"),
                        "importance": item.get("importance"),
                        "address": item.get("address", {})
                    })

                return {
                    "results": results,
                    "source": "nominatim"
                }

            raise HTTPException(
                status_code=response.status_code,
                detail="Geocoding service error"
            )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=504,
            detail="Geocoding service timeout"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Geocoding error: {str(e)}"
        )


@router.get("/reverse-geocode")
async def reverse_geocode(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
):
    """
    Reverse geocode coordinates to an address.
    """

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={
                    "lat": lat,
                    "lon": lng,
                    "format": "json",
                    "addressdetails": 1
                },
                headers={
                    "User-Agent": "ClimateRiskApp/1.0 (contact@example.com)"
                }
            )

            if response.status_code == 200:
                data = response.json()

                return {
                    "lat": lat,
                    "lng": lng,
                    "display_name": data.get("display_name"),
                    "address": data.get("address", {}),
                    "source": "nominatim"
                }

            raise HTTPException(
                status_code=response.status_code,
                detail="Reverse geocoding error"
            )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Reverse geocoding error: {str(e)}"
        )
