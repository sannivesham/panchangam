"""
Five Angas of Panchangam (పంచాంగం)
Calculates Tithi, Vara, Nakshatram, Yogam, and Karanam with exact start and end timestamps.
Supports multiple transitions per day (e.g. 3 Karanas or Kshaya Tithis).
"""

from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime, date, timezone
from zoneinfo import ZoneInfo

from ..core.constants import TITHIS, NAKSHATRAS, YOGAS, KARANAS, VARAS
from .ephemeris import (
    get_lunar_elongation,
    get_moon_sidereal_longitude,
    get_yoga_angle,
    get_rashi_from_longitude,
)
from .root_finder import (
    find_transition_in_bracket,
    find_all_transitions_in_range,
)
from .julian import jd_to_datetime, format_telugu_time


def get_karana_from_half_tithi(half_tithi_idx: int) -> Dict[str, Any]:
    """
    Maps half-tithi index (1 to 60) to Karana (1 to 11).
    1: Kimstughna (Fixed)
    2-57: 7 Repeating (Bava, Balava, Kaulava, Taitila, Gara, Vanija, Vishti)
    58: Shakuni (Fixed)
    59: Chatushpada (Fixed)
    60: Naga (Fixed)
    """
    if half_tithi_idx == 1:
        karana_idx = 11  # Kimstughna
    elif 2 <= half_tithi_idx <= 57:
        karana_idx = ((half_tithi_idx - 2) % 7) + 1
    elif half_tithi_idx == 58:
        karana_idx = 8  # Shakuni
    elif half_tithi_idx == 59:
        karana_idx = 9  # Chatushpada
    elif half_tithi_idx == 60:
        karana_idx = 10  # Naga
    else:
        karana_idx = 1

    return KARANAS[karana_idx - 1]


