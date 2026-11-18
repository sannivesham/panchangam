"""
Swiss Ephemeris ctypes Binding Layer
Direct, high-performance C ABI binding to official Swiss Ephemeris 64-bit library.
Supports Windows (swedll64.dll), Linux (libswe.so), and macOS (libswe.dylib).
"""

import ctypes
from ctypes import c_double, c_int32, c_char_p, POINTER, byref, create_string_buffer
import os
import sys
from pathlib import Path
from typing import Tuple, Optional

# Constants
SE_JUL_CAL = 0
SE_GREG_CAL = 1

# Celestial Bodies
SE_SUN = 0
SE_MOON = 1
SE_MERCURY = 2
SE_VENUS = 3
SE_MARS = 4
SE_JUPITER = 5
SE_SATURN = 6
SE_URANUS = 7
SE_NEPTUNE = 8
SE_PLUTO = 9
SE_TRUE_NODE = 11  # Rahu (True Node)

# Calculation Flags
SEFLG_JPLEPH = 1
SEFLG_SWIEPH = 2
SEFLG_MOSEPH = 4
SEFLG_HELIO = 8
SEFLG_TRUEPOS = 16
SEFLG_J2000 = 32
SEFLG_NONUT = 64
SEFLG_SPEED3 = 128
SEFLG_SPEED = 256
SEFLG_NOGDEFL = 512
SEFLG_NOABERR = 1024
SEFLG_EQUATORIAL = 2048
SEFLG_XYZ = 4096
SEFLG_RADIANS = 8192
SEFLG_BARYCTR = 16384
SEFLG_TOPOCTR = 32768
SEFLG_SIDEREAL = 64 * 1024  # 65536

# Ayanamsa Modes
SE_SIDM_FAGAN_BRADLEY = 0
SE_SIDM_LAHIRI = 1
SE_SIDM_DELUCE = 2
SE_SIDM_RAMAN = 3
SE_SIDM_USHASHASHI = 4
SE_SIDM_KRISHNAMURTI = 5
SE_SIDM_DJWHAL_KHUL = 6
SE_SIDM_YUKTESHWAR = 7
SE_SIDM_JN_BHASIN = 8
SE_SIDM_TRUE_CHITRA = 27

# Rise / Set Flags
SE_CALC_RISE = 1
SE_CALC_SET = 2
SE_CALC_MTRANSIT = 4
SE_CALC_ITRANSIT = 8
SE_BIT_DISC_CENTER = 256
SE_BIT_NO_REFRACTION = 512
SE_BIT_GEOCTR_NO_ECL_LAT = 128
# True Swiss Ephemeris definition: (SE_BIT_DISC_CENTER | SE_BIT_NO_REFRACTION | SE_BIT_GEOCTR_NO_ECL_LAT) = 896
SE_BIT_HINDU_RISING = 896


