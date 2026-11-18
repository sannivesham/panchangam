"""
Festival Calculation and Observance Engine
Computes exact festival dates using classical Dharmashastra Vyapti (observance) rules:
Sunrise (Udayavyapini), Madhyahna, Sayahna, Pradosha, Nishita, Arunodaya, and Solar Ingresses.
Guarantees canonical single-day festival resolution (no duplicate days).
"""

from typing import List, Dict, Any, Optional, Tuple
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo
from functools import lru_cache

from .rules import FESTIVAL_RULES
from ..astronomical_engine.ephemeris import (
    get_sun_sidereal_longitude,
    get_lunar_elongation,
)
from ..astronomical_engine.julian import datetime_to_jd
from ..astronomical_engine.sun_moon_rise import calculate_sun_times, calculate_moon_times
from ..astronomical_engine.telugu_calendar import get_telugu_month_info


def get_tithi_at_datetime(dt: datetime) -> int:
    """Returns 1-based Tithi (1 to 30) prevailing at the specified instant."""
    jd = datetime_to_jd(dt)
    elong = get_lunar_elongation(jd)
    return int(elong // 12.0) + 1


def get_exact_solar_ingress_datetime(target_rashi: int, start_dt: datetime, end_dt: datetime) -> Optional[datetime]:
    """
    Finds the exact instant when the Sun enters target_rashi (1=Mesha, ..., 9=Dhanu, 10=Makara)
    in the interval [start_dt, end_dt] via bisection root finding.
    """
    target_deg = ((target_rashi - 1) * 30.0) % 360.0

    def diff(t: datetime) -> float:
        lon = get_sun_sidereal_longitude(datetime_to_jd(t))
        d = (lon - target_deg) % 360.0
        return d - 360.0 if d > 180.0 else d

    f_start = diff(start_dt)
    f_end = diff(end_dt)

    # Ingress occurs if longitude crossed from < target_deg to >= target_deg
    if not (f_start < 0.0 and f_end >= 0.0):
        return None

    # Binary search within 30 seconds precision
    t_low = start_dt
    t_high = end_dt
    for _ in range(25):
        t_mid = t_low + (t_high - t_low) / 2
        f_mid = diff(t_mid)
        if f_mid < 0.0:
            t_low = t_mid
        else:
            t_high = t_mid

    return t_low


def get_observed_sankranti_date(year: int, target_rashi: int, lat: float, lon: float, elev: float, tz: ZoneInfo) -> date:
    """
    Computes the observed date of Solar Sankranti according to Dharma Sindhu:
    If transit occurs before sunset, the festival is observed on that day.
    If transit occurs after sunset (during the night), the Punya Kala / observance moves to the next day.
    """
    # For Makara (rashi 10), scan around Jan 13-16 of year
    # For Dhanu (rashi 9), scan around Dec 14-17 of year
    if target_rashi == 10:
        scan_month = 1
        scan_days = [13, 14, 15, 16]
    elif target_rashi == 9:
        scan_month = 12
        scan_days = [14, 15, 16, 17]
    else:
        scan_month = 1
        scan_days = list(range(1, 29))

    for d in scan_days:
        dt_start = datetime(year, scan_month, d, 0, 0, 0, tzinfo=tz)
        dt_end = dt_start + timedelta(days=1)
        ingress_dt = get_exact_solar_ingress_datetime(target_rashi, dt_start, dt_end)
        if ingress_dt is not None:
            sun_times = calculate_sun_times(dt_start.date(), lat, lon, elev, tz)
            dt_sunset = sun_times["dt_sunset"]
            if ingress_dt <= dt_sunset:
                return dt_start.date()
            else:
                return dt_start.date() + timedelta(days=1)

    # Fallback to standard 14th/15th
    return date(year, scan_month, 15 if target_rashi == 10 else 16)


def get_observance_window(
    rule_type: str,
    target_date: date,
    lat: float,
    lon: float,
    elev: float,
    tz: ZoneInfo,
) -> Tuple[datetime, datetime]:
    """
    Returns (start_dt, end_dt) for the classical observance window on target_date.
    """
    sun_times = calculate_sun_times(target_date, lat, lon, elev, tz)
    dt_sunrise = sun_times["dt_sunrise"]
    dt_sunset = sun_times["dt_sunset"]
    dt_next_sunrise = sun_times["dt_next_sunrise"]

    dinamana_sec = (dt_sunset - dt_sunrise).total_seconds()
    ratrimana_sec = (dt_next_sunrise - dt_sunset).total_seconds()
    muhurtha_day_sec = dinamana_sec / 15.0
    muhurtha_night_sec = ratrimana_sec / 15.0

    if rule_type == "sunrise":
        # Window around sunrise (from Sunrise to 1 muhurtha after sunrise)
        return dt_sunrise, dt_sunrise + timedelta(seconds=muhurtha_day_sec)

    elif rule_type == "madhyahna":
        # 3rd fifth of day (from 2/5 to 3/5 of dinamana, approx 11:30 AM to 1:45 PM)
        w_start = dt_sunrise + timedelta(seconds=0.4 * dinamana_sec)
        w_end = dt_sunrise + timedelta(seconds=0.6 * dinamana_sec)
        return w_start, w_end

    elif rule_type == "sayahna":
        # 5th fifth of day (from 4/5 of dinamana to sunset)
        w_start = dt_sunrise + timedelta(seconds=0.8 * dinamana_sec)
        return w_start, dt_sunset

    elif rule_type == "pradosha":
        # 3 muhurthas from sunset (approx 2h 24m)
        w_start = dt_sunset
        w_end = dt_sunset + timedelta(seconds=3.0 * muhurtha_night_sec)
        return w_start, w_end

    elif rule_type == "nishita":
        # 8th muhurtha of night (centered around midnight)
        w_start = dt_sunset + timedelta(seconds=7.0 * muhurtha_night_sec)
        w_end = dt_sunset + timedelta(seconds=8.0 * muhurtha_night_sec)
        return w_start, w_end

    elif rule_type == "arunodaya":
        # 4 ghatis (2 muhurthas) before sunrise (nominally 96 minutes before sunrise)
        w_start = dt_sunrise - timedelta(seconds=2.0 * muhurtha_night_sec)
        return w_start, dt_sunrise

    elif rule_type == "aparahna":
        # 4th fifth of day (from 3/5 to 4/5 of dinamana)
        w_start = dt_sunrise + timedelta(seconds=0.6 * dinamana_sec)
        w_end = dt_sunrise + timedelta(seconds=0.8 * dinamana_sec)
        return w_start, w_end

    # Default fallback to daytime
    return dt_sunrise, dt_sunset


def compute_tithi_overlap_in_window(w_start: datetime, w_end: datetime, target_tithi: int) -> float:
    """
    Computes exact overlap duration in seconds of target_tithi within [w_start, w_end].
    """
    steps = 10
    total_dur = (w_end - w_start).total_seconds()
    if total_dur <= 0:
        return 0.0

    step_sec = total_dur / steps
    match_count = 0
    for s in range(steps + 1):
        sample_dt = w_start + timedelta(seconds=s * step_sec)
        if get_tithi_at_datetime(sample_dt) == target_tithi:
            match_count += 1

    return (match_count / (steps + 1.0)) * total_dur


def does_rule_match_on_date(
    rule: Dict[str, Any],
    target_date: date,
    month_idx: int,
    is_adhika: bool,
    lat: float,
    lon: float,
    elev: float,
    tz: ZoneInfo,
) -> bool:
    """
    Canonical single-day resolution algorithm:
    Computes Vyapti (overlap score) of target_date, target_date - 1, and target_date + 1.
    target_date wins if and only if it has the winning Vyapti score under Dharma Sindhu rules.
    """
    rule_type = rule["observance_rule"]

    # 1. Major festivals are not observed in Adhika Masam (they belong to Nija Masam)
    if is_adhika and rule["month_index"] > 0:
        return False

    # 2. Solar Ingress Observances
    if rule_type in ("solar_ingress_makara", "day_before_sankranti", "day_after_sankranti", "second_day_after_sankranti"):
        obs_sankranti = get_observed_sankranti_date(target_date.year, 10, lat, lon, elev, tz)
        if rule_type == "solar_ingress_makara":
            return target_date == obs_sankranti
        elif rule_type == "day_before_sankranti":
            return target_date == (obs_sankranti - timedelta(days=1))
        elif rule_type == "day_after_sankranti":
            return target_date == (obs_sankranti + timedelta(days=1))
        elif rule_type == "second_day_after_sankranti":
            return target_date == (obs_sankranti + timedelta(days=2))

    if rule_type == "solar_ingress_dhanu":
        obs_dhanu = get_observed_sankranti_date(target_date.year, 9, lat, lon, elev, tz)
        return target_date == obs_dhanu

    # 3. Varalakshmi Vratam: Friday preceding or on Shravana Purnima
    if rule_type == "varalakshmi_vratam":
        if month_idx == 5 and target_date.weekday() == 4:  # Shravana Friday (Mon=0, Fri=4)
            # Find the date of Shravana Purnima (Tithi 15) in this month
            # It must occur between this Friday and next Thursday (0 to 6 days ahead)
            for d_offset in range(7):
                check_dt = datetime(target_date.year, target_date.month, target_date.day, 12, 0, 0, tzinfo=tz) + timedelta(days=d_offset)
                if get_tithi_at_datetime(check_dt) == 15:
                    return True
        return False

    # 4. Telangana Bonalu: Sundays in Ashadha Masam
    if rule_type == "telangana_bonalu":
        return month_idx == 4 and target_date.weekday() == 6

    # 5. Karthika Somavaram: Mondays in Karthika Masam
    if rule_type == "karthika_monday":
        return month_idx == 8 and target_date.weekday() == 0

    # 6. Standard Lunisolar Month Check
    if rule["month_index"] != month_idx:
        return False

    target_tithi = rule["tithi_index"]
    if rule["paksha"] == "Krishna":
        target_tithi += 15

    # 7. Sunrise (Udayavyapini) rules:
    if rule_type == "sunrise":
        st_today = calculate_sun_times(target_date, lat, lon, elev, tz)
        t_today_sr = get_tithi_at_datetime(st_today["dt_sunrise"])

        if t_today_sr == target_tithi:
            # Check if previous day also had target_tithi at sunrise (Vriddhi)
            st_yest = calculate_sun_times(target_date - timedelta(days=1), lat, lon, elev, tz)
            t_yest_sr = get_tithi_at_datetime(st_yest["dt_sunrise"])
            if t_yest_sr == target_tithi:
                # If present at both sunrises, Day 1 is observed (Purvaviddha)
                return False
            return True

        # Check Kshaya Tithi: tithi started after yesterday sunrise and ended before today sunrise
        st_yest = calculate_sun_times(target_date - timedelta(days=1), lat, lon, elev, tz)
        t_yest_sr = get_tithi_at_datetime(st_yest["dt_sunrise"])
        # If tithi occurred during yesterday daytime/night and neither sunrise has it, yesterday took it
        return False

    # 8. Period-based rules: Madhyahna, Sayahna, Pradosha, Nishita, Arunodaya, Aparahna
    # Compute overlap on target_date, yesterday, and tomorrow
    w_today_start, w_today_end = get_observance_window(rule_type, target_date, lat, lon, elev, tz)
    overlap_today = compute_tithi_overlap_in_window(w_today_start, w_today_end, target_tithi)

    if overlap_today <= 0.0:
        # Check Avyapti case: Tithi does not touch the window on either day
        # In that rare case, check if the tithi falls entirely within this Panchangam day
        # and has maximum proximity to the window
        st_today = calculate_sun_times(target_date, lat, lon, elev, tz)
        t_sr = get_tithi_at_datetime(st_today["dt_sunrise"])
        if t_sr == target_tithi:
            # If tithi was at sunrise but ended before window, check if yesterday had overlap
            w_yest_start, w_yest_end = get_observance_window(rule_type, target_date - timedelta(days=1), lat, lon, elev, tz)
            overlap_yest = compute_tithi_overlap_in_window(w_yest_start, w_yest_end, target_tithi)
            if overlap_yest > 0.0:
                return False  # Yesterday had vyapti, so yesterday wins
            # Neither touched window: Day 1 (yesterday) or Day 2 (today)
            return False
        return False

    # Compute overlap on yesterday and tomorrow
    w_yest_start, w_yest_end = get_observance_window(rule_type, target_date - timedelta(days=1), lat, lon, elev, tz)
    overlap_yest = compute_tithi_overlap_in_window(w_yest_start, w_yest_end, target_tithi)

    w_tom_start, w_tom_end = get_observance_window(rule_type, target_date + timedelta(days=1), lat, lon, elev, tz)
    overlap_tom = compute_tithi_overlap_in_window(w_tom_start, w_tom_end, target_tithi)

    # Overlap comparison:
    # Today wins if it has strictly greater overlap than tomorrow,
    # and greater than or equal to yesterday.
    # If overlap_today == overlap_yest, Dharma Sindhu Purvaviddha rule gives it to yesterday (so today is False).
    if overlap_today >= overlap_yest and overlap_today > overlap_tom:
        if overlap_today == overlap_yest and overlap_yest > 0.0:
            return False  # Yesterday won by Purvaviddha
        return True

    return False


def evaluate_festivals_for_date(
    panchangam_day_data: Dict[str, Any],
    tz: ZoneInfo = ZoneInfo("Asia/Kolkata"),
    region_preference: str = "ALL",  # ALL, TELANGANA, ANDHRA_PRADESH
) -> List[Dict[str, Any]]:
    """
    Evaluates whether any traditional festival or religious occasion falls on the given Panchangam day.
    Guarantees that each festival is assigned to exactly one canonical day.
    """
    target_date = date.fromisoformat(panchangam_day_data["metadata"]["date"])
    latitude = panchangam_day_data["metadata"]["latitude"]
    longitude = panchangam_day_data["metadata"]["longitude"]
    elevation_m = panchangam_day_data["metadata"]["elevation_meters"]

    sun_info = panchangam_day_data["sun_moon"]
    dt_sunrise = datetime.fromisoformat(sun_info["sunrise_iso"])
    dt_sunset = datetime.fromisoformat(sun_info["sunset_iso"])
    dt_next_sunrise = datetime.fromisoformat(sun_info["next_sunrise_iso"]) if sun_info.get("next_sunrise_iso") else (dt_sunrise + timedelta(days=1))

    month_info = panchangam_day_data["telugu_calendar"]["masam"]
    month_idx = month_info["index"]
    is_adhika = month_info["is_adhika"]

    tithi_sr = panchangam_day_data["panchangam"]["tithi"]["primary"]["index"]

    observed_festivals = []

    # 1. Evaluate specific rule-based festivals
    for rule in FESTIVAL_RULES:
        # Check region preference
        if rule["region"] != "ALL" and region_preference != "ALL" and rule["region"] != region_preference:
            continue

        if does_rule_match_on_date(rule, target_date, month_idx, is_adhika, latitude, longitude, elevation_m, tz):
            observed_festivals.append(rule)

    # 2. Check Recurring Vratams and Occasions:
    # A. Ekadashi (ఏకాదశి - Udaya Tithi)
    if tithi_sr in (11, 26):
        paksha_name = "శుక్ల" if tithi_sr == 11 else "కృష్ణ (బహుళ)"
        observed_festivals.append({
            "id": f"ekadashi_{tithi_sr}",
            "name_telugu": f"{paksha_name} ఏకాదశి వ్రతం",
            "name_english": f"{'Shukla' if tithi_sr == 11 else 'Krishna'} Ekadashi",
            "description_telugu": "హరివాసర ఉపవాస వ్రతం. విష్ణు ప్రీతికరమైన పుణ్య దినం.",
            "description_english": "Sacred day of fasting and meditation dedicated to Lord Sri Maha Vishnu.",
            "region": "ALL",
        })

    # Helper function to check if a specific Purnima or Amavasya festival is already present
    has_specific_purnima = any(
        "purnima" in f["id"] or "pournami" in f["id"] or "holi" in f["id"] or "rakhi" in f["id"]
        for f in observed_festivals
    )
    has_specific_amavasya = any(
        "amavasya" in f["id"] or "deepavali" in f["id"] or "bathukamma" in f["id"]
        for f in observed_festivals
    )

    # B. Purnima (పూర్ణిమ / శ్రీ సత్యనారాయణ స్వామి వ్రతం)
    # Purnima is observed when Tithi 15 is at sunrise or Pradosha, but only add generic if no specific Purnima festival
    w_prad_start, w_prad_end = get_observance_window("pradosha", target_date, latitude, longitude, elevation_m, tz)
    purnima_pradosha_overlap = compute_tithi_overlap_in_window(w_prad_start, w_prad_end, 15)
    if (tithi_sr == 15 or purnima_pradosha_overlap > 1800.0) and not has_specific_purnima:
        # Avoid duplicate if yesterday had greater Pradosha vyapti
        w_yest_start, w_yest_end = get_observance_window("pradosha", target_date - timedelta(days=1), latitude, longitude, elevation_m, tz)
        purnima_yest_overlap = compute_tithi_overlap_in_window(w_yest_start, w_yest_end, 15)
        if not (purnima_yest_overlap > purnima_pradosha_overlap and purnima_yest_overlap > 3600.0):
            observed_festivals.append({
                "id": "purnima_vratam",
                "name_telugu": "పూర్ణిమ (శ్రీ సత్యనారాయణ స్వామి వ్రతం)",
                "name_english": "Purnima (Satyanarayana Swamy Vratam)",
                "description_telugu": "పౌర్ణమి పుణ్యస్నానాలు, శ్రీ సత్యనారాయణ స్వామి వ్రతం ఆచరించు శుభదినం.",
                "description_english": "Full Moon auspicious day for Sri Satyanarayana Swamy Vrata and charity.",
                "region": "ALL",
            })

    # C. Amavasya (అమావాస్య / పితృ తర్పణం)
    w_ap_start, w_ap_end = get_observance_window("aparahna", target_date, latitude, longitude, elevation_m, tz)
    amavasya_aparahna_overlap = compute_tithi_overlap_in_window(w_ap_start, w_ap_end, 30)
    if (tithi_sr == 30 or amavasya_aparahna_overlap > 1800.0) and not has_specific_amavasya:
        observed_festivals.append({
            "id": "amavasya_vratam",
            "name_telugu": "అమావాస్య (పితృ తర్పణం / దానాలు)",
            "name_english": "Amavasya (Pitru Tarpana)",
            "description_telugu": "పితృదేవతలకు తిలతర్పణాలు సమర్పించు పుణ్యతిథి.",
            "description_english": "New Moon sacred day for ancestral prayers and charity.",
            "region": "ALL",
        })

    # D. Pradosham (ప్రదోషం - Trayodashi at Sunset/Pradosha)
    # Shukla 13 or Krishna 28
    for trayodashi_tithi in (13, 28):
        ov_today = compute_tithi_overlap_in_window(w_prad_start, w_prad_end, trayodashi_tithi)
        if ov_today > 0.0:
            w_yest_start, w_yest_end = get_observance_window("pradosha", target_date - timedelta(days=1), latitude, longitude, elevation_m, tz)
            ov_yest = compute_tithi_overlap_in_window(w_yest_start, w_yest_end, trayodashi_tithi)
            w_tom_start, w_tom_end = get_observance_window("pradosha", target_date + timedelta(days=1), latitude, longitude, elevation_m, tz)
            ov_tom = compute_tithi_overlap_in_window(w_tom_start, w_tom_end, trayodashi_tithi)

            if ov_today >= ov_yest and ov_today > ov_tom:
                if not (ov_today == ov_yest and ov_yest > 0.0):
                    paksha_str = "శుక్ల" if trayodashi_tithi == 13 else "కృష్ణ"
                    paksha_eng = "Shukla" if trayodashi_tithi == 13 else "Krishna"
                    observed_festivals.append({
                        "id": f"pradosham_{trayodashi_tithi}",
                        "name_telugu": f"{paksha_str} ప్రదోష వ్రతం (శివారాధన)",
                        "name_english": f"{paksha_eng} Pradosham",
                        "description_telugu": "సాయంసంధ్యా సమయంలో ప్రదోష కాల రుద్రాభిషేకం అత్యంత ఫలప్రదం.",
                        "description_english": "Twilight Shiva worship during Pradosha kala for removal of obstacles.",
                        "region": "ALL",
                    })

    # E. Sankashtahara Chaturthi (సంకష్టహర చవితి - Krishna Chaturthi at Moonrise)
    # Target tithi is Krishna Chaturthi (Tithi 19)
    # Check if moonrise falls on target_date and tithi at moonrise is 19
    moon_times = calculate_moon_times(target_date, latitude, longitude, elevation_m, tz)
    dt_moonrise = moon_times.get("dt_moonrise")
    if dt_moonrise is not None:
        tithi_at_mr = get_tithi_at_datetime(dt_moonrise)
        if tithi_at_mr == 19:
            # Check if yesterday also had tithi 19 at moonrise
            moon_times_yest = calculate_moon_times(target_date - timedelta(days=1), latitude, longitude, elevation_m, tz)
            dt_mr_yest = moon_times_yest.get("dt_moonrise")
            tithi_yest_mr = get_tithi_at_datetime(dt_mr_yest) if dt_mr_yest else None

            # If yesterday didn't have 19 at moonrise, today is the day!
            # If yesterday also had 19 at moonrise, Purvaviddha gives it to yesterday
            if tithi_yest_mr != 19:
                observed_festivals.append({
                    "id": "sankashti_chaturthi",
                    "name_telugu": "సంకష్టహర చతుర్థి (గణపతి పూజ & చంద్ర దర్శనం)",
                    "name_english": "Sankashtahara Chaturthi",
                    "description_telugu": "కృష్ణ పక్ష చవితి నాడు సంకట హరణ గణపతి పూజ, చంద్రోదయ దర్శనం తర్వాత ఉపవాస విరమణ.",
                    "description_english": "Worship of Lord Ganesha to remove obstacles, followed by Moon sighting.",
                    "region": "ALL",
                })

    # F. Masa Shivaratri (మాస శివరాత్రి - Krishna Chaturdashi at Nishita)
    # Tithi 29 at Nishita Kala (excluded in Magha which is Maha Shivaratri)
    if month_idx != 11:
        w_nish_start, w_nish_end = get_observance_window("nishita", target_date, latitude, longitude, elevation_m, tz)
        ov_nish_today = compute_tithi_overlap_in_window(w_nish_start, w_nish_end, 29)
        if ov_nish_today > 0.0:
            w_nish_yest_start, w_nish_yest_end = get_observance_window("nishita", target_date - timedelta(days=1), latitude, longitude, elevation_m, tz)
            ov_nish_yest = compute_tithi_overlap_in_window(w_nish_yest_start, w_nish_yest_end, 29)
            w_nish_tom_start, w_nish_tom_end = get_observance_window("nishita", target_date + timedelta(days=1), latitude, longitude, elevation_m, tz)
            ov_nish_tom = compute_tithi_overlap_in_window(w_nish_tom_start, w_nish_tom_end, 29)

            if ov_nish_today >= ov_nish_yest and ov_nish_today > ov_nish_tom:
                if not (ov_nish_today == ov_nish_yest and ov_nish_yest > 0.0):
                    observed_festivals.append({
                        "id": "masa_shivaratri",
                        "name_telugu": "మాస శివరాత్రి",
                        "name_english": "Masa Shivaratri",
                        "description_telugu": "ప్రతినెల బహుళ చతుర్దశి నాడు జరుపుకునే శివారాధన పర్వదినం.",
                        "description_english": "Monthly Shiva worship on Krishna Chaturdashi night.",
                        "region": "ALL",
                    })

    return observed_festivals
