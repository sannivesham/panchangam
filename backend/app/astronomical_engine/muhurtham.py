"""
Muhurtham and Traditional Timings
Calculates Rahu Kalam, Yamagandam, Gulika Kalam, Abhijit, Durmuhurtham, Varjyam, Amrita Kalam, and Brahma Muhurtham.
Strictly verified against classical Muhurtha Chintamani tables.
"""

from typing import Dict, Any, List, Tuple, Optional
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from .julian import format_telugu_time
from ..core.constants import NAKSHATRAS


def compute_interval_dict(
    name_telugu: str,
    name_english: str,
    start_dt: datetime,
    end_dt: datetime,
    is_auspicious: bool,
    description: str = "",
) -> Dict[str, Any]:
    """Helper to format a muhurtham interval with UTC ISO and local localized formatting."""
    start_utc = start_dt.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ")
    end_utc = end_dt.astimezone(ZoneInfo("UTC")).strftime("%Y-%m-%dT%H:%M:%SZ")

    return {
        "name_telugu": name_telugu,
        "name_english": name_english,
        "is_auspicious": is_auspicious,
        "start_utc": start_utc,
        "end_utc": end_utc,
        "start_time_local": start_dt.strftime("%I:%M:%S %p"),
        "end_time_local": end_dt.strftime("%I:%M:%S %p"),
        "start_time": start_dt.strftime("%I:%M:%S %p"),
        "end_time": end_dt.strftime("%I:%M:%S %p"),
        "start_telugu": format_telugu_time(start_dt, "te"),
        "end_telugu": format_telugu_time(end_dt, "te"),
        "description": description,
    }


