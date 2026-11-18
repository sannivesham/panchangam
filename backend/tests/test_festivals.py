"""
Automated Verification Suite: Festival Rules, Observances, and Single-Day Exclusivity
Validates classical Dharmashastra Vyapti rules, Samvatsara determination, and edge cases.
"""

import pytest
from datetime import date, timedelta
from zoneinfo import ZoneInfo
from app.astronomical_engine.panchangam_day import calculate_daily_panchangam
from app.festivals.engine import evaluate_festivals_for_date


def get_festival_ids_for_date(target_date: date, tz: ZoneInfo):
    panch = calculate_daily_panchangam(target_date, 17.3850, 78.4867, 505.0, tz)
    festivals = evaluate_festivals_for_date(panch, tz)
    return [f["id"] for f in festivals], panch


def test_major_festivals_single_day_exclusivity():
    """
    Asserts that major festivals appear on their canonical observance day
    and are strictly absent on immediately preceding and succeeding days.
    """
    tz = ZoneInfo("Asia/Kolkata")

    # List of (Festival ID, Expected Canonical Date)
    festivals_to_verify = [
        ("ugadi", date(2024, 4, 9)),
        ("sri_rama_navami", date(2024, 4, 17)),
        ("vinayaka_chavithi", date(2024, 9, 7)),
        ("maha_shivaratri", date(2025, 2, 26)),
        ("makara_sankranti", date(2025, 1, 14)),
        ("deepavali_lakshmi_puja", date(2026, 11, 8)),
        ("karthika_purnima", date(2026, 11, 24)),
        ("holi_kamadahana", date(2026, 3, 2)),
        ("ksheerabdhi_dwadashi", date(2026, 11, 21)),
    ]

    for fest_id, canonical_date in festivals_to_verify:
        # Check canonical day
        ids_today, panch_today = get_festival_ids_for_date(canonical_date, tz)
        assert fest_id in ids_today, f"{fest_id} should be present on {canonical_date}, found: {ids_today}"

        # Check yesterday (must be strictly absent)
        ids_yest, _ = get_festival_ids_for_date(canonical_date - timedelta(days=1), tz)
        assert fest_id not in ids_yest, f"{fest_id} erroneously appeared on previous day {canonical_date - timedelta(days=1)}"

        # Check tomorrow (must be strictly absent)
        ids_tom, _ = get_festival_ids_for_date(canonical_date + timedelta(days=1), tz)
        assert fest_id not in ids_tom, f"{fest_id} erroneously appeared on next day {canonical_date + timedelta(days=1)}"


def test_december_pushya_samvatsara():
    """
    Bug 1 Verification:
    In December, Pushya Masam belongs to the CURRENT Telugu year, not the previous Gregorian year.
    December 2026 Pushya must return 'Parabhava' (not 'Vishvavasu').
    """
    tz = ZoneInfo("Asia/Kolkata")
    # In December 2026, dates during Pushya Masam
    panch_dec = calculate_daily_panchangam(date(2026, 12, 20), 17.3850, 78.4867, 505.0, tz)
    samvatsara = panch_dec["telugu_calendar"]["samvatsaram"]
    assert samvatsara["name_english"] == "Parabhava"
    assert samvatsara["name_telugu"] == "పరాభవ"

    # In January 2027 (before Ugadi 2027), Pushya/Magha must still be 'Parabhava'
    panch_jan = calculate_daily_panchangam(date(2027, 1, 15), 17.3850, 78.4867, 505.0, tz)
    samvatsara_jan = panch_jan["telugu_calendar"]["samvatsaram"]
    assert samvatsara_jan["name_english"] == "Parabhava"


def test_sankranti_post_sunset_rollover():
    """
    Solar Ingress Verification:
    In 2027, Sun enters Makara on Jan 14 at ~20:00 IST (after sunset).
    Under Dharma Sindhu, the observance moves to Jan 15.
    Bhogi moves to Jan 14, Kanuma to Jan 16, Mukkanuma to Jan 17.
    """
    tz = ZoneInfo("Asia/Kolkata")

    ids_14, _ = get_festival_ids_for_date(date(2027, 1, 14), tz)
    ids_15, _ = get_festival_ids_for_date(date(2027, 1, 15), tz)
    ids_16, _ = get_festival_ids_for_date(date(2027, 1, 16), tz)
    ids_17, _ = get_festival_ids_for_date(date(2027, 1, 17), tz)

    assert "bhogi" in ids_14
    assert "makara_sankranti" not in ids_14

    assert "makara_sankranti" in ids_15
    assert "bhogi" not in ids_15

    assert "kanuma" in ids_16
    assert "mukkanuma" in ids_17


def test_varalakshmi_vratam_friday_preceding_purnima():
    """
    Varalakshmi Vratam Verification:
    In August 2026, Shravana Purnima is on Friday, August 28, 2026.
    Varalakshmi Vratam is observed on Friday, August 21, 2026.
    """
    tz = ZoneInfo("Asia/Kolkata")

    ids_21, _ = get_festival_ids_for_date(date(2026, 8, 21), tz)
    ids_28, _ = get_festival_ids_for_date(date(2026, 8, 28), tz)

    assert "varalakshmi_vratam" in ids_21
    assert "varalakshmi_vratam" not in ids_28


def test_sankashtahara_chaturthi_at_moonrise():
    """
    Sankashtahara Chaturthi Verification:
    In November 2026, Krishna Chaturthi prevails at moonrise on Nov 27.
    Nov 27 is observed; Nov 28 is absent.
    """
    tz = ZoneInfo("Asia/Kolkata")

    ids_27, _ = get_festival_ids_for_date(date(2026, 11, 27), tz)
    ids_28, _ = get_festival_ids_for_date(date(2026, 11, 28), tz)

    assert "sankashti_chaturthi" in ids_27
    assert "sankashti_chaturthi" not in ids_28


def test_no_generic_purnima_when_specific_purnima_present():
    """
    Deduplication Verification:
    When Holi / Hanuman Jayanti / Karthika Purnima is present,
    generic 'Purnima (Satyanarayana Swamy Vratam)' must not duplicate.
    """
    tz = ZoneInfo("Asia/Kolkata")

    # Holi 2026 (March 2, 2026)
    ids_holi, _ = get_festival_ids_for_date(date(2026, 3, 2), tz)
    assert "holi_kamadahana" in ids_holi
    assert "purnima_vratam" not in ids_holi

    # Karthika Purnima 2026 (Nov 24, 2026)
    ids_kp, _ = get_festival_ids_for_date(date(2026, 11, 24), tz)
    assert "karthika_purnima" in ids_kp
    assert "purnima_vratam" not in ids_kp
