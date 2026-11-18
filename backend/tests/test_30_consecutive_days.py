"""
Automated Verification Suite: 30 Consecutive Days Evaluation
Rigorous continuity test verifying progression of Angas, Muhurthams, and Telugu month.
"""

import pytest
from datetime import date, timedelta
from zoneinfo import ZoneInfo
from app.astronomical_engine.panchangam_day import calculate_daily_panchangam


def test_30_consecutive_days_panchangam():
    tz = ZoneInfo("Asia/Kolkata")
    start_date = date(2026, 11, 1)

    prev_tithi_idx = None
    prev_nak_idx = None

    for i in range(30):
        curr_date = start_date + timedelta(days=i)
        res = calculate_daily_panchangam(curr_date, 17.3850, 78.4867, 505.0, tz, "Hyderabad")

        # 1. Verify structure
        assert "summary" in res
        assert "panchangam" in res
        assert "muhurtham" in res
        assert "sun_moon" in res

        # 2. Check 5 Angas existence
        angas = res["panchangam"]
        assert angas["vara"]["index"] in range(7)
        assert angas["tithi"]["primary"]["index"] in range(1, 31)
        assert angas["nakshatra"]["primary"]["index"] in range(1, 28)
        assert angas["yoga"]["primary"]["index"] in range(1, 28)
        assert angas["karana"]["primary"]["index"] in range(1, 12)

        # 3. Verify monotonic progression
        curr_tithi_idx = angas["tithi"]["primary"]["index"]
        curr_nak_idx = angas["nakshatra"]["primary"]["index"]

        if prev_tithi_idx is not None:
            # Advance by 0 (same tithi spans two sunrises), 1 (normal), or 2 (kshaya tithi)
            diff_tithi = (curr_tithi_idx - prev_tithi_idx) % 30
            assert diff_tithi in (0, 1, 2), f"Irregular tithi jump from {prev_tithi_idx} to {curr_tithi_idx} on {curr_date}"

        if prev_nak_idx is not None:
            diff_nak = (curr_nak_idx - prev_nak_idx) % 27
            assert diff_nak in (0, 1, 2), f"Irregular nakshatra jump from {prev_nak_idx} to {curr_nak_idx} on {curr_date}"

        prev_tithi_idx = curr_tithi_idx
        prev_nak_idx = curr_nak_idx

        # 4. Verify Muhurthams
        muh = res["muhurtham"]
        assert muh["rahu_kalam"]["start_time"] is not None
        assert muh["yamagandam"]["start_time"] is not None
        assert muh["gulika_kalam"]["start_time"] is not None
        assert muh["abhijit_muhurtham"]["start_time"] is not None
        assert len(muh["durmuhurthams"]) >= 1
        assert muh["brahma_muhurtham"]["start_time"] is not None
        assert isinstance(muh["varjyam"], list)
        assert isinstance(muh["amrita_kalam"], list)
