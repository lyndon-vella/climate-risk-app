from typing import TypedDict


class RiskResult(TypedDict):
    level: str  # 'low', 'medium', 'high', 'critical'
    title: str
    score: int  # 0-100
    buffer: float
    description: str
    advice: list[str]


def calculate_flood_risk(elevation: float, sea_level_rise: float) -> RiskResult:
    """
    Calculate flood risk based on property elevation and sea level rise scenario.

    Args:
        elevation: Property elevation in meters above mean sea level
        sea_level_rise: Projected sea level rise in meters

    Returns:
        RiskResult with level, title, score, description and advice
    """

    buffer = elevation - sea_level_rise

    # Critical: Property would be below sea level
    if buffer < 0:
        return {
            "level": "critical",
            "title": "Critical Risk",
            "score": 95 + min(5, abs(buffer)),  # 95-100 based on how far below
            "buffer": round(buffer, 2),
            "description": (
                f"With {sea_level_rise}m of sea level rise, this property would be "
                f"{abs(buffer):.1f}m below the new sea level. Permanent inundation is "
                "highly likely without significant flood defenses."
            ),
            "advice": [
                "Consider relocating to higher ground if possible",
                "Consult with local authorities about flood protection infrastructure",
                "Investigate property buyout or managed retreat programs",
                "Ensure comprehensive flood insurance coverage",
                "Develop an emergency evacuation plan",
                "Monitor local climate adaptation planning efforts"
            ]
        }

    # High: Very little buffer (0-2m above projected sea level)
    if buffer < 2:
        score = 70 + int((2 - buffer) * 12.5)  # 70-95
        return {
            "level": "high",
            "title": "High Risk",
            "score": score,
            "buffer": round(buffer, 2),
            "description": (
                f"With {sea_level_rise}m of sea level rise, this property would only be "
                f"{buffer:.1f}m above sea level. High risk of flooding during storm "
                "surges and high tides."
            ),
            "advice": [
                "Install flood barriers and water-resistant building materials",
                "Raise electrical systems and HVAC above potential flood levels",
                "Obtain comprehensive flood insurance",
                "Create an emergency kit and evacuation plan",
                "Consider elevating the structure if feasible",
                "Install sump pumps and backflow valves"
            ]
        }

    # Medium: Moderate buffer (2-5m)
    if buffer < 5:
        score = 35 + int((5 - buffer) * 11.67)  # 35-70
        return {
            "level": "medium",
            "title": "Medium Risk",
            "score": score,
            "buffer": round(buffer, 2),
            "description": (
                f"With {sea_level_rise}m of sea level rise, this property would be "
                f"{buffer:.1f}m above sea level. Moderate risk during extreme weather "
                "events and storm surges."
            ),
            "advice": [
                "Consider flood insurance for storm surge protection",
                "Install basic flood-proofing measures",
                "Keep important documents in waterproof containers",
                "Know your evacuation routes",
                "Stay informed about local flood warning systems",
                "Maintain property drainage systems"
            ]
        }

    # Low: Good buffer (5m+)
    score = max(5, 35 - int((buffer - 5) * 3))  # 5-35
    return {
        "level": "low",
        "title": "Low Risk",
        "score": score,
        "buffer": round(buffer, 2),
        "description": (
            f"With {sea_level_rise}m of sea level rise, this property would remain "
            f"{buffer:.1f}m above sea level. Low direct flood risk, though indirect "
            "effects may still occur."
        ),
        "advice": [
            "Stay informed about regional climate adaptation plans",
            "Consider how sea level rise may affect local infrastructure",
            "Basic emergency preparedness is still recommended",
            "Monitor changes in local flood zone designations",
            "Be aware of potential impacts on property values in affected areas"
        ]
    }


def calculate_distance_to_coast(lat: float, lng: float) -> float | None:
    """
    Calculate approximate distance to nearest coastline.
    This is a placeholder - real implementation would use coastline data.

    Returns:
        Distance in kilometers, or None if unavailable
    """
    # TODO: Implement using coastline dataset
    return None


def get_flood_zone_classification(elevation: float, distance_to_coast: float | None) -> str:
    """
    Get FEMA-style flood zone classification.

    Returns:
        Zone classification (A, AE, V, VE, X, etc.)
    """
    if elevation < 0:
        return "V"  # Coastal high hazard
    elif elevation < 2:
        return "AE"  # 100-year flood zone with elevation
    elif elevation < 5:
        return "A"  # 100-year flood zone
    elif elevation < 10:
        return "X-SHADED"  # 500-year flood zone
    else:
        return "X"  # Minimal flood hazard
