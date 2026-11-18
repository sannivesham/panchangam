"""
Telugu Panchangam & Calendar FastAPI Application Entrypoint
Unified production server: High-precision astronomical API + Built-in React SPA.
"""

import os
from pathlib import Path
os.environ["DISABLE_SQLALCHEMY_CEXT"] = "1"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .api.routes_panchangam import router as panchangam_router
from .api.routes_festivals import router as festivals_router
from .api.routes_locations import router as locations_router

app = FastAPI(
    title="Telugu Panchangam & Calendar API (తెలుగు పంచాంగం API)",
    description=(
        "Production-quality, high-precision astronomical Telugu Calendar and Panchangam API. "
        "Built on Swiss Ephemeris 2.10.03 (NASA JPL DE431 data), Chitrapaksha/Lahiri Ayanamsa, "
        "and traditional Amanta lunisolar principles."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(panchangam_router)
app.include_router(festivals_router)
app.include_router(locations_router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "engine": "Swiss Ephemeris 2.10.03 (JPL DE431)",
        "ayanamsa": "Lahiri / Chitrapaksha",
        "system": "Telugu Amanta Lunisolar",
    }


# Frontend SPA static mounting if dist folder exists
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"

if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        file_path = frontend_dist / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/", tags=["Root"])
    def root():
        return {
            "title": "Telugu Panchangam & Calendar Engine (తెలుగు పంచాంగం & క్యాలెండర్)",
            "docs": "/docs",
            "endpoints": {
                "daily_panchangam": "/api/panchangam/daily",
                "monthly_panchangam": "/api/panchangam/monthly",
                "yearly_overview": "/api/panchangam/yearly",
                "transitions": "/api/panchangam/transitions",
                "sunrise_sunset": "/api/panchangam/sunrise-sunset",
                "muhurtham": "/api/panchangam/muhurtham",
                "festivals": "/api/festivals",
                "locations": "/api/locations/search",
            },
        }
