from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from app.database import get_db
from app.models.user import User, UserRole, KYCStatus
from app.models.vehicle import Vehicle, VehicleStatus, VehicleType
from app.models.booking import Booking, BookingStatus
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleOut, AdminVehicleReview
from app.utils.files import save_upload_file
from app.utils.pricing import calculate_platform_price, haversine_distance
from app.middleware.auth import get_current_user, require_admin, require_owner_or_admin
from app.models.notification import Notification

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])


@router.get("", response_model=List[VehicleOut])
async def search_vehicles(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    vehicle_type: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    is_ac: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle).filter(
        Vehicle.status.in_([VehicleStatus.approved, VehicleStatus.available]),
        Vehicle.is_active == True
    )

    if vehicle_type:
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    if city:
        query = query.filter(Vehicle.city.ilike(f"%{city}%"))
    if min_price:
        query = query.filter(Vehicle.platform_price_per_day >= min_price)
    if max_price:
        query = query.filter(Vehicle.platform_price_per_day <= max_price)
    if is_ac is not None:
        query = query.filter(Vehicle.is_ac == is_ac)

    # Filter out booked vehicles for the given date range
    if from_date and to_date:
        try:
            fd = date.fromisoformat(from_date)
            td = date.fromisoformat(to_date)
            booked_vehicle_ids = db.query(Booking.vehicle_id).filter(
                Booking.status.in_([BookingStatus.confirmed, BookingStatus.active]),
                Booking.from_date <= td,
                Booking.to_date >= fd
            ).subquery()
            query = query.filter(~Vehicle.id.in_(booked_vehicle_ids))
        except ValueError:
            pass

    vehicles = query.all()

    # Sort by distance if GPS provided
    if lat and lng:
        def get_distance(v):
            if v.current_lat and v.current_lng:
                return haversine_distance(lat, lng, v.current_lat, v.current_lng)
            return float('inf')
        vehicles.sort(key=get_distance)

    return vehicles


@router.post("", response_model=VehicleOut, status_code=201)
async def create_vehicle(
    name: str = Form(...),
    brand: str = Form(...),
    model: str = Form(...),
    year: int = Form(...),
    color: Optional[str] = Form(None),
    vehicle_type: str = Form(...),
    seats: int = Form(4),
    registration_number: str = Form(...),
    owner_expected_price_per_day: float = Form(...),
    is_ac: bool = Form(False),
    max_km_per_day: int = Form(200),
    average_kmpl: Optional[float] = Form(None),
    fuel_type: str = Form("petrol"),
    transmission: str = Form("manual"),
    description: Optional[str] = Form(None),
    current_lat: Optional[float] = Form(None),
    current_lng: Optional[float] = Form(None),
    address: Optional[str] = Form(None),
    city: Optional[str] = Form(None),
    pincode: Optional[str] = Form(None),
    rc_document: Optional[UploadFile] = File(None),
    pollution_cert: Optional[UploadFile] = File(None),
    insurance: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in [UserRole.owner, UserRole.admin]:
        raise HTTPException(status_code=403, detail="Only vehicle owners can add vehicles")

    # Check if registration number already exists
    existing = db.query(Vehicle).filter(Vehicle.registration_number == registration_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this registration number already exists")

    platform_price, fee_pct = calculate_platform_price(owner_expected_price_per_day)

    vehicle = Vehicle(
        owner_id=current_user.id,
        name=name,
        brand=brand,
        model=model,
        year=year,
        color=color,
        vehicle_type=vehicle_type,
        seats=seats,
        registration_number=registration_number,
        owner_expected_price_per_day=owner_expected_price_per_day,
        platform_price_per_day=platform_price,
        platform_fee_percentage=fee_pct,
        is_ac=is_ac,
        max_km_per_day=max_km_per_day,
        average_kmpl=average_kmpl,
        fuel_type=fuel_type,
        transmission=transmission,
        description=description,
        current_lat=current_lat,
        current_lng=current_lng,
        address=address,
        city=city,
        pincode=pincode,
        images=[]
    )

    if rc_document:
        vehicle.rc_document_url = await save_upload_file(rc_document, "vehicles/docs")
    if pollution_cert:
        vehicle.pollution_cert_url = await save_upload_file(pollution_cert, "vehicles/docs")
    if insurance:
        vehicle.insurance_url = await save_upload_file(insurance, "vehicles/docs")

    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)

    # Notify admins
    admins = db.query(User).filter(User.role == "admin").all()
    for admin in admins:
        notif = Notification(
            user_id=admin.id,
            title="New Vehicle Submitted",
            message=f"Vehicle '{name}' by {current_user.email} submitted for verification.",
            notification_type="info"
        )
        db.add(notif)
    db.commit()
    db.refresh(vehicle)

    return vehicle


@router.get("/my-vehicles", response_model=List[VehicleOut])
async def get_my_vehicles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Vehicle).filter(Vehicle.owner_id == current_user.id).all()


@router.get("/{vehicle_id}", response_model=VehicleOut)
async def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id, Vehicle.is_active == True).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.put("/{vehicle_id}", response_model=VehicleOut)
async def update_vehicle(
    vehicle_id: int,
    update_data: VehicleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)

    if update_data.owner_expected_price_per_day:
        platform_price, fee_pct = calculate_platform_price(update_data.owner_expected_price_per_day)
        vehicle.platform_price_per_day = platform_price
        vehicle.platform_fee_percentage = fee_pct

    vehicle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.post("/{vehicle_id}/images")
async def upload_vehicle_images(
    vehicle_id: int,
    images: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.owner_id != current_user.id and current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Not authorized")

    saved_images = vehicle.images or []
    for image in images[:5]:  # Max 5 images
        img_path = await save_upload_file(image, "vehicles/images")
        saved_images.append(img_path)

    vehicle.images = saved_images
    vehicle.updated_at = datetime.utcnow()
    db.commit()

    return {"message": f"{len(images)} image(s) uploaded successfully", "images": saved_images}


@router.put("/{vehicle_id}/availability")
async def toggle_availability(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if vehicle.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    if vehicle.status == VehicleStatus.available:
        vehicle.status = VehicleStatus.approved
    elif vehicle.status in [VehicleStatus.approved]:
        vehicle.status = VehicleStatus.available

    db.commit()
    return {"message": "Availability updated", "status": vehicle.status}
