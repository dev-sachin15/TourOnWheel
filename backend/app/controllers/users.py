from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User, KYCStatus
from app.schemas.user import UserOut, ProfileUpdate, AdminKYCReview
from app.utils.files import save_upload_file
from app.middleware.auth import get_current_user, require_admin
from app.models.notification import Notification

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/profile", response_model=UserOut)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserOut)
async def update_profile(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    date_of_birth: Optional[str] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    pincode: Optional[str] = Form(None),
    bank_account_number: Optional[str] = Form(None),
    bank_ifsc_code: Optional[str] = Form(None),
    bank_account_holder_name: Optional[str] = Form(None),
    profile_photo: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_fields = {
        "first_name": first_name,
        "last_name": last_name,
        "phone": phone,
        "date_of_birth": date_of_birth,
        "address": address,
        "city": city,
        "state": state,
        "pincode": pincode,
        "bank_account_number": bank_account_number,
        "bank_ifsc_code": bank_ifsc_code,
        "bank_account_holder_name": bank_account_holder_name,
    }

    for field, value in update_fields.items():
        if value is not None:
            setattr(current_user, field, value)

    if profile_photo:
        photo_path = await save_upload_file(profile_photo, "profiles")
        current_user.profile_photo = photo_path

    # Check if profile is complete
    if all([current_user.first_name, current_user.last_name, current_user.phone]):
        current_user.is_profile_complete = True

    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/kyc")
async def submit_kyc(
    driving_license: UploadFile = File(...),
    id_card: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.kyc_status == KYCStatus.approved:
        raise HTTPException(status_code=400, detail="KYC already approved")

    dl_path = await save_upload_file(driving_license, "kyc")
    id_path = await save_upload_file(id_card, "kyc")

    current_user.driving_license_url = dl_path
    current_user.id_card_url = id_path
    current_user.kyc_status = KYCStatus.submitted
    current_user.kyc_submitted_at = datetime.utcnow()
    current_user.updated_at = datetime.utcnow()

    db.commit()

    # Notify admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            title="New KYC Submission",
            message=f"User {current_user.email} has submitted KYC documents for review.",
            notification_type="info"
        )
        db.add(notif)
    db.commit()

    return {"message": "KYC submitted successfully. Awaiting admin review."}


@router.get("/notifications")
async def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.created_at.desc()).limit(50).all()
    return notifications


@router.put("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    notif = db.query(Notification).filter(
        Notification.id == notif_id,
        Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Notification marked as read"}


@router.get("/earnings")
async def get_earnings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return {
        "total_earnings": current_user.total_earnings,
        "pending_earnings": current_user.pending_earnings
    }