def calculate_daily_timings(
    dt_sunrise: datetime,
    dt_sunset: datetime,
    dt_next_sunrise: datetime,
    vara_index: int,  # 0=Sunday, 1=Monday... 6=Saturday
    primary_nakshatra: Dict[str, Any],
    all_day_nakshatras: Optional[List[Dict[str, Any]]] = None,
    tz: ZoneInfo = ZoneInfo("Asia/Kolkata"),
) -> Dict[str, Any]:
    """
    Computes all standard traditional timings for the Panchangam day.
    """
    dinamana = dt_sunset - dt_sunrise
    dinamana_sec = dinamana.total_seconds()
    ratrimana = dt_next_sunrise - dt_sunset
    ratrimana_sec = ratrimana.total_seconds()

    one_eighth_sec = dinamana_sec / 8.0
    diurnal_muhurtha_sec = dinamana_sec / 15.0
    nocturnal_muhurtha_sec = ratrimana_sec / 15.0

    # 1. RAHU KALAM (రాహుకాలం - inauspicious)
    # Sun: 8, Mon: 2, Tue: 7, Wed: 5, Thu: 6, Fri: 4, Sat: 3
    rahu_segments = {0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3}
    rahu_seg = rahu_segments[vara_index]
    rahu_start = dt_sunrise + timedelta(seconds=(rahu_seg - 1) * one_eighth_sec)
    rahu_end = dt_sunrise + timedelta(seconds=rahu_seg * one_eighth_sec)
    rahu_kalam = compute_interval_dict(
        "రాహుకాలం", "Rahu Kalam", rahu_start, rahu_end, False, "ప్రయాణాలు, నూతన కార్యారంభాలకు నిషిద్ధం"
    )

    # 2. YAMAGANDAM (యమగండం - inauspicious)
    # Sun: 5, Mon: 4, Tue: 3, Wed: 2, Thu: 1, Fri: 7, Sat: 6
    yama_segments = {0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6}
    yama_seg = yama_segments[vara_index]
    yama_start = dt_sunrise + timedelta(seconds=(yama_seg - 1) * one_eighth_sec)
    yama_end = dt_sunrise + timedelta(seconds=yama_seg * one_eighth_sec)
    yamagandam = compute_interval_dict(
        "యమగండం", "Yamagandam", yama_start, yama_end, False, "మృత్యు భయ సూచకం, శుభకార్యాలు నిషిద్ధం"
    )

    # 3. GULIKA KALAM (గుళిక కాలం - Inauspicious in South Indian tradition)
    # Sun: 7, Mon: 6, Tue: 5, Wed: 4, Thu: 3, Fri: 2, Sat: 1
    # Traditional rule: Gulika is Mandi's period, treated as inauspicious for auspicious ceremonies.
    gulika_segments = {0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1}
    gulika_seg = gulika_segments[vara_index]
    gulika_start = dt_sunrise + timedelta(seconds=(gulika_seg - 1) * one_eighth_sec)
    gulika_end = dt_sunrise + timedelta(seconds=gulika_seg * one_eighth_sec)
    gulika_kalam = compute_interval_dict(
        "గుళిక కాలం", "Gulika Kalam", gulika_start, gulika_end, False, "అశుభ సమయం, శుభకార్యాలు నిషిద్ధం"
    )

    # 4. ABHIJIT MUHURTHAM (అభిజిత్ ముహూర్తం - 8th diurnal muhurtha)
    abhijit_start = dt_sunrise + timedelta(seconds=7 * diurnal_muhurtha_sec)
    abhijit_end = dt_sunrise + timedelta(seconds=8 * diurnal_muhurtha_sec)
    is_abhijit_auspicious = vara_index != 3  # On Wednesday, Abhijit is tainted
    abhijit_desc = (
        "మధ్యాహ్న కాల అత్యంత శుభ ముహూర్తం"
        if is_abhijit_auspicious
        else "బుధవారం నాడు అభిజిత్ ముహూర్తం దుర్ముహూర్తంతో కలిసి వర్జ్యమవుతుంది"
    )
    abhijit = compute_interval_dict(
        "అభిజిత్ ముహూర్తం", "Abhijit Muhurtham", abhijit_start, abhijit_end, is_abhijit_auspicious, abhijit_desc
    )

    # 5. DURMUHURTHAM (దుర్ముహూర్తం - inauspicious)
    # Weekday slots (1-based diurnal muhurthas):
    # Sun: 14th
    # Mon: 9th & 12th
    # Tue: 4th & 11th
    # Wed: 8th
    # Thu: 6th & 12th
    # Fri: 4th & 9th
    # Sat: 1st & 2nd (starts right from sunrise)
    durmuhurtha_slots = {
        0: [14],
        1: [9, 12],
        2: [4, 11],
        3: [8],
        4: [6, 12],
        5: [4, 9],
        6: [1, 2],
    }
    slots = durmuhurtha_slots[vara_index]
    durmuhurthams = []
    # If consecutive slots on Saturday [1, 2], combine into continuous span
    if vara_index == 6 and slots == [1, 2]:
        dm_start = dt_sunrise
        dm_end = dt_sunrise + timedelta(seconds=2 * diurnal_muhurtha_sec)
        durmuhurthams.append(
            compute_interval_dict(
                "దుర్ముహూర్తం", "Durmuhurtham (1st & 2nd Muhurtha)", dm_start, dm_end, False, "సూర్యోదయం నుండి 2 ముహూర్తాలు అశుభం"
            )
        )
    else:
        for s in slots:
            dm_start = dt_sunrise + timedelta(seconds=(s - 1) * diurnal_muhurtha_sec)
            dm_end = dt_sunrise + timedelta(seconds=s * diurnal_muhurtha_sec)
            durmuhurthams.append(
                compute_interval_dict(
                    "దుర్ముహూర్తం", f"Durmuhurtham ({s}th Muhurtha)", dm_start, dm_end, False, "అశుభ సమయం"
                )
            )

    # 6. BRAHMA MUHURTHAM (బ్రహ్మ ముహూర్తం - highly auspicious)
    # 14th nocturnal muhurtha: from Sunrise - 2*M to Sunrise - 1*M (approx 96m to 48m before sunrise)
    brahma_start = dt_sunrise - timedelta(seconds=2 * nocturnal_muhurtha_sec)
    brahma_end = dt_sunrise - timedelta(seconds=1 * nocturnal_muhurtha_sec)
    brahma_muhurtham = compute_interval_dict(
        "బ్రహ్మ ముహూర్తం", "Brahma Muhurtham", brahma_start, brahma_end, True, "ధ్యాన, జప, సాధనలకు శ్రేష్ఠమైన సమయం"
    )

    # 7. VARJYAM & AMRITA KALAM (వర్జ్యం & అమృత కాలం)
    # Using individual Nakshatra tables from Muhurtha Chintamani
    varjyam_list = []
    amrita_list = []

    nakshatras_to_process = all_day_nakshatras if all_day_nakshatras else [primary_nakshatra]

    for nak_data in nakshatras_to_process:
        nak_idx = nak_data["index"]
        nak_info = NAKSHATRAS[nak_idx - 1]

        # Extract start and end datetimes
        # Nakshatra boundaries can be parsed from start_utc or start_local
        if "start_utc" in nak_data and nak_data["start_utc"].endswith("Z"):
            start_dt = datetime.fromisoformat(nak_data["start_utc"].replace("Z", "+00:00")).astimezone(tz)
            end_dt = datetime.fromisoformat(nak_data["end_utc"].replace("Z", "+00:00")).astimezone(tz)
        elif "start_date" in nak_data:
            # Fallback for ISO strings
            start_dt = datetime.fromisoformat(nak_data["start_utc"])
            if start_dt.tzinfo is None:
                start_dt = start_dt.replace(tzinfo=tz)
            else:
                start_dt = start_dt.astimezone(tz)
            end_dt = datetime.fromisoformat(nak_data["end_utc"])
            if end_dt.tzinfo is None:
                end_dt = end_dt.replace(tzinfo=tz)
            else:
                end_dt = end_dt.astimezone(tz)
        else:
            continue

        nak_duration_sec = (end_dt - start_dt).total_seconds()
        ghati_sec = nak_duration_sec / 60.0

        # A. Varjyam calculation (4 ghatis from varjyam_start_ghati)
        v_start_ghati = nak_info["varjyam_start_ghati"]
        v_start = start_dt + timedelta(seconds=(v_start_ghati - 1) * ghati_sec)
        v_end = v_start + timedelta(seconds=4 * ghati_sec)

        # Only include if overlapping with the current Panchangam day [dt_sunrise, dt_next_sunrise]
        if v_end > dt_sunrise and v_start < dt_next_sunrise:
            varjyam_list.append(
                compute_interval_dict(
                    f"వర్జ్యం ({nak_info['telugu']})",
                    f"Varjyam ({nak_info['english']})",
                    v_start,
                    v_end,
                    False,
                    f"{nak_info['telugu']} నక్షత్ర త్యాజ్య కాలం (4 ఘడియలు)",
                )
            )

        # B. Amrita Kalam calculation (4 ghatis from amrita_start_ghati)
        # Using specific canonical start ghati from Muhurtha Chintamani
        a_start_ghati = nak_info["amrita_start_ghati"]
        a_start = start_dt + timedelta(seconds=(a_start_ghati - 1) * ghati_sec)
        a_end = a_start + timedelta(seconds=4 * ghati_sec)

        # Only include if overlapping with the current Panchangam day
        if a_end > dt_sunrise and a_start < dt_next_sunrise:
            amrita_list.append(
                compute_interval_dict(
                    f"అమృత కాలం ({nak_info['telugu']})",
                    f"Amrita Kalam ({nak_info['english']})",
                    a_start,
                    a_end,
                    True,
                    f"{nak_info['telugu']} నక్షత్ర అమృత ముహూర్తం ({a_start_ghati}వ ఘడియ నుండి 4 ఘడియలు)",
                )
            )

    return {
        "rahu_kalam": rahu_kalam,
        "yamagandam": yamagandam,
        "gulika_kalam": gulika_kalam,
        "abhijit_muhurtham": abhijit,
        "durmuhurthams": durmuhurthams,
        "brahma_muhurtham": brahma_muhurtham,
        "varjyam": varjyam_list,
        "amrita_kalam": amrita_list,
    }
