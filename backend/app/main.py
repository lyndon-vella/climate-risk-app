from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import elevation, geocode, risk

app = FastAPI(
    title="Climate Risk Assessment API",
    description="API for assessing property flood risk from sea level rise",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(elevation.router, prefix="/api", tags=["elevation"])
app.include_router(geocode.router, prefix="/api", tags=["geocode"])
app.include_router(risk.router, prefix="/api", tags=["risk"])


@app.get("/")
async def root():
    return {
        "message": "Climate Risk Assessment API",
        "docs": "/docs",
        "endpoints": {
            "elevation": "/api/elevation?lat={lat}&lng={lng}",
            "geocode": "/api/geocode?address={address}",
            "risk": "/api/risk?lat={lat}&lng={lng}&sea_level_rise={meters}"
        }
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
