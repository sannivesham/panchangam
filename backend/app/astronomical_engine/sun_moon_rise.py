"""
Sun and Moon Rise and Set Calculations
Calculates topocentric, refraction-corrected rise and set timings for any geographical location.
"""

from typing import Tuple, Optional, Dict, Any
from datetime import datetime, date
from zoneinfo import ZoneInfo
from .swe_wrapper import (
    SwissEphemeris,
    SE_SUN,
    SE_MOON,
    SE_CALC_RISE,
    SE_CALC_SET,
    SE_BIT_DISC_CENTER,
    SE_BIT_HINDU_RISING,
)
from .julian import datetime_to_jd, jd_to_datetime, format_telugu_time


def calculate_sun_times(
    calendar_date: date,
    latitude: float,
    longitude: float,
    elevation_m: float = 0.0,
    tz: ZoneInfo = ZoneInfo("Asia/Kolkata"),
) -> Dict[str, Any]:
    """
    Calculate Sunrise and Sunset for a given calendar date at the specified coordinates.
    Search begins from 00:00 local time (converted to UT).
    """
    swe = SwissEphemeris.get_instance()
    geopos = (longitude, latitude, elevation_m)

    # 00:00 local time
    dt_local_midnight = datetime(calendar_date.year, calendar_date.month, calendar_date.day, 0, 0, 0, tzinfo=tz)
    jd_start = datetime_to_jd(dt_local_midnight)

    # Sunrise (Drik standard: upper limb touch with refraction)
    jd_sunrise = swe.rise_trans(jd_start, SE_SUN, SE_CALC_RISE, geopos)
    # Sunset
    jd_sunset = swe.rise_trans(jd_start, SE_SUN, SE_CALC_SET, geopos)

    # Next Sunrise (for traditional Panchangam day end)
    jd_next_start = jd_sunrise + 0.5 if jd_sunrise is not None else jd_start + 1.0
    jd_next_sunrise = swe.rise_trans(jd_next_start, SE_SUN, SE_CALC_RISE, geopos)

    dt_sunrise = jd_to_datetime(jd_sunrise, tz) if jd_sunrise else None
    dt_sunset = jd_to_datetime(jd_sunset, tz) if jd_sunset else None
    dt_next_sunrise = jd_to_datetime(jd_next_sunrise, tz) if jd_next_sunrise else None

    # Calculate Dinamana and Ratrimana in seconds
    dinamana_sec = (dt_sunset - dt_sunrise).total_seconds() if (dt_sunrise and dt_sunset) else 43200.0
    ratrimana_sec = (dt_next_sunrise - dt_sunset).total_seconds() if (dt_sunset and dt_next_sunrise) else 43200.0

    return {
        "jd_sunrise": jd_sunrise,
        "jd_sunset": jd_sunset,
        "jd_next_sunrise": jd_next_sunrise,
        "dt_sunrise": dt_sunrise,
        "dt_sunset": dt_sunset,
        "dt_next_sunrise": dt_next_sunrise,
        "sunrise_str": dt_sunrise.strftime("%I:%M:%S %p") if dt_sunrise else "--",
        "sunset_str": dt_sunset.strftime("%I:%M:%S %p") if dt_sunset else "--",
        "sunrise_telugu": format_telugu_time(dt_sunrise, "te") if dt_sunrise else "--",
        "sunset_telugu": format_telugu_time(dt_sunset, "te") if dt_sunset else "--",
        "dinamana_seconds": dinamana_sec,
        "ratrimana_seconds": ratrimana_sec,
    }


def calculate_moon_times(
    calendar_date: date,
    latitude: float,
    longitude: float,
    elevation_m: float = 0.0,
    tz: ZoneInfo = ZoneInfo("Asia/Kolkata"),
) -> Dict[str, Any]:
    """Calculate Moonrise and Moonset for a given calendar date."""
    swe = SwissEphemeris.get_instance()
    geopos = (longitude, latitude, elevation_m)

    dt_local_midnight = datetime(calendar_date.year, calendar_date.month, calendar_date.day, 0, 0, 0, tzinfo=tz)
    jd_start = datetime_to_jd(dt_local_midnight)

    jd_moonrise = swe.rise_trans(jd_start, SE_MOON, SE_CALC_RISE, geopos)
    jd_moonset = swe.rise_trans(jd_start, SE_MOON, SE_CALC_SET, geopos)

    dt_moonrise = jd_to_datetime(jd_moonrise, tz) if jd_moonrise else None
    dt_moonset = jd_to_datetime(jd_moonset, tz) if jd_moonset else None

    return {
        "jd_moonrise": jd_moonrise,
        "jd_moonset": jd_moonset,
        "dt_moonrise": dt_moonrise,
        "dt_moonset": dt_moonset,
        "moonrise_str": dt_moonrise.strftime("%I:%M:%S %p") if dt_moonrise else "--",
        "moonset_str": dt_moonset.strftime("%I:%M:%S %p") if dt_moonset else "--",
        "moonrise_telugu": format_telugu_time(dt_moonrise, "te") if dt_moonrise else "--",
        "moonset_telugu": format_telugu_time(dt_moonset, "te") if dt_moonset else "--",
    }
