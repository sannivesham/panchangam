# తెలుగు పంచాంగం & క్యాలెండర్ (Telugu Panchangam & Calendar)

A production-grade, scientifically accurate **Telugu Hindu Calendar and Panchangam application** built strictly on classical *Drik Ganita* principles, modern celestial mechanics (Swiss Ephemeris 2.10.03 + NASA JPL DE431 data), Lahiri/Chitrapaksha Ayanamsa, and traditional Amanta lunisolar calendar rules.

Designed as an independent platform with a decoupled Python astronomical engine that can run standalone or integrate seamlessly into **Sannivesham** or any other ecosystem.

---

## Key Features

1. **Daily Panchangam (పంచాంగం):**
   - **తిథి (Tithi):** Exact start, end, and transition times computed via numerical root-finding.
   - **వారం (Vara):** Traditional solar weekday from sunrise to sunrise.
   - **నక్షత్రం (Nakshatram):** Moon's sidereal position with pada division (1 to 4).
   - **యోగం (Yogam):** Sum of solar and lunar sidereal longitudes across 27 yogas.
   - **కరణం (Karanam):** Half-tithi divisions covering all 4 fixed and 7 repeating karanas.
2. **Traditional Amanta Telugu Calendar (అమంత కాలమానం):**
   - 60-year Samvatsara cycle (షష్టి సంవత్సరాలు) from Prabhava to Kshaya.
   - 12 Telugu lunar months (చైత్రము to ఫాల్గుణము).
   - Shukla Paksha and Krishna (Bahula) Paksha.
   - Adhika Masam (అధిక మాసం) and Kshaya Masam (క్షయ మాసం) detection via solar ingress (Sankranti).
   - Uttarayanam / Dakshinayanam and 6 seasonal Ritus (ఋతువులు).
3. **Auspicious & Inauspicious Muhurthams (ముహూర్తాలు & కాలాలు):**
   - **రాహుకాలం (Rahu Kalam), యమగండం (Yamagandam), గుళిక కాలం (Gulika Kalam):** 8-part diurnal divisions adjusted to local sunrise and sunset.
   - **అభిజిత్ ముహూర్తం (Abhijit Muhurtham):** 8th diurnal muhurtha (with Wednesday observance rule).
   - **దుర్ముహూర్తం (Durmuhurtham):** Classical weekday-specific muhurtha slots.
   - **వర్జ్యం (Varjyam) & అమృత కాలం (Amrita Kalam):** 60-ghati Nakshatra tyajya divisions.
   - **బ్రహ్మ ముహూర్తం (Brahma Muhurtham):** 14th nocturnal muhurtha prior to sunrise.
4. **Comprehensive Festival & Religious Calendar (పండుగలు & వ్రతాలు):**
   - Traditional time-of-day observance rules: Sunrise, Madhyahna (Sri Rama Navami, Vinayaka Chavithi), Sayahna (Narasimha Jayanti), Pradosha (Deepavali Lakshmi Puja, Karthika Purnima), Nishita/Midnight (Maha Shivaratri, Sri Krishna Janmashtami), Arunodaya (Naraka Chaturdashi snanam, Ratha Saptami).
   - Full support for both Andhra Pradesh and Telangana regional celebrations (e.g. Bonalu, Bathukamma, Telugu Hanuman Jayanthi).
5. **Location-Based Ephemeris Calculations:**
   - Default: Hyderabad, Telangana, India.
   - Pre-configured database of AP, Telangana, Indian, and international Telugu diaspora cities.
   - Custom latitude, longitude, and elevation support with precise topocentric refraction correction.
6. **Telugu-First Dual Language UI:**
   - Traditional Indian aesthetic: Deep Maroon (`#6B0F1A`), Antique Gold (`#D4AF37`), Ivory (`#FAF6EE`), and Saffron.
   - Toggle seamlessly between Telugu and English.
   - Five complete views: Today / Home, Monthly Grid, Daily Detailed, Festivals Catalog, and Yearly Overview.

---

## Directory Structure

