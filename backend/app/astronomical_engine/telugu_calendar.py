"""
Telugu Lunisolar Calendar System (తెలుగు కాలమానం)
Implements traditional Amanta month determination, 60-year Samvatsara cycle,
Adhika/Kshaya Masam detection, Ayana, and Ritu.
"""

from typing import Dict, Any, Tuple, Optional, List
from datetime import datetime, date
from zoneinfo import ZoneInfo
from .swe_wrapper import SwissEphemeris
from .ephemeris import (
    get_sun_sidereal_longitude,
    get_lunar_elongation,
    get_rashi_from_longitude,
)
from .root_finder import find_transition_in_bracket, find_all_transitions_in_range
from .julian import jd_to_datetime
from ..core.constants import TELUGU_MONTHS, SAMVATSARAS, RASHIS


def find_surrounding_new_moons(jd_ut: float) -> Tuple[float, float]:
    """
    Finds the exact Julian Days of the previous New Moon (elongation = 0)
    and the next New Moon enclosing the given timestamp.
    """
    step = 2.0  # 2 days
    found_prev = False
    prev_jd = jd_ut

    # Search backwards for previous new moon
    for i in range(1, 18):
        t_before = jd_ut - (i * step)
        t_after = jd_ut - ((i - 1) * step)
        e1 = get_lunar_elongation(t_before)
        e2 = get_lunar_elongation(t_after)
        if e1 > 270.0 and e2 < 90.0:
            prev_jd = find_transition_in_bracket(get_lunar_elongation, 0.0, t_before, t_after)
            found_prev = True
            break

    if not found_prev:
        prev_jd = find_transition_in_bracket(get_lunar_elongation, 0.0, jd_ut - 35.0, jd_ut)

    # Search forwards for next new moon
    found_next = False
    next_jd = jd_ut + 29.53
    for i in range(1, 18):
        t_before = jd_ut + ((i - 1) * step)
        t_after = jd_ut + (i * step)
        e1 = get_lunar_elongation(t_before)
        e2 = get_lunar_elongation(t_after)
        if e1 > 270.0 and e2 < 90.0:
            next_jd = find_transition_in_bracket(get_lunar_elongation, 0.0, t_before, t_after)
            found_next = True
            break

    if not found_next:
        next_jd = find_transition_in_bracket(get_lunar_elongation, 0.0, jd_ut, jd_ut + 35.0)

    return (prev_jd, next_jd)


