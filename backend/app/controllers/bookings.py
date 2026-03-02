from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.models.user import User, KYCStatus
from app.models.vehicle import Vehicle, VehicleStatus
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.schemas.booking import BookingCreate, BookingOut
from app.utils.pricing import calculate_booking_total
from app.middleware.auth import get_current_user
from app.models.notification import Notification

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("", response_model=BookingOut, status_code=201)
async def create_booking(
    booking_data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # KYC check
    if current_user.kyc_status != KYCStatus.approved:
        raise HTTPException(
            status_code=400,
            detail="KYC verification required before booking. Please upload your documents."
        )

    vehicle = db.query(Vehicle).filter(
        Vehicle.id == booking_data.vehicle_id,
        Vehicle.is_active == True
    ).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    if vehicle.status not in [VehicleStatus.approved, VehicleStatus.available]:
        raise HTTPException(status_code=400, detail="Vehicle is not available for booking")

    if vehicle.owner_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot book your own vehicle")

    from_date = booking_data.from_date
    to_date = booking_data.to_date

    if from_date >= to_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")

    if from_date < date.today():
        raise HTTPException(status_code=400, detail="From date cannot be in the past")

    # Check for date conflicts
    conflict = db.query(Booking).filter(
        Booking.vehicle_id == vehicle.id,
        Booking.status.in_([BookingStatus.confirmed, BookingStatus.active, BookingStatus.pending_approval]),
        Booking.from_date <= to_date,
        Booking.to_date >= from_date
    ).first()
    if conflict:
        raise HTTPException(status_code=400, detail="Vehicle is already booked for the selected dates")

    total_days = (to_date - from_date).days
    pricing = calculate_booking_total(
        vehicle.platform_price_per_day,
        total_days,
        vehicle.platform_fee_percentage
    )

    booking = Booking(
        user_id=current_user.id,
        vehicle_id=vehicle.id,
        from_date=from_date,
        to_date=to_date,
        total_days=total_days,
        base_price=pricing["base_price"],
        platform_fee=pricing["platform_fee"],
        total_price=pricing["total_price"],
        status=BookingStatus.pending_payment
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("", response_model=List[BookingOut])
async def get_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bookings = db.query(Booking).filter(
        Booking.user_id == current_user.id
    ).order_by(Booking.created_at.desc()).all()
    for b in bookings:
        b.vehicle_name = b.vehicle.name
        b.user_name = f"{b.user.first_name} {b.user.last_name or ''}"
        b.owner_name = f"{b.vehicle.owner.first_name} {b.vehicle.owner.last_name or ''}"
    return bookings


@router.get("/owner-bookings", response_model=List[BookingOut])
async def get_owner_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle_ids = [v.id for v in current_user.vehicles]
    bookings = db.query(Booking).filter(
        Booking.vehicle_id.in_(vehicle_ids)
    ).order_by(Booking.created_at.desc()).all()
    for b in bookings:
        b.vehicle_name = b.vehicle.name
        b.user_name = f"{b.user.first_name} {b.user.last_name or ''}"
        b.owner_name = f"{b.vehicle.owner.first_name} {b.vehicle.owner.last_name or ''}"
    return bookings


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id and booking.vehicle.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    booking.vehicle_name = booking.vehicle.name
    booking.user_name = f"{booking.user.first_name} {booking.user.last_name or ''}"
    booking.owner_name = f"{booking.vehicle.owner.first_name} {booking.vehicle.owner.last_name or ''}"
    return booking


@router.put("/{booking_id}/pickup")
async def mark_pickup(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.confirmed:
        raise HTTPException(status_code=400, detail="Booking must be confirmed before pickup")

    booking.is_picked_up = True
    booking.pickup_time = datetime.utcnow()
    booking.status = BookingStatus.active

    # Notify owner
    vehicle = booking.vehicle
    notif = Notification(
        user_id=vehicle.owner_id,
        title="Vehicle Picked Up",
        message=f"User {current_user.first_name} has picked up your vehicle '{vehicle.name}'.",
        notification_type="info"
    )
    db.add(notif)
    db.commit()
    return {"message": "Pickup confirmed"}


@router.put("/{booking_id}/return")
async def mark_return(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    vehicle = booking.vehicle
    if vehicle.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only vehicle owner can mark as returned")

    if booking.status != BookingStatus.active:
        raise HTTPException(status_code=400, detail="Booking must be active to mark return")

    booking.is_returned = True
    booking.return_time = datetime.utcnow()
    booking.status = BookingStatus.completed

    # Make vehicle available again
    vehicle.status = VehicleStatus.available

    # Calculate earnings
    owner_earning = booking.base_price - booking.platform_fee
    vehicle.total_earnings += owner_earning
    owner = vehicle.owner
    owner.total_earnings += owner_earning

    # Notify user
    notif = Notification(
        user_id=booking.user_id,
        title="Vehicle Returned",
        message=f"Your vehicle '{vehicle.name}' has been marked as returned. Trip completed!",
        notification_type="success"
    )
    db.add(notif)
    db.commit()
    return {"message": "Return confirmed. Vehicle is now available."}


@router.put("/{booking_id}/cancel")
async def cancel_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(
        Booking.id == booking_id,
        Booking.user_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status in [BookingStatus.active, BookingStatus.completed]:
        raise HTTPException(status_code=400, detail="Cannot cancel an active or completed booking")

    booking.status = BookingStatus.cancelled
    db.commit()
    return {"message": "Booking cancelled"}
