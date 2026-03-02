from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import UserRole, KYCStatus


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    role: UserRole = UserRole.user


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserOut"


class TokenRefresh(BaseModel):
    refresh_token: str


class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_account_holder_name: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    role: UserRole
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profile_photo: Optional[str] = None
    kyc_status: KYCStatus
    driving_license_url: Optional[str] = None
    id_card_url: Optional[str] = None
    kyc_rejection_reason: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_account_holder_name: Optional[str] = None
    total_earnings: float = 0.0
    pending_earnings: float = 0.0
    is_active: bool
    is_profile_complete: bool
    created_at: datetime

    class Config:
        from_attributes = True


class KYCSubmit(BaseModel):
    pass  # Files uploaded via form-data


class AdminKYCReview(BaseModel):
    status: KYCStatus  # approved or rejected
    rejection_reason: Optional[str] = None
