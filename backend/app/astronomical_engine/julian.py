"""
Julian Day and Timezone Conversion Utilities
High-precision timestamp conversion with ZoneInfo support and Telugu period formatting.
"""

from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Tuple, Optional
from .swe_wrapper import SwissEphemeris, SE_GREG_CAL


def datetime_to_jd(dt: datetime) -> float:
    """Convert an aware or naive datetime to Julian Day UT."""
    swe = SwissEphemeris.get_instance()
    if dt.tzinfo is not None:
        dt_utc = dt.astimezone(timezone.utc)
    else:
        dt_utc = dt

    hour_fraction = dt_utc.hour + dt_utc.minute / 60.0 + (dt_utc.second + dt_utc.microsecond / 1_000_000.0) / 3600.0
    return swe.julday(dt_utc.year, dt_utc.month, dt_utc.day, hour_fraction, SE_GREG_CAL)


def jd_to_datetime(jd: float, tz: ZoneInfo = ZoneInfo("Asia/Kolkata")) -> datetime:
    """Convert Julian Day UT to a timezone-aware datetime."""
    swe = SwissEphemeris.get_instance()
    year, month, day, hour_float = swe.revjul(jd, SE_GREG_CAL)

    hour = int(hour_float)
    minute_float = (hour_float - hour) * 60.0
    minute = int(minute_float)
    second_float = (minute_float - minute) * 60.0
    second = int(second_float)
    microsecond = int(round((second_float - second) * 1_000_000.0))

    if microsecond >= 1_000_000:
        second += 1
        microsecond -= 1_000_000
    if second >= 60:
        minute += 1
        second -= 60
    if minute >= 60:
        hour += 1
        minute -= 60

    dt_utc = datetime(year, month, day, hour, minute, second, microsecond, tzinfo=timezone.utc)
    return dt_utc.astimezone(tz)


def format_telugu_time(dt: datetime, lang: str = "te") -> str:
    """
    Format time with appropriate traditional Telugu period indicator.
    Early morning: తెల్లవారుజామున (03:00 - 05:59)
    Morning: ఉదయం (06:00 - 11:59)
    Afternoon: మధ్యాహ్నం (12:00 - 16:59)
    Evening: సాయంత్రం (17:00 - 19:59)
    Night: రాత్రి (20:00 - 02:59)
    """
    hour_12 = dt.hour % 12
    if hour_12 == 0:
        hour_12 = 12
    am_pm = "AM" if dt.hour < 12 else "PM"
    time_str = f"{hour_12:02d}:{dt.minute:02d} {am_pm}"

    if lang == "en":
        return time_str

    h = dt.hour
    if 3 <= h < 6:
        period = "తెల్లవారుజామున"
    elif 6 <= h < 12:
        period = "ఉదయం"
    elif 12 <= h < 17:
        period = "మధ్యాహ్నం"
    elif 17 <= h < 20:
        period = "సాయంత్రం"
    else:
        period = "రాత్రి"

    return f"{period} {time_str}"
