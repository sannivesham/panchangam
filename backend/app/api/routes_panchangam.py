"""
Panchangam API Router
High-precision daily, monthly, yearly, transitions, sunrise/sunset, and muhurtham endpoints.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, Any, List
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
import calendar

from ..astronomical_engine.panchangam_day import calculate_daily_panchangam
from ..astronomical_engine.sun_moon_rise import calculate_sun_times, calculate_moon_times
from ..festivals.engine import evaluate_festivals_for_date
from ..locations.database import get_location_by_id, get_default_location

router = APIRouter(prefix="/api/panchangam", tags=["Panchangam"])

# In-memory LRU-style cache for daily panchangam calculations
CALCULATION_CACHE: Dict[str, Any] = {}
MAX_CACHE_SIZE = 2000


def get_cache_key(target_date: date, lat: float, lon: float, elevation: float, tz_str: str) -> str:
    return f"{target_date.isoformat()}_{lat:.4f}_{lon:.4f}_{elevation:.1f}_{tz_str}"


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


def get_or_calculate_panchangam(
    target_date: date,
    lat: float,
    lon: float,
    elevation: float,
    tz: ZoneInfo,
    loc_name: str,
) -> Dict[str, Any]:
    key = get_cache_key(target_date, lat, lon, elevation, str(tz))
    if key in CALCULATION_CACHE:
        return CALCULATION_CACHE[key]

    data = calculate_daily_panchangam(target_date, lat, lon, elevation, tz, loc_name)
    festivals = evaluate_festivals_for_date(data, tz)
    data["festivals"] = festivals

    if len(CALCULATION_CACHE) >= MAX_CACHE_SIZE:
        # Simple cache pruning
        CALCULATION_CACHE.clear()

    CALCULATION_CACHE[key] = data
    return data


@router.get("/daily")
def get_daily_panchangam(
    date_str: Optional[str] = Query(default=None, alias="date", description="YYYY-MM-DD format (defaults to today)"),
    city_id: Optional[str] = Query(default=None, description="City ID (e.g. hyderabad, visakhapatnam)"),
    lat: Optional[float] = Query(default=None, description="Custom latitude"),
    lon: Optional[float] = Query(default=None, description="Custom longitude"),
    elevation: Optional[float] = Query(default=None, description="Custom elevation in meters"),
    timezone: Optional[str] = Query(default=None, description="IANA timezone (e.g. Asia/Kolkata)"),
):
    """
    Returns complete Daily Panchangam for any date and location.
    Includes Five Angas, Muhurthams, Graha positions, Telugu calendar, and Festivals.
    """
    target_date = date.fromisoformat(date_str) if date_str else datetime.now(ZoneInfo("Asia/Kolkata")).date()
    latitude, longitude, elev, tz, loc_name = resolve_location(city_id, lat, lon, elevation, timezone)
    return get_or_calculate_panchangam(target_date, latitude, longitude, elev, tz, loc_name)


@router.get("/monthly")
def get_monthly_panchangam(
    year: int = Query(description="Gregorian year, e.g. 2026"),
    month: int = Query(ge=1, le=12, description="Gregorian month 1-12"),
    city_id: Optional[str] = Query(default=None),
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
    elevation: Optional[float] = Query(default=None),
    timezone: Optional[str] = Query(default=None),
):
    """
    Returns monthly calendar grid with daily summary, Tithi, Nakshatram, Paksha,
    Purnima/Amavasya indicators, and Festivals for every day of the month.
    """
    latitude, longitude, elev, tz, loc_name = resolve_location(city_id, lat, lon, elevation, timezone)
    _, num_days = calendar.monthrange(year, month)

    days_data = []
    for d in range(1, num_days + 1):
        target_date = date(year, month, d)
        panch = get_or_calculate_panchangam(target_date, latitude, longitude, elev, tz, loc_name)

        tithi_data = panch["panchangam"]["tithi"]["primary"]
        nak_data = panch["panchangam"]["nakshatra"]["primary"]

        days_data.append({
            "date": target_date.isoformat(),
            "day": d,
            "weekday": panch["panchangam"]["vara"]["name_telugu"],
            "weekday_english": panch["panchangam"]["vara"]["name_english"],
            "telugu_month": panch["telugu_calendar"]["masam"]["name_telugu"],
            "paksha": tithi_data["paksha_telugu"],
            "tithi": tithi_data["name_telugu"],
            "tithi_end": tithi_data["end_telugu"],
            "nakshatra": nak_data["name_telugu"],
            "nakshatra_end": nak_data["end_telugu"],
            "sunrise": panch["sun_moon"]["sunrise_telugu"],
            "sunset": panch["sun_moon"]["sunset_telugu"],
            "is_purnima": tithi_data["index"] == 15,
            "is_amavasya": tithi_data["index"] == 30,
            "is_ekadashi": tithi_data["index"] in (11, 26),
            "festivals": panch.get("festivals", []),
        })

    return {
        "year": year,
        "month": month,
        "location": loc_name,
        "total_days": num_days,
        "days": days_data,
    }


@router.get("/yearly")
def get_yearly_overview(
    year: int = Query(description="Gregorian year, e.g. 2026"),
    city_id: Optional[str] = Query(default=None),
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
):
    """
    Returns annual overview of the 12 Telugu months, Samvatsara, and major religious observances.
    """
    latitude, longitude, elev, tz, loc_name = resolve_location(city_id, lat, lon, None, None)

    # Scan 1st of each month to sample Samvatsara and seasonal transitions
    months_overview = []
    for m in range(1, 13):
        sample_date = date(year, m, 15)  # Mid-month
        panch = get_or_calculate_panchangam(sample_date, latitude, longitude, elev, tz, loc_name)
        months_overview.append({
            "gregorian_month": m,
            "gregorian_month_name": calendar.month_name[m],
            "telugu_month": panch["telugu_calendar"]["masam"],
            "samvatsaram": panch["telugu_calendar"]["samvatsaram"],
            "ayanam": panch["telugu_calendar"]["ayanam"],
            "rituvu": panch["telugu_calendar"]["rituvu"],
        })

    return {
        "year": year,
        "location": loc_name,
        "months": months_overview,
    }


@router.get("/transitions")
def get_transitions(
    date_str: Optional[str] = Query(default=None, alias="date"),
    city_id: Optional[str] = Query(default=None),
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
):
    """
    High-precision transition boundary timings for Tithi, Nakshatra, Yoga, and Karana.
    """
    target_date = date.fromisoformat(date_str) if date_str else datetime.now(ZoneInfo("Asia/Kolkata")).date()
    latitude, longitude, elev, tz, loc_name = resolve_location(city_id, lat, lon, None, None)
    panch = get_or_calculate_panchangam(target_date, latitude, longitude, elev, tz, loc_name)

    return {
        "date": target_date.isoformat(),
        "location": loc_name,
        "tithi": panch["panchangam"]["tithi"],
        "nakshatra": panch["panchangam"]["nakshatra"],
        "yoga": panch["panchangam"]["yoga"],
        "karana": panch["panchangam"]["karana"],
    }


@router.get("/sunrise-sunset")
def get_sunrise_sunset(
    date_str: Optional[str] = Query(default=None, alias="date"),
    city_id: Optional[str] = Query(default=None),
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
    elevation: Optional[float] = Query(default=None),
):
    """Returns topocentric Sunrise, Sunset, Moonrise, Moonset and diurnal lengths."""
    target_date = date.fromisoformat(date_str) if date_str else datetime.now(ZoneInfo("Asia/Kolkata")).date()
    latitude, longitude, elev, tz, loc_name = resolve_location(city_id, lat, lon, elevation, None)

    sun_times = calculate_sun_times(target_date, latitude, longitude, elev, tz)
    moon_times = calculate_moon_times(target_date, latitude, longitude, elev, tz)

    return {
        "date": target_date.isoformat(),
        "location": loc_name,
        "latitude": latitude,
        "longitude": longitude,
        "elevation_meters": elev,
        "sun": {
            "sunrise": sun_times["sunrise_str"],
            "sunset": sun_times["sunset_str"],
            "sunrise_telugu": sun_times["sunrise_telugu"],
            "sunset_telugu": sun_times["sunset_telugu"],
            "sunrise_iso": sun_times["dt_sunrise"].isoformat() if sun_times["dt_sunrise"] else None,
            "sunset_iso": sun_times["dt_sunset"].isoformat() if sun_times["dt_sunset"] else None,
            "dinamana_seconds": sun_times["dinamana_seconds"],
            "ratrimana_seconds": sun_times["ratrimana_seconds"],
        },
        "moon": {
            "moonrise": moon_times["moonrise_str"],
            "moonset": moon_times["moonset_str"],
            "moonrise_telugu": moon_times["moonrise_telugu"],
            "moonset_telugu": moon_times["moonset_telugu"],
        },
    }


@router.get("/muhurtham")
def get_muhurtham(
    date_str: Optional[str] = Query(default=None, alias="date"),
    city_id: Optional[str] = Query(default=None),
    lat: Optional[float] = Query(default=None),
    lon: Optional[float] = Query(default=None),
):
    """Returns all auspicious and inauspicious Muhurthams and daily timings."""
    target_date = date.fromisoformat(date_str) if date_str else datetime.now(ZoneInfo("Asia/Kolkata")).date()
    latitude, longitude, elev, tz, loc_name = resolve_location(city_id, lat, lon, None, None)
    panch = get_or_calculate_panchangam(target_date, latitude, longitude, elev, tz, loc_name)

    return {
        "date": target_date.isoformat(),
        "location": loc_name,
        "muhurtham": panch["muhurtham"],
    }
