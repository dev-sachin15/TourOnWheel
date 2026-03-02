from typing import Optional, List
from pydantic import BaseModel
from datetime import date, datetime
from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    vehicle_id: int
    from_date: date
    to_date: date


class BookingOut(BaseModel):
    id: int
    user_id: int
    vehicle_id: int
    from_date: date
    to_date: date
    total_days: int
    base_price: float
    platform_fee: float
    total_price: float
    status: BookingStatus
    vehicle_name: Optional[str] = None
    user_name: Optional[str] = None
    owner_name: Optional[str] = None
    is_picked_up: bool
    pickup_time: Optional[datetime] = None
    is_returned: bool
    return_time: Optional[datetime] = None
    payment_id: Optional[str] = None
    payment_order_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BookingWithDetails(BookingOut):
    vehicle: Optional[dict] = None
    user: Optional[dict] = None


class PaymentCreate(BaseModel):
    booking_id: int


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    booking_id: int


class PaymentOut(BaseModel):
    id: int
    booking_id: int
    amount: float
    currency: str
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
