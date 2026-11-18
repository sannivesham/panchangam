"""
Festivals API Router
Provides endpoints to query festivals by date, month, or entire year.
"""

from fastapi import APIRouter, Query, Path, HTTPException
from typing import Optional, List, Dict, Any
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
import calendar

from ..festivals.rules import FESTIVAL_RULES
from ..festivals.engine import evaluate_festivals_for_date
from ..astronomical_engine.panchangam_day import calculate_daily_panchangam
from ..locations.database import get_location_by_id, get_default_location

router = APIRouter(prefix="/api/festivals", tags=["Festivals"])


def resolve_location(
    city_id: Optional[str],
    lat: Optional[float],
    lon: Optional[float],
    elevation: Optional[float],
    tz_str: Optional[str],
):
    if city_id:
        c = get_location_by_id(city_id)
        if c:
            return c["latitude"], c["longitude"], c.get("elevation_m", 0.0), ZoneInfo(c.get("timezone", "Asia/Kolkata")), c["name"]

    if lat is not None and lon is not None:
        tz = ZoneInfo(tz_str) if tz_str else ZoneInfo("Asia/Kolkata")
        return lat, lon, elevation or 0.0, tz, "Custom Location"

    d = get_default_location()
    return d["latitude"], d["longitude"], d.get("elevation_m", 0.0), ZoneInfo(d.get("timezone", "Asia/Kolkata")), d["name"]


@router.get("")
def get_festivals_catalog(
    year: Optional[int] = Query(default=None, description="Gregorian year, e.g. 2026"),
    month: Optional[int] = Query(default=None, ge=1, le=12, description="Gregorian month 1-12"),
    region: str = Query(default="ALL", description="ALL, TELANGANA, or ANDHRA_PRADESH"),
    city_id: Optional[str] = Query(default=None),
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
):
    """
    Query all festivals for a specific month or year, calculated according to traditional observance rules.
    """
    latitude, longitude, elevation, tz, loc_name = resolve_location(city_id, lat, lon, None, None)

    if year is None:
        year = datetime.now(ZoneInfo("Asia/Kolkata")).year

    # If specific month requested:
    months_to_scan = [month] if month is not None else list(range(1, 13))

    results = []
    for m in months_to_scan:
        _, num_days = calendar.monthrange(year, m)
        for d in range(1, num_days + 1):
            curr_date = date(year, m, d)
            panch = calculate_daily_panchangam(curr_date, latitude, longitude, elevation, tz, loc_name)
            fests = evaluate_festivals_for_date(panch, tz, region)
            if fests:
                for f in fests:
                    results.append({
                        "date": curr_date.isoformat(),
                        "telugu_date": panch["summary"]["telugu"],
                        "telugu_month": panch["telugu_calendar"]["masam"]["name_telugu"],
                        "tithi": panch["panchangam"]["tithi"]["primary"]["name_telugu"],
                        "festival": f,
                    })

    return {
        "year": year,
        "month": month,
        "count": len(results),
        "location": loc_name,
        "festivals": results,
    }


@router.get("/{target_date}")
def get_festivals_for_single_date(
    target_date: str = Path(description="Target date in YYYY-MM-DD format"),
    city_id: Optional[str] = Query(default=None),
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
    region: str = Query(default="ALL"),
):
    """Get festivals falling on an individual date."""
    try:
        dt = date.fromisoformat(target_date)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Expected YYYY-MM-DD")

    latitude, longitude, elevation, tz, loc_name = resolve_location(city_id, lat, lon, None, None)
    panch = calculate_daily_panchangam(dt, latitude, longitude, elevation, tz, loc_name)
    fests = evaluate_festivals_for_date(panch, tz, region)

    return {
        "date": target_date,
        "location": loc_name,
        "telugu_summary": panch["summary"]["telugu"],
        "count": len(fests),
        "festivals": fests,
    }