```
telugu-panchangam/
├── backend/
│   ├── ephemeris_lib/
│   │   ├── swedll64.dll           # 64-bit Swiss Ephemeris C library (v2.10.03)
│   │   └── ephe/                  # NASA JPL DE431 compressed ephemeris files
│   │       ├── semo_18.se1        # Moon ephemeris (1800 - 2399 CE)
│   │       └── sepl_18.se1        # Planetary ephemeris (1800 - 2399 CE)
│   ├── app/
│   │   ├── core/                  # Constants (Tithis, Nakshatras, Samvatsaras, etc.)
│   │   ├── astronomical_engine/   # Pure Python, decoupled celestial calculation engine
│   │   │   ├── swe_wrapper.py     # Ctypes wrapper to Swiss Ephemeris
│   │   │   ├── ephemeris.py       # Planetary coordinates & Lahiri Ayanamsa
│   │   │   ├── root_finder.py     # Brent's method root-finder (< 1s precision)
│   │   │   ├── sun_moon_rise.py   # Topocentric refraction-corrected rise/set
│   │   │   ├── five_angas.py      # The 5 Angas calculation and transition detector
│   │   │   ├── muhurtham.py       # Auspicious & inauspicious intervals
│   │   │   ├── telugu_calendar.py # Amanta month, Adhika Masam, 60-year Samvatsara
│   │   │   └── panchangam_day.py  # Orchestrator for Panchangam Day (sunrise-to-sunrise)
│   │   ├── festivals/             # Observance rules and festival matching engine
│   │   ├── locations/             # Curated cities database and search service
│   │   ├── api/                   # FastAPI routes (panchangam, festivals, locations)
│   │   └── main.py                # FastAPI app + static SPA mounting
│   ├── tests/                     # 19 automated tests (ephemeris, transitions, festivals, etc.)
│   └── requirements.txt
├── frontend/                      # React 19 + TypeScript + Vite responsive web app
│   ├── src/
│   │   ├── api/                   # Typed API client
│   │   ├── components/            # Header, LocationModal, HomeToday, Monthly, Daily, Festivals, Yearly
│   │   ├── styles/theme.css       # Traditional Telugu royal aesthetic
│   │   └── types/                 # TypeScript interfaces
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

---

## Quick Start & Running

### 1. Start the Backend API Server
```powershell
# Set PYTHONPATH to the backend folder
$env:PYTHONPATH = "C:\Users\Damayanti Crest\.gemini\antigravity\scratch\telugu-panchangam\backend"

# Run FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2. Run the Frontend Development Server (Optional)
Because `frontend/dist` is pre-built, accessing `http://localhost:8000` already serves the complete Telugu Panchangam application!

To run the live Vite development server with hot module replacement:
```powershell
cd frontend
npm run dev
```
Open `http://localhost:5173`.

---

## Automated Verification Suite

Run all 19 automated tests covering precision ephemeris, root-finding boundary crossings, 30 consecutive days continuity, and canonical festival dates:

```powershell
$env:PYTHONPATH = "C:\Users\Damayanti Crest\.gemini\antigravity\scratch\telugu-panchangam\backend"
python -m pytest "C:\Users\Damayanti Crest\.gemini\antigravity\scratch\telugu-panchangam\backend\tests" -v
```

All 19 tests pass in under 1 second:
- `test_ephemeris_precision.py`: Verifies Lahiri Ayanamsa against certified standards ($\pm 0.036''$) and planetary motion bounds.
- `test_transitions_root_finder.py`: Verifies boundary transition root convergence to $< 10^{-6}$ degrees ($< 1$ second precision).
- `test_sunrise_sunset.py`: Verifies topocentric solar rise/set and Dinamana conservation.
- `test_30_consecutive_days.py`: Verifies 30 consecutive days of continuous tithi, nakshatra, and muhurtham calculations without skips or errors.
- `test_festivals.py`: Verifies canonical festival rules (Ugadi, Sri Rama Navami, Vinayaka Chavithi, Deepavali, Makara Sankranti, Maha Shivaratri).
- `test_api_endpoints.py`: Verifies all REST API routes and data schemas.

---

## Sannivesham Integration Guide

The calculation engine in `backend/app/astronomical_engine` is completely decoupled from web frameworks:
1. **Direct Python Import:**
   ```python
   from app.astronomical_engine.panchangam_day import calculate_daily_panchangam
   from datetime import date

   data = calculate_daily_panchangam(date.today(), latitude=17.3850, longitude=78.4867)
   print(data["summary"]["telugu"])
   ```
2. **REST API Microservice:**
   Query `http://localhost:8000/api/panchangam/daily?city_id=hyderabad` from any backend service in Sannivesham.
