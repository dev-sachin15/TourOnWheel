import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class VehicleType(str, enum.Enum):
    two_wheeler = "two_wheeler"
    four_wheeler = "four_wheeler"


class VehicleStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"
    available = "available"
    booked = "booked"
    maintenance = "maintenance"


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    name = Column(String(200), nullable=False)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    color = Column(String(50), nullable=True)
    vehicle_type = Column(Enum(VehicleType), nullable=False)
    seats = Column(Integer, default=4)
    registration_number = Column(String(50), unique=True, nullable=False)

    # Documents
    rc_document_url = Column(String(500), nullable=True)
    pollution_cert_url = Column(String(500), nullable=True)
    insurance_url = Column(String(500), nullable=True)

    # Location
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)

    # Pricing
    owner_expected_price_per_day = Column(Float, nullable=False)
    platform_price_per_day = Column(Float, nullable=True)
    platform_fee_percentage = Column(Float, default=17.5)

    # Vehicle specs
    is_ac = Column(Boolean, default=False)
    max_km_per_day = Column(Integer, default=200)
    average_kmpl = Column(Float, nullable=True)
    fuel_type = Column(String(50), default="petrol")
    transmission = Column(String(20), default="manual")
    description = Column(Text, nullable=True)

    # Images (JSON array of URLs)
    images = Column(JSON, default=list)

    # Status
    status = Column(Enum(VehicleStatus), default=VehicleStatus.pending)
    rejection_reason = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    # Earnings
    total_earnings = Column(Float, default=0.0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="vehicles", foreign_keys=[owner_id])
    bookings = relationship("Booking", back_populates="vehicle")
