from fastapi import APIRouter, HTTPException, Query
from app.services.risk_calculator import calculate_flood_risk
from app.routers.elevation import get_elevation

router = APIRouter()


@router.get("/risk")
async def assess_risk(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude"),
    sea_level_rise: float = Query(..., ge=0, le=10, description="Sea level rise in meters")
):
    """
    Assess flood risk for a property given sea level rise scenario.
    Returns risk level, description, and recommendations.
    """

    # Get elevation for the location
    try:
        elevation_data = await get_elevation(lat=lat, lng=lng)
        elevation = elevation_data["elevation"]
    except HTTPException:
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch elevation data for risk assessment"
        )

    # Calculate risk
    risk = calculate_flood_risk(elevation, sea_level_rise)

    return {
        "location": {
            "lat": lat,
            "lng": lng
        },
        "elevation": {
            "value": elevation,
            "unit": "meters",
            "source": elevation_data.get("source", "unknown")
        },
        "scenario": {
            "sea_level_rise": sea_level_rise,
            "unit": "meters"
        },
        "risk": risk
    }


@router.get("/risk/summary")
async def risk_summary(
    lat: float = Query(..., description="Latitude"),
    lng: float = Query(..., description="Longitude")
):
    """
    Get risk summary for all sea level rise scenarios (1-5m).
    """

    # Get elevation
    try:
        elevation_data = await get_elevation(lat=lat, lng=lng)
        elevation = elevation_data["elevation"]
    except HTTPException:
        raise HTTPException(
            status_code=503,
            detail="Unable to fetch elevation data"
        )

    # Calculate risk for each scenario
    scenarios = []
    for slr in [1, 2, 3, 4, 5]:
        risk = calculate_flood_risk(elevation, slr)
        scenarios.append({
            "sea_level_rise": slr,
            "buffer": round(elevation - slr, 2),
            "risk_level": risk["level"],
            "risk_title": risk["title"]
        })

    return {
        "location": {"lat": lat, "lng": lng},
        "elevation": elevation,
        "scenarios": scenarios
    }