class SwissEphemeris:
    """Singleton wrapper for Swiss Ephemeris C DLL / Shared Library."""
    _instance: Optional["SwissEphemeris"] = None

    def __init__(self, dll_path: Optional[str] = None, ephe_path: Optional[str] = None):
        base_dir = Path(__file__).resolve().parent.parent.parent
        if ephe_path is None:
            ephe_path = str(base_dir / "ephemeris_lib" / "ephe")

        if dll_path is None:
            if sys.platform.startswith("win"):
                dll_path = str(base_dir / "ephemeris_lib" / "swedll64.dll")
            elif sys.platform.startswith("darwin"):
                dll_path = str(base_dir / "ephemeris_lib" / "libswe.dylib")
            else:
                dll_path = str(base_dir / "ephemeris_lib" / "libswe.so")

        # Fallback to system library if specific file does not exist
        if not os.path.exists(dll_path):
            try:
                self._dll = ctypes.cdll.LoadLibrary("swe")
            except Exception:
                raise FileNotFoundError(f"Swiss Ephemeris library not found at: {dll_path}")
        else:
            self._dll = ctypes.cdll.LoadLibrary(dll_path)

        self._init_functions()

        if os.path.exists(ephe_path):
            self.set_ephe_path(ephe_path)

        # Default to Lahiri (Chitrapaksha) Ayanamsa
        self.set_sid_mode(SE_SIDM_LAHIRI)

    @classmethod
    def get_instance(cls) -> "SwissEphemeris":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _init_functions(self):
        swe = self._dll

        swe.swe_set_ephe_path.argtypes = [c_char_p]
        swe.swe_set_ephe_path.restype = None

        swe.swe_close.argtypes = []
        swe.swe_close.restype = None

        swe.swe_set_sid_mode.argtypes = [c_int32, c_double, c_double]
        swe.swe_set_sid_mode.restype = None

        swe.swe_get_ayanamsa_ut.argtypes = [c_double]
        swe.swe_get_ayanamsa_ut.restype = c_double

        swe.swe_julday.argtypes = [c_int32, c_int32, c_int32, c_double, c_int32]
        swe.swe_julday.restype = c_double

        swe.swe_revjul.argtypes = [c_double, c_int32, POINTER(c_int32), POINTER(c_int32), POINTER(c_int32), POINTER(c_double)]
        swe.swe_revjul.restype = None

        swe.swe_calc_ut.argtypes = [c_double, c_int32, c_int32, POINTER(c_double), c_char_p]
        swe.swe_calc_ut.restype = c_int32

        swe.swe_rise_trans.argtypes = [c_double, c_int32, c_char_p, c_int32, c_int32, POINTER(c_double), c_double, c_double, POINTER(c_double), c_char_p]
        swe.swe_rise_trans.restype = c_int32

        swe.swe_version.argtypes = [c_char_p]
        swe.swe_version.restype = c_char_p

    def version(self) -> str:
        sver = create_string_buffer(256)
        self._dll.swe_version(sver)
        return sver.value.decode("ascii", errors="ignore")

    def set_ephe_path(self, path: str) -> None:
        self._dll.swe_set_ephe_path(path.encode("utf-8"))

    def set_sid_mode(self, sid_mode: int = SE_SIDM_LAHIRI, t0: float = 0.0, ayan_t0: float = 0.0) -> None:
        self._dll.swe_set_sid_mode(c_int32(sid_mode), c_double(t0), c_double(ayan_t0))

    def get_ayanamsa_ut(self, tjd_ut: float) -> float:
        return float(self._dll.swe_get_ayanamsa_ut(c_double(tjd_ut)))

    def julday(self, year: int, month: int, day: int, hour: float = 0.0, gregflag: int = SE_GREG_CAL) -> float:
        return float(self._dll.swe_julday(c_int32(year), c_int32(month), c_int32(day), c_double(hour), c_int32(gregflag)))

    def revjul(self, jd: float, gregflag: int = SE_GREG_CAL) -> Tuple[int, int, int, float]:
        jy, jm, jd_day = c_int32(), c_int32(), c_int32()
        jhour = c_double()
        self._dll.swe_revjul(c_double(jd), c_int32(gregflag), byref(jy), byref(jm), byref(jd_day), byref(jhour))
        return (int(jy.value), int(jm.value), int(jd_day.value), float(jhour.value))

    def calc_ut(self, tjd_ut: float, ipl: int, iflag: int) -> Tuple[float, float, float, float, float, float]:
        xx = (c_double * 6)()
        serr = create_string_buffer(256)
        ret = self._dll.swe_calc_ut(c_double(tjd_ut), c_int32(ipl), c_int32(iflag), xx, serr)
        if ret < 0:
            err_msg = serr.value.decode("latin1", errors="ignore")
            raise RuntimeError(f"Swiss Ephemeris swe_calc_ut error ({ret}): {err_msg}")
        return (xx[0], xx[1], xx[2], xx[3], xx[4], xx[5])

    def rise_trans(
        self,
        tjd_ut: float,
        ipl: int,
        rsmi: int,
        geopos: Tuple[float, float, float],  # (longitude, latitude, elevation_m)
        atpress: float = 1013.25,
        attemp: float = 15.0,
        epheflag: int = SEFLG_SWIEPH,
    ) -> Optional[float]:
        c_geopos = (c_double * 3)(geopos[0], geopos[1], geopos[2])
        tret = (c_double * 10)()
        serr = create_string_buffer(256)

        ret = self._dll.swe_rise_trans(
            c_double(tjd_ut),
            c_int32(ipl),
            None,
            c_int32(epheflag),
            c_int32(rsmi),
            c_geopos,
            c_double(atpress),
            c_double(attemp),
            tret,
            serr,
        )
        if ret < 0:
            err_msg = serr.value.decode("latin1", errors="ignore")
            if "circumpolar" in err_msg.lower() or "never rises" in err_msg.lower() or "never sets" in err_msg.lower():
                return None
            raise RuntimeError(f"swe_rise_trans failed ({ret}): {err_msg}")
        return float(tret[0])

    def close(self):
        self._dll.swe_close()