def get_telugu_month_info(jd_ut: float) -> Dict[str, Any]:
    """
    Determines the Amanta Telugu lunar month for the given instant.
    Detects Adhika Masam (leap month), Nija Masam, or Kshaya Masam (decayed month)
    by counting solar ingresses (Sankrantis) between previous and next New Moon.
    """
    prev_nm, next_nm = find_surrounding_new_moons(jd_ut)

    # Detect all solar ingresses (crossing of 30-degree zodiac boundaries) in this lunar month
    ingresses = find_all_transitions_in_range(
        get_sun_sidereal_longitude,
        30.0,
        prev_nm,
        next_nm,
        coarse_step_hours=6.0,
    )

    num_ingresses = len(ingresses)
    is_adhika = num_ingresses == 0
    is_kshaya = num_ingresses >= 2

    sun_lon_start = get_sun_sidereal_longitude(prev_nm)
    rashi_start = int(sun_lon_start // 30.0) + 1

    if is_adhika:
        # No solar ingress: Adhika month naming takes the upcoming solar rashi
        month_index = (rashi_start % 12) + 1
    elif is_kshaya:
        # Two solar ingresses: covers two rashis (the second month is skipped/decayed)
        month_index = ingresses[0][2]
    else:
        # Exactly one ingress: standard Nija month named after the rashi the Sun entered
        month_index = ingresses[0][2]

    base_month = TELUGU_MONTHS[month_index - 1]

    if is_adhika:
        name_telugu = f"అధిక {base_month['telugu']}"
        name_english = f"Adhika {base_month['english']}"
    elif is_kshaya:
        name_telugu = f"క్షయ {base_month['telugu']}"
        name_english = f"Kshaya {base_month['english']}"
    else:
        name_telugu = base_month["telugu"]
        name_english = base_month["english"]

    return {
        "index": month_index,
        "name_telugu": name_telugu,
        "name_english": name_english,
        "is_adhika": is_adhika,
        "is_kshaya": is_kshaya,
        "rashi_ingress": base_month["rashi_ingress"],
        "num_solar_ingresses": num_ingresses,
        "prev_new_moon_jd": prev_nm,
        "next_new_moon_jd": next_nm,
    }


def get_samvatsara_info(calendar_date: date, month_index: int) -> Dict[str, Any]:
    """
    Determines the 60-year Samvatsara (షష్టి సంవత్సరం).
    Ugadi (Chaitra Shukla Pratipada) marks the beginning of the new Samvatsara in spring.
    - If date is in Gregorian Jan, Feb, or Mar and in Telugu months Pushya, Magha, or Phalguna (10, 11, 12),
      Ugadi has not yet occurred for this Gregorian year; it belongs to (calendar_year - 1).
    - In April through December, it ALWAYS belongs to calendar_year (even when Pushya occurs in December!).
    - In March, if the month has already rolled over to Chaitra (month 1), it belongs to calendar_year.
    """
    effective_year = calendar_date.year

    if calendar_date.month in (1, 2, 3) and month_index in (10, 11, 12):
        effective_year = calendar_date.year - 1

    # Base reference: 1987 CE started Prabhava (#1).
    # 2024 CE: Krodhi (#38)
    # 2025 CE: Vishvavasu (#39)
    # 2026 CE: Parabhava (#40)
    # 2027 CE: Plavanga (#41)
    samvatsara_idx = ((effective_year - 1987) % 60) + 1
    sam_info = SAMVATSARAS[samvatsara_idx - 1]

    return {
        "index": sam_info["index"],
        "name_telugu": sam_info["telugu"],
        "name_english": sam_info["english"],
        "effective_year": effective_year,
    }


def get_ayana_info(sun_longitude: float) -> Dict[str, Any]:
    """
    Determines Ayana:
    Uttarayanam (ఉత్తరాయణం): Sun in Makara to Mithuna (270 to 90 degrees)
    Dakshinayanam (దక్షిణాయణం): Sun in Karkataka to Dhanu (90 to 270 degrees)
    """
    lon = sun_longitude % 360.0
    if 270.0 <= lon or lon < 90.0:
        return {
            "name_telugu": "ఉత్తరాయణం",
            "name_english": "Uttarayanam",
            "description": "సూర్యుని ఉత్తర దిశ గమనం (శుభదాయకం)",
        }
    else:
        return {
            "name_telugu": "దక్షిణాయణం",
            "name_english": "Dakshinayanam",
            "description": "సూర్యుని దక్షిణ దిశ గమనం",
        }


def get_ritu_info(month_index: int) -> Dict[str, Any]:
    """
    Determines traditional 6 Ritus (ఋతువులు) based on lunar month:
    1, 2 (Chaitra, Vaishakha) -> వసంత ఋతువు (Vasanta)
    3, 4 (Jyeshtha, Ashadha) -> గ్రీష్మ ఋతువు (Greeshma)
    5, 6 (Shravana, Bhadrapada) -> వర్ష ఋతువు (Varsha)
    7, 8 (Ashvayuja, Karthika) -> శరద్ ఋతువు (Sharad)
    9, 10 (Margashira, Pushya) -> హేమంత ఋతువు (Hemanta)
    11, 12 (Magha, Phalguna) -> శిశిర ఋతువు (Shishira)
    """
    ritus = [
        {"index": 1, "telugu": "వసంత ఋతువు", "english": "Vasanta Ritu", "season": "Spring"},
        {"index": 2, "telugu": "గ్రీష్మ ఋతువు", "english": "Greeshma Ritu", "season": "Summer"},
        {"index": 3, "telugu": "వర్ష ఋతువు", "english": "Varsha Ritu", "season": "Monsoon"},
        {"index": 4, "telugu": "శరద్ ఋతువు", "english": "Sharad Ritu", "season": "Autumn"},
        {"index": 5, "telugu": "హేమంత ఋతువు", "english": "Hemanta Ritu", "season": "Pre-Winter"},
        {"index": 6, "telugu": "శిశిర ఋతువు", "english": "Shishira Ritu", "season": "Winter"},
    ]
    ritu_idx = ((month_index - 1) // 2) + 1
    return ritus[ritu_idx - 1]
