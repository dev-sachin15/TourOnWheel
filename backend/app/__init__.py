from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from app.config import settings
from app.database import engine, Base
from app.controllers import auth, users, vehicles, bookings, payments, admin

# Create all tables
Base.metadata.create_all(bind=engine)

# Create upload directories
Path(settings.UPLOAD_DIR).mkdir(exist_ok=True)
for folder in ["profiles", "kyc", "vehicles/docs", "vehicles/images"]:
    (Path(settings.UPLOAD_DIR) / folder).mkdir(parents=True, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="TourOnWheel - Vehicle Rental Platform API",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (uploads)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Routers
API_PREFIX = settings.API_PREFIX
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(vehicles.router, prefix=API_PREFIX)
app.include_router(bookings.router, prefix=API_PREFIX)
app.include_router(payments.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)


@app.get("/")
async def root():
    return {
        "message": "Welcome to TourOnWheel API",
        "version": settings.APP_VERSION,
        "docs": "/api/docs"
    }


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}
