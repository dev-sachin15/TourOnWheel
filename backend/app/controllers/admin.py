from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User, KYCStatus, UserRole
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment
from app.schemas.user import UserOut, AdminKYCReview
from app.schemas.vehicle import VehicleOut, AdminVehicleReview
from app.middleware.auth import require_admin
from app.models.notification import Notification

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/stats")
async def get_admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    total_users = db.query(User).filter(User.role == UserRole.user).count()
    total_owners = db.query(User).filter(User.role == UserRole.owner).count()
    total_vehicles = db.query(Vehicle).count()
    total_bookings = db.query(Booking).count()
    pending_kyc = db.query(User).filter(User.kyc_status == KYCStatus.submitted).count()
    pending_vehicles = db.query(Vehicle).filter(Vehicle.status == VehicleStatus.pending).count()
    active_bookings = db.query(Booking).filter(
        Booking.status.in_([BookingStatus.confirmed, BookingStatus.active])
    ).count()

    total_revenue_result = db.query(Payment).filter(Payment.status == "success").all()
    total_revenue = sum(p.amount for p in total_revenue_result)

    return {
        "total_users": total_users,
        "total_owners": total_owners,
        "total_vehicles": total_vehicles,
        "total_bookings": total_bookings,
        "pending_kyc": pending_kyc,
        "pending_vehicles": pending_vehicles,
        "active_bookings": active_bookings,
        "total_revenue": total_revenue
    }


@router.get("/users")
async def get_all_users(
    role: Optional[str] = Query(None),
    kyc_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    if kyc_status:
        query = query.filter(User.kyc_status == kyc_status)
    return query.order_by(User.created_at.desc()).all()


@router.put("/users/{user_id}/kyc")
async def review_kyc(
    user_id: int,
    review: AdminKYCReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.kyc_status != KYCStatus.submitted:
        raise HTTPException(status_code=400, detail="KYC not pending review")

    user.kyc_status = review.status
    if review.rejection_reason:
        user.kyc_rejection_reason = review.rejection_reason
    user.kyc_reviewed_at = datetime.utcnow()
    db.commit()

    # Notify user
    if review.status == KYCStatus.approved:
        notif = Notification(
            user_id=user.id,
            title="KYC Approved ✅",
            message="Your KYC verification has been approved! You can now book vehicles.",
            notification_type="success"
        )
    else:
        notif = Notification(
            user_id=user.id,
            title="KYC Rejected ❌",
            message=f"Your KYC was rejected. Reason: {review.rejection_reason or 'Please resubmit documents.'}",
            notification_type="error"
        )
    db.add(notif)
    db.commit()

    return {"message": f"KYC {review.status.value} successfully"}


@router.get("/vehicles")
async def get_all_vehicles(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(Vehicle)
    if status:
        query = query.filter(Vehicle.status == status)
    return query.order_by(Vehicle.created_at.desc()).all()


@router.put("/vehicles/{vehicle_id}/status")
async def review_vehicle(
    vehicle_id: int,
    review: AdminVehicleReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    vehicle.status = review.status
    if review.rejection_reason:
        vehicle.rejection_reason = review.rejection_reason
    vehicle.updated_at = datetime.utcnow()
    db.commit()

    # Notify owner
    if review.status == VehicleStatus.approved:
        status_text = "approved"
        notif_type = "success"
        message = f"Your vehicle '{vehicle.name}' has been approved and is now listed!"
        title = "Vehicle Approved ✅"
    else:
        status_text = "rejected"
        notif_type = "error"
        message = f"Your vehicle '{vehicle.name}' was rejected. Reason: {review.rejection_reason or 'Please review documents.'}"
        title = "Vehicle Rejected ❌"

    notif = Notification(
        user_id=vehicle.owner_id,
        title=title,
        message=message,
        notification_type=notif_type
    )
    db.add(notif)
    db.commit()

    return {"message": f"Vehicle {status_text} successfully"}


@router.get("/bookings")
async def get_all_bookings(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    query = db.query(Booking)
    if status:
        query = query.filter(Booking.status == status)
    
    bookings = query.order_by(Booking.created_at.desc()).all()
    for b in bookings:
        b.vehicle_name = b.vehicle.name
        b.user_name = f"{b.user.first_name} {b.user.last_name or ''}"
        b.owner_name = f"{b.vehicle.owner.first_name} {b.vehicle.owner.last_name or ''}"
    
    return bookings


@router.get("/earnings")
async def get_earnings_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    payments = db.query(Payment).filter(Payment.status == "success").all()
    total_revenue = sum(p.amount for p in payments)

    bookings = db.query(Booking).filter(
        Booking.status == BookingStatus.completed
    ).all()
    total_platform_fee = sum(b.platform_fee for b in bookings)
    total_owner_earnings = sum(b.total_price - b.platform_fee for b in bookings)

    breakdown = []
    for p in payments:
        if p.booking:
            breakdown.append({
                "booking_id": p.booking_id,
                "payment_amount": p.amount,
                "platform_fee": p.booking.platform_fee,
                "vehicle_name": p.booking.vehicle.name
            })

    return {
        "total_revenue": total_revenue,
        "total_platform_revenue": total_platform_fee,
        "platform_earnings": total_platform_fee,
        "owner_earnings": total_owner_earnings,
        "total_bookings": len(bookings),
        "average_booking_value": total_revenue / len(bookings) if bookings else 0,
        "breakdown": breakdown
    }