def compute_anga_detail(
    name_telugu: str,
    name_english: str,
    index: int,
    start_jd: float,
    end_jd: float,
    tz: ZoneInfo,
    extra: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Formats an Anga with ISO UTC timestamps and localized Telugu time strings."""
    dt_start = jd_to_datetime(start_jd, tz)
    dt_end = jd_to_datetime(end_jd, tz)

    # True UTC ISO timestamps
    start_utc_str = dt_start.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    end_utc_str = dt_end.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    res = {
        "index": index,
        "name_telugu": name_telugu,
        "name_english": name_english,
        "start_utc": start_utc_str,
        "end_utc": end_utc_str,
        "start_local_iso": dt_start.isoformat(),
        "end_local_iso": dt_end.isoformat(),
        "start_time": dt_start.strftime("%I:%M:%S %p"),
        "end_time": dt_end.strftime("%I:%M:%S %p"),
        "start_telugu": format_telugu_time(dt_start, "te"),
        "end_telugu": format_telugu_time(dt_end, "te"),
        "start_date": dt_start.strftime("%Y-%m-%d"),
        "end_date": dt_end.strftime("%Y-%m-%d"),
    }
    if extra:
        res.update(extra)
    return res


def calculate_five_angas(
    jd_sunrise: float,
    jd_next_sunrise: float,
    tz: ZoneInfo = ZoneInfo("Asia/Kolkata"),
) -> Dict[str, Any]:
    """
    Calculates the 5 Angas for the traditional Panchangam day (Sunrise to Next Sunrise).
    Computes values at sunrise and ALL transitions occurring before next sunrise.
    """
    # 1. VARA (వారం)
    dt_sunrise = jd_to_datetime(jd_sunrise, tz)
    py_weekday = dt_sunrise.weekday()  # Mon=0, Sun=6
    vara_idx = (py_weekday + 1) % 7
    vara_info = VARAS[vara_idx]

    # 2. TITHI (తిథి)
    elong_sr = get_lunar_elongation(jd_sunrise)
    tithi_sr_idx = int(elong_sr // 12.0) + 1
    tithi_sr_info = TITHIS[tithi_sr_idx - 1]

    target_start_elong = ((tithi_sr_idx - 1) * 12.0) % 360.0
    tithi_start_jd = find_transition_in_bracket(
        get_lunar_elongation, target_start_elong, jd_sunrise - 1.5, jd_sunrise
    )
    target_end_elong = (tithi_sr_idx * 12.0) % 360.0
    tithi_end_jd = find_transition_in_bracket(
        get_lunar_elongation, target_end_elong, jd_sunrise, jd_sunrise + 1.5
    )

    tithi_primary = compute_anga_detail(
        tithi_sr_info["full_te"],
        tithi_sr_info["english"],
        tithi_sr_idx,
        tithi_start_jd,
        tithi_end_jd,
        tz,
        {"paksha": tithi_sr_info["paksha"], "paksha_telugu": tithi_sr_info["paksha_te"]},
    )

    # Collect all tithi transitions during the 24h Panchangam day
    all_tithis = [tithi_primary]
    curr_t_end = tithi_end_jd
    curr_idx = tithi_sr_idx

    while curr_t_end < jd_next_sunrise:
        next_idx = (curr_idx % 30) + 1
        next_info = TITHIS[next_idx - 1]
        next_end_target = (next_idx * 12.0) % 360.0
        next_end_jd = find_transition_in_bracket(
            get_lunar_elongation, next_end_target, curr_t_end, curr_t_end + 1.5
        )
        t_item = compute_anga_detail(
            next_info["full_te"],
            next_info["english"],
            next_idx,
            curr_t_end,
            next_end_jd,
            tz,
            {"paksha": next_info["paksha"], "paksha_telugu": next_info["paksha_te"]},
        )
        all_tithis.append(t_item)
        curr_t_end = next_end_jd
        curr_idx = next_idx

    # 3. NAKSHATRAM (నక్షత్రం)
    moon_lon_sr = get_moon_sidereal_longitude(jd_sunrise)
    nak_span = 360.0 / 27.0
    nak_sr_idx = int(moon_lon_sr // nak_span) + 1
    nak_sr_info = NAKSHATRAS[nak_sr_idx - 1]

    target_start_nak = ((nak_sr_idx - 1) * nak_span) % 360.0
    nak_start_jd = find_transition_in_bracket(
        get_moon_sidereal_longitude, target_start_nak, jd_sunrise - 1.5, jd_sunrise
    )
    target_end_nak = (nak_sr_idx * nak_span) % 360.0
    nak_end_jd = find_transition_in_bracket(
        get_moon_sidereal_longitude, target_end_nak, jd_sunrise, jd_sunrise + 1.5
    )

    nak_primary = compute_anga_detail(
        nak_sr_info["telugu"],
        nak_sr_info["english"],
        nak_sr_idx,
        nak_start_jd,
        nak_end_jd,
        tz,
        {"ruler": nak_sr_info["ruler"]},
    )

    all_nakshatras = [nak_primary]
    curr_n_end = nak_end_jd
    curr_n_idx = nak_sr_idx

    while curr_n_end < jd_next_sunrise:
        next_n_idx = (curr_n_idx % 27) + 1
        next_n_info = NAKSHATRAS[next_n_idx - 1]
        next_end_target_n = (next_n_idx * nak_span) % 360.0
        next_n_end_jd = find_transition_in_bracket(
            get_moon_sidereal_longitude, next_end_target_n, curr_n_end, curr_n_end + 1.5
        )
        n_item = compute_anga_detail(
            next_n_info["telugu"],
            next_n_info["english"],
            next_n_idx,
            curr_n_end,
            next_n_end_jd,
            tz,
            {"ruler": next_n_info["ruler"]},
        )
        all_nakshatras.append(n_item)
        curr_n_end = next_n_end_jd
        curr_n_idx = next_n_idx

    # 4. YOGAM (యోగం)
    yoga_angle_sr = get_yoga_angle(jd_sunrise)
    yoga_sr_idx = int(yoga_angle_sr // nak_span) + 1
    yoga_sr_info = YOGAS[yoga_sr_idx - 1]

    target_start_yoga = ((yoga_sr_idx - 1) * nak_span) % 360.0
    yoga_start_jd = find_transition_in_bracket(
        get_yoga_angle, target_start_yoga, jd_sunrise - 1.5, jd_sunrise
    )
    target_end_yoga = (yoga_sr_idx * nak_span) % 360.0
    yoga_end_jd = find_transition_in_bracket(
        get_yoga_angle, target_end_yoga, jd_sunrise, jd_sunrise + 1.5
    )

    yoga_primary = compute_anga_detail(
        yoga_sr_info["telugu"],
        yoga_sr_info["english"],
        yoga_sr_idx,
        yoga_start_jd,
        yoga_end_jd,
        tz,
    )

    all_yogas = [yoga_primary]
    curr_y_end = yoga_end_jd
    curr_y_idx = yoga_sr_idx

    while curr_y_end < jd_next_sunrise:
        next_y_idx = (curr_y_idx % 27) + 1
        next_y_info = YOGAS[next_y_idx - 1]
        next_y_target = (next_y_idx * nak_span) % 360.0
        next_y_end_jd = find_transition_in_bracket(
            get_yoga_angle, next_y_target, curr_y_end, curr_y_end + 1.5
        )
        y_item = compute_anga_detail(
            next_y_info["telugu"],
            next_y_info["english"],
            next_y_idx,
            curr_y_end,
            next_y_end_jd,
            tz,
        )
        all_yogas.append(y_item)
        curr_y_end = next_y_end_jd
        curr_y_idx = next_y_idx

    # 5. KARANAM (కరణం)
    half_tithi_sr_idx = int(elong_sr // 6.0) + 1
    karana_sr_info = get_karana_from_half_tithi(half_tithi_sr_idx)

    target_start_karana = ((half_tithi_sr_idx - 1) * 6.0) % 360.0
    karana_start_jd = find_transition_in_bracket(
        get_lunar_elongation, target_start_karana, jd_sunrise - 1.0, jd_sunrise
    )
    target_end_karana = (half_tithi_sr_idx * 6.0) % 360.0
    karana_end_jd = find_transition_in_bracket(
        get_lunar_elongation, target_end_karana, jd_sunrise, jd_sunrise + 1.0
    )

    karana_primary = compute_anga_detail(
        karana_sr_info["telugu"],
        karana_sr_info["english"],
        karana_sr_info["index"],
        karana_start_jd,
        karana_end_jd,
        tz,
        {"type": karana_sr_info["type"], "half_tithi_index": half_tithi_sr_idx},
    )

    all_karanas = [karana_primary]
    curr_k_end = karana_end_jd
    curr_k_idx = half_tithi_sr_idx

    while curr_k_end < jd_next_sunrise:
        next_ht_idx = (curr_k_idx % 60) + 1
        next_k_info = get_karana_from_half_tithi(next_ht_idx)
        next_k_target = (next_ht_idx * 6.0) % 360.0
        next_k_end_jd = find_transition_in_bracket(
            get_lunar_elongation, next_k_target, curr_k_end, curr_k_end + 1.0
        )
        k_item = compute_anga_detail(
            next_k_info["telugu"],
            next_k_info["english"],
            next_k_info["index"],
            curr_k_end,
            next_k_end_jd,
            tz,
            {"type": next_k_info["type"], "half_tithi_index": next_ht_idx},
        )
        all_karanas.append(k_item)
        curr_k_end = next_k_end_jd
        curr_k_idx = next_ht_idx

    return {
        "vara": {
            "index": vara_idx,
            "name_telugu": vara_info["telugu"],
            "name_english": vara_info["english"],
            "ruler": vara_info["ruler"],
        },
        "tithi": {
            "primary": tithi_primary,
            "next": all_tithis[1] if len(all_tithis) > 1 else None,
            "all_day_transitions": all_tithis,
            "has_transition_today": len(all_tithis) > 1,
        },
        "nakshatra": {
            "primary": nak_primary,
            "next": all_nakshatras[1] if len(all_nakshatras) > 1 else None,
            "all_day_transitions": all_nakshatras,
            "has_transition_today": len(all_nakshatras) > 1,
        },
        "yoga": {
            "primary": yoga_primary,
            "next": all_yogas[1] if len(all_yogas) > 1 else None,
            "all_day_transitions": all_yogas,
            "has_transition_today": len(all_yogas) > 1,
        },
        "karana": {
            "primary": karana_primary,
            "next": all_karanas[1] if len(all_karanas) > 1 else None,
            "all_day_transitions": all_karanas,
            "has_transition_today": len(all_karanas) > 1,
        },
    }
