from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from app.models.vehicle import VehicleType, VehicleStatus


class VehicleCreate(BaseModel):
    name: str
    brand: str
    model: str
    year: int
    color: Optional[str] = None
    vehicle_type: VehicleType
    seats: int = 4
    registration_number: str
    owner_expected_price_per_day: float
    is_ac: bool = False
    max_km_per_day: int = 200
    average_kmpl: Optional[float] = None
    fuel_type: str = "petrol"
    transmission: str = "manual"
    description: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None


class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    owner_expected_price_per_day: Optional[float] = None
    is_ac: Optional[bool] = None
    max_km_per_day: Optional[int] = None
    average_kmpl: Optional[float] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    description: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None


class VehicleOwnerOut(BaseModel):
    id: int
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True


class VehicleOut(BaseModel):
    id: int
    owner_id: int
    owner: Optional[VehicleOwnerOut] = None
    name: str
    brand: str
    model: str
    year: int
    color: Optional[str] = None
    vehicle_type: VehicleType
    seats: int
    registration_number: str
    owner_expected_price_per_day: float
    platform_price_per_day: Optional[float] = None
    platform_fee_percentage: float
    is_ac: bool
    max_km_per_day: int
    average_kmpl: Optional[float] = None
    fuel_type: str
    transmission: str
    description: Optional[str] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None
    rc_document_url: Optional[str] = None
    pollution_cert_url: Optional[str] = None
    insurance_url: Optional[str] = None
    images: List[str] = []
    status: VehicleStatus
    rejection_reason: Optional[str] = None
    is_active: bool
    total_earnings: float
    created_at: datetime

    class Config:
        from_attributes = True


class VehicleSearch(BaseModel):
    lat: Optional[float] = None
    lng: Optional[float] = None
    vehicle_type: Optional[VehicleType] = None
    from_date: Optional[str] = None
    to_date: Optional[str] = None
    city: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    is_ac: Optional[bool] = None


class AdminVehicleReview(BaseModel):
    status: VehicleStatus  # approved or rejected
    rejection_reason: Optional[str] = None
