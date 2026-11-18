"""
Astronomical Ephemeris Calculations
Calculates precise Nirayana (sidereal) planetary positions using Swiss Ephemeris and Lahiri Ayanamsa.
"""

from typing import Tuple, Dict, Any, List
from .swe_wrapper import (
    SwissEphemeris,
    SE_SUN,
    SE_MOON,
    SE_MARS,
    SE_MERCURY,
    SE_JUPITER,
    SE_VENUS,
    SE_SATURN,
    SE_TRUE_NODE,
    SEFLG_SWIEPH,
    SEFLG_SPEED,
    SEFLG_SIDEREAL,
    SE_SIDM_LAHIRI,
)
from ..core.constants import RASHIS, NAKSHATRAS


def get_sidereal_flags() -> int:
    return SEFLG_SWIEPH | SEFLG_SPEED | SEFLG_SIDEREAL


def get_ayanamsa(jd_ut: float) -> float:
    """Returns Lahiri / Chitrapaksha Ayanamsa in degrees."""
    swe = SwissEphemeris.get_instance()
    return swe.get_ayanamsa_ut(jd_ut)


def get_sun_sidereal_longitude(jd_ut: float) -> float:
    """Returns Sidereal longitude of the Sun (0 to 360 degrees)."""
    swe = SwissEphemeris.get_instance()
    xx = swe.calc_ut(jd_ut, SE_SUN, get_sidereal_flags())
    return xx[0] % 360.0


def get_moon_sidereal_longitude(jd_ut: float) -> float:
    """Returns Sidereal longitude of the Moon (0 to 360 degrees)."""
    swe = SwissEphemeris.get_instance()
    xx = swe.calc_ut(jd_ut, SE_MOON, get_sidereal_flags())
    return xx[0] % 360.0


def get_lunar_elongation(jd_ut: float) -> float:
    """
    Returns lunar elongation D = (Moon_lon - Sun_lon) modulo 360 degrees.
    D in [0, 360).
    """
    sun_lon = get_sun_sidereal_longitude(jd_ut)
    moon_lon = get_moon_sidereal_longitude(jd_ut)
    return (moon_lon - sun_lon) % 360.0


def get_yoga_angle(jd_ut: float) -> float:
    """
    Returns Yoga angle = (Moon_lon + Sun_lon) modulo 360 degrees.
    """
    sun_lon = get_sun_sidereal_longitude(jd_ut)
    moon_lon = get_moon_sidereal_longitude(jd_ut)
    return (moon_lon + sun_lon) % 360.0


def get_rashi_from_longitude(longitude: float) -> Dict[str, Any]:
    """Determine Zodiac sign (1 to 12) from sidereal longitude."""
    lon = longitude % 360.0
    index = int(lon // 30.0) + 1
    degree_in_rashi = lon % 30.0
    rashi_info = RASHIS[index - 1]
    return {
        "index": index,
        "telugu": rashi_info["telugu"],
        "english": rashi_info["english"],
        "sanskrit": rashi_info["sanskrit"],
        "degrees": degree_in_rashi,
        "longitude": lon,
    }


def get_nakshatra_pada_from_longitude(longitude: float) -> Dict[str, Any]:
    """Determine Nakshatra (1 to 27) and Pada (1 to 4) from longitude."""
    lon = longitude % 360.0
    nak_span = 360.0 / 27.0  # 13 deg 20 min = 13.333333333333334 deg
    pada_span = nak_span / 4.0  # 3 deg 20 min = 3.3333333333333335 deg

    nak_idx = int(lon // nak_span) + 1
    remainder = lon % nak_span
    pada = int(remainder // pada_span) + 1

    nak_info = NAKSHATRAS[nak_idx - 1]
    return {
        "index": nak_idx,
        "telugu": nak_info["telugu"],
        "english": nak_info["english"],
        "ruler": nak_info["ruler"],
        "pada": pada,
        "degrees_in_nakshatra": remainder,
    }


def get_all_graha_positions(jd_ut: float) -> List[Dict[str, Any]]:
    """Calculates sidereal positions for all Navagrahas (9 planets)."""
    swe = SwissEphemeris.get_instance()
    planets = [
        ("Sun", "సూర్యుడు", SE_SUN),
        ("Moon", "చంద్రుడు", SE_MOON),
        ("Mars", "కుజుడు / అంగారకుడు", SE_MARS),
        ("Mercury", "బుధుడు", SE_MERCURY),
        ("Jupiter", "గురుడు / బృహస్పతి", SE_JUPITER),
        ("Venus", "శుక్రుడు", SE_VENUS),
        ("Saturn", "శని", SE_SATURN),
        ("Rahu", "రాహువు", SE_TRUE_NODE),
    ]

    results = []
    flags = get_sidereal_flags()

    rahu_lon = 0.0
    for eng_name, tel_name, ipl in planets:
        xx = swe.calc_ut(jd_ut, ipl, flags)
        lon = xx[0] % 360.0
        speed = xx[3]
        if ipl == SE_TRUE_NODE:
            rahu_lon = lon

        rashi = get_rashi_from_longitude(lon)
        nakshatra = get_nakshatra_pada_from_longitude(lon)

        results.append({
            "name_english": eng_name,
            "name_telugu": tel_name,
            "longitude": lon,
            "speed": speed,
            "is_retrograde": speed < 0,
            "rashi": rashi,
            "nakshatra": nakshatra,
        })

    # Ketu is exactly 180 degrees opposite to Rahu
    ketu_lon = (rahu_lon + 180.0) % 360.0
    results.append({
        "name_english": "Ketu",
        "name_telugu": "కేతువు",
        "longitude": ketu_lon,
        "speed": 0.0,
        "is_retrograde": True,
        "rashi": get_rashi_from_longitude(ketu_lon),
        "nakshatra": get_nakshatra_pada_from_longitude(ketu_lon),
    })

    return results
