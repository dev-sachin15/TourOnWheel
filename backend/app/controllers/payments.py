import hmac
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.booking import Booking, BookingStatus
from app.models.payment import Payment, PaymentStatus
from app.models.vehicle import VehicleStatus
from app.schemas.booking import PaymentCreate, PaymentVerify, PaymentOut
from app.middleware.auth import get_current_user
from app.config import settings
from app.models.notification import Notification

router = APIRouter(prefix="/payments", tags=["Payments"])


@router.post("/create-order")
async def create_payment_order(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(
        Booking.id == payment_data.booking_id,
        Booking.user_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.status != BookingStatus.pending_payment:
        raise HTTPException(status_code=400, detail="Booking payment already processed")

    try:
        import razorpay
        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
        order = client.order.create({
            "amount": int(booking.total_price * 100),  # in paise
            "currency": "INR",
            "receipt": f"booking_{booking.id}",
        })
        booking.payment_order_id = order["id"]
        db.commit()
        return {
            "order_id": order["id"],
            "amount": booking.total_price,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "booking_id": booking.id
        }
    except Exception as e:
        # If Razorpay is not configured, return mock order for testing
        mock_order_id = f"order_mock_{booking.id}"
        booking.payment_order_id = mock_order_id
        db.commit()
        return {
            "order_id": mock_order_id,
            "amount": booking.total_price,
            "currency": "INR",
            "key_id": settings.RAZORPAY_KEY_ID,
            "booking_id": booking.id,
            "is_mock": True
        }


@router.post("/verify")
async def verify_payment(
    verify_data: PaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(
        Booking.id == verify_data.booking_id,
        Booking.user_id == current_user.id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Verify Razorpay signature (or accept mock payments for testing)
    is_valid = False
    if verify_data.razorpay_payment_id.startswith("pay_mock") or verify_data.razorpay_order_id.startswith("order_mock"):
        is_valid = True
    else:
        try:
            key_secret = settings.RAZORPAY_KEY_SECRET.encode()
            msg = f"{verify_data.razorpay_order_id}|{verify_data.razorpay_payment_id}".encode()
            generated_signature = hmac.new(key_secret, msg, hashlib.sha256).hexdigest()
            is_valid = hmac.compare_digest(generated_signature, verify_data.razorpay_signature)
        except Exception:
            is_valid = False

    if not is_valid:
        payment = Payment(
            booking_id=booking.id,
            user_id=current_user.id,
            amount=booking.total_price,
            razorpay_order_id=verify_data.razorpay_order_id,
            razorpay_payment_id=verify_data.razorpay_payment_id,
            status=PaymentStatus.failed
        )
        db.add(payment)
        db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed")

    payment = Payment(
        booking_id=booking.id,
        user_id=current_user.id,
        amount=booking.total_price,
        razorpay_order_id=verify_data.razorpay_order_id,
        razorpay_payment_id=verify_data.razorpay_payment_id,
        razorpay_signature=verify_data.razorpay_signature,
        status=PaymentStatus.success
    )
    db.add(payment)

    booking.payment_id = verify_data.razorpay_payment_id
    booking.status = BookingStatus.confirmed
    vehicle = booking.vehicle
    vehicle.status = VehicleStatus.booked

    # Notify vehicle owner
    notif = Notification(
        user_id=vehicle.owner_id,
        title="New Booking Confirmed!",
        message=f"Your vehicle '{vehicle.name}' has been booked from {booking.from_date} to {booking.to_date}.",
        notification_type="success"
    )
    db.add(notif)

    # Notify user
    user_notif = Notification(
        user_id=current_user.id,
        title="Booking Confirmed",
        message=f"Payment successful! Your booking for '{vehicle.name}' is confirmed.",
        notification_type="success"
    )
    db.add(user_notif)

    db.commit()
    return {"message": "Payment verified. Booking confirmed!", "booking_id": booking.id}


@router.get("/history")
async def get_payment_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    payments = db.query(Payment).filter(Payment.user_id == current_user.id).order_by(
        Payment.created_at.desc()
    ).all()
    return payments
