import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum, Text, Float
from sqlalchemy.orm import relationship
from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    owner = "owner"
    user = "user"


class KYCStatus(str, enum.Enum):
    not_submitted = "not_submitted"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user, nullable=False)

    first_name = Column(String(100), nullable=True)
    last_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    profile_photo = Column(String(500), nullable=True)

    # KYC fields
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.not_submitted)
    driving_license_url = Column(String(500), nullable=True)
    id_card_url = Column(String(500), nullable=True)
    kyc_rejection_reason = Column(Text, nullable=True)
    kyc_submitted_at = Column(DateTime, nullable=True)
    kyc_reviewed_at = Column(DateTime, nullable=True)

    # For vehicle owners
    bank_account_number = Column(String(50), nullable=True)
    bank_ifsc_code = Column(String(20), nullable=True)
    bank_account_holder_name = Column(String(200), nullable=True)
    total_earnings = Column(Float, default=0.0)
    pending_earnings = Column(Float, default=0.0)

    is_active = Column(Boolean, default=True)
    is_profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    vehicles = relationship("Vehicle", back_populates="owner", foreign_keys="Vehicle.owner_id")
    bookings = relationship("Booking", back_populates="user", foreign_keys="Booking.user_id")
    notifications = relationship("Notification", back_populates="user")
