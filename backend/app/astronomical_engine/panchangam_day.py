"""
Complete Panchangam Day Orchestrator
Coordinates astronomical calculations, Five Angas, Muhurthams, Solar/Lunar Rashi, and Telugu Lunisolar calendar elements.
"""

from typing import Dict, Any, Optional
from datetime import date, datetime
from zoneinfo import ZoneInfo

from .sun_moon_rise import calculate_sun_times, calculate_moon_times
from .five_angas import calculate_five_angas
from .muhurtham import calculate_daily_timings
from .telugu_calendar import (
    get_telugu_month_info,
    get_samvatsara_info,
    get_ayana_info,
    get_ritu_info,
)
from .ephemeris import (
    get_sun_sidereal_longitude,
    get_moon_sidereal_longitude,
    get_rashi_from_longitude,
    get_all_graha_positions,
    get_ayanamsa,
)


def calculate_daily_panchangam(
    target_date: date,
    latitude: float,
    longitude: float,
    elevation_m: float = 0.0,
    tz: ZoneInfo = ZoneInfo("Asia/Kolkata"),
    location_name: str = "Hyderabad",
    include_grahas: bool = True,
) -> Dict[str, Any]:
    """
    Main entrypoint to generate complete Daily Panchangam for any date and location.
    Conforms to classical Drik Ganita and Amanta Telugu Calendar standards.
    """
    # 1. Solar & Lunar Rise/Set timings
    sun_times = calculate_sun_times(target_date, latitude, longitude, elevation_m, tz)
    moon_times = calculate_moon_times(target_date, latitude, longitude, elevation_m, tz)

    jd_sunrise = sun_times["jd_sunrise"]
    jd_next_sunrise = sun_times["jd_next_sunrise"]

    if jd_sunrise is None or jd_next_sunrise is None:
        raise ValueError(f"Unable to calculate sunrise for date {target_date} at lat={latitude}, lon={longitude}")

    # 2. Ephemeris & Ayanamsa at Sunrise
    ayanamsa_deg = get_ayanamsa(jd_sunrise)
    sun_lon_sr = get_sun_sidereal_longitude(jd_sunrise)
    moon_lon_sr = get_moon_sidereal_longitude(jd_sunrise)

    sun_rashi = get_rashi_from_longitude(sun_lon_sr)
    moon_rashi = get_rashi_from_longitude(moon_lon_sr)

    # 3. Five Angas (పంచాంగం)
    angas = calculate_five_angas(jd_sunrise, jd_next_sunrise, tz)

    # 4. Telugu Calendar Elements (సంవత్సరం, మాసం, పక్షం, అయనం, ఋతువు)
    month_info = get_telugu_month_info(jd_sunrise)
    samvatsara_info = get_samvatsara_info(
        target_date,
        month_info["index"],
    )
    ayana_info = get_ayana_info(sun_lon_sr)
    ritu_info = get_ritu_info(month_info["index"])

    # 5. Muhurthams & Daily Timings
    # Pass all Nakshatras active during the Panchangam day so Varjyam & Amrita are computed for all
    all_nakshatras = angas["nakshatra"].get("all_day_transitions", [angas["nakshatra"]["primary"]])
    daily_timings = calculate_daily_timings(
        sun_times["dt_sunrise"],
        sun_times["dt_sunset"],
        sun_times["dt_next_sunrise"],
        angas["vara"]["index"],
        angas["nakshatra"]["primary"],
        all_nakshatras,
        tz,
    )

    # 6. Graha (Navagraha) Positions
    grahas = get_all_graha_positions(jd_sunrise) if include_grahas else []

    # 7. Summary Headline in Telugu & English
    summary_telugu = (
        f"శ్రీ {samvatsara_info['name_telugu']} నామ సంవత్సరం, "
        f"{month_info['name_telugu']}, "
        f"{angas['tithi']['primary']['paksha_telugu']}, "
        f"{angas['tithi']['primary']['name_telugu']}, "
        f"{angas['vara']['name_telugu']}, "
        f"{angas['nakshatra']['primary']['name_telugu']} నక్షత్రం"
    )
    summary_english = (
        f"Sri {samvatsara_info['name_english']} Samvatsaram, "
        f"{month_info['name_english']}, "
        f"{angas['tithi']['primary']['paksha']} Paksha, "
        f"{angas['tithi']['primary']['name_english']}, "
        f"{angas['vara']['name_english']}, "
        f"{angas['nakshatra']['primary']['name_english']} Nakshatram"
    )

    return {
        "metadata": {
            "date": target_date.isoformat(),
            "location_name": location_name,
            "latitude": latitude,
            "longitude": longitude,
            "elevation_meters": elevation_m,
            "timezone": str(tz),
            "ayanamsa": {
                "name": "Lahiri / Chitrapaksha",
                "degrees": ayanamsa_deg,
            },
            "calculation_engine": "Swiss Ephemeris 2.10.03 (JPL DE431)",
            "rising_convention": "Drik Apparent (Upper Limb with Atmospheric Refraction)",
        },
        "summary": {
            "telugu": summary_telugu,
            "english": summary_english,
        },
        "telugu_calendar": {
            "samvatsaram": samvatsara_info,
            "masam": month_info,
            "paksham": {
                "telugu": angas["tithi"]["primary"]["paksha_telugu"],
                "english": angas["tithi"]["primary"]["paksha"],
            },
            "ayanam": ayana_info,
            "rituvu": ritu_info,
        },
        "sun_moon": {
            "sunrise": sun_times["sunrise_str"],
            "sunset": sun_times["sunset_str"],
            "sunrise_telugu": sun_times["sunrise_telugu"],
            "sunset_telugu": sun_times["sunset_telugu"],
            "sunrise_iso": sun_times["dt_sunrise"].isoformat() if sun_times["dt_sunrise"] else None,
            "sunset_iso": sun_times["dt_sunset"].isoformat() if sun_times["dt_sunset"] else None,
            "next_sunrise_iso": sun_times["dt_next_sunrise"].isoformat() if sun_times.get("dt_next_sunrise") else None,
            "moonrise": moon_times["moonrise_str"],
            "moonset": moon_times["moonset_str"],
            "moonrise_telugu": moon_times["moonrise_telugu"],
            "moonset_telugu": moon_times["moonset_telugu"],
            "sun_rashi": sun_rashi,
            "moon_rashi": moon_rashi,
            "dinamana_seconds": sun_times["dinamana_seconds"],
            "ratrimana_seconds": sun_times["ratrimana_seconds"],
        },
        "panchangam": angas,
        "muhurtham": daily_timings,
        "grahas": grahas,
    }
