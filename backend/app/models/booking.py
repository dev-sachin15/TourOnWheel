import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Float, ForeignKey, Date, Text
from sqlalchemy.orm import relationship
from app.database import Base


class BookingStatus(str, enum.Enum):
    pending_payment = "pending_payment"
    pending_approval = "pending_approval"
    confirmed = "confirmed"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"
    rejected = "rejected"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"), nullable=False)

    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    total_days = Column(Integer, nullable=False)

    base_price = Column(Float, nullable=False)
    platform_fee = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)

    status = Column(Enum(BookingStatus), default=BookingStatus.pending_payment)

    # Pickup / Return
    is_picked_up = Column(Boolean, default=False)
    pickup_time = Column(DateTime, nullable=True)
    pickup_lat = Column(Float, nullable=True)
    pickup_lng = Column(Float, nullable=True)

    is_returned = Column(Boolean, default=False)
    return_time = Column(DateTime, nullable=True)

    cancellation_reason = Column(Text, nullable=True)

    payment_id = Column(String(200), nullable=True)
    payment_order_id = Column(String(200), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bookings", foreign_keys=[user_id])
    vehicle = relationship("Vehicle", back_populates="bookings")
    payment = relationship("Payment", back_populates="booking", uselist=False)
