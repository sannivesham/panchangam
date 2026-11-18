"""
Locations API Router
Provides location search, retrieval, and defaults for Hyderabad, AP, Telangana, and global cities.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import List, Optional
from ..locations.database import search_locations, get_location_by_id, get_default_location

router = APIRouter(prefix="/api/locations", tags=["Locations"])


@router.get("/search")
def search_city_locations(
    q: Optional[str] = Query(default="", description="Search by English or Telugu city or state name"),
    limit: int = Query(default=15, ge=1, le=100),
):
    """Search for locations across AP, Telangana, India, and worldwide."""
    results = search_locations(q or "", limit=limit)
    return {"count": len(results), "locations": results}


@router.get("/default")
def get_default_city():
    """Returns default location (Hyderabad, Telangana)."""
    return get_default_location()


@router.get("/{city_id}")
def get_single_city(city_id: str):
    """Retrieve details for a specific city ID."""
    city = get_location_by_id(city_id)
    if not city:
        raise HTTPException(status_code=404, detail=f"Location '{city_id}' not found")
    return city
