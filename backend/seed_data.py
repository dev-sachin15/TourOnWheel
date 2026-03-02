from datetime import datetime
from sqlalchemy.orm import Session
from app.database import engine, Base, SessionLocal
from app.models.user import User, UserRole, KYCStatus
from app.models.vehicle import Vehicle, VehicleType, VehicleStatus
from app.utils.auth import get_password_hash

def seed_data():
    # Make sure tables exist
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    try:
        # Check if users already exist
        if db.query(User).filter(User.email == "admin@touronwheel.in").first():
            print("Database already has dummy data. Skipping seed.")
            return

        print("Seeding Users...")
        admin_user = User(
            email="admin@touronwheel.in",
            password_hash=get_password_hash("admin123"),
            role=UserRole.admin,
            first_name="Super",
            last_name="Admin",
            kyc_status=KYCStatus.approved,
            is_profile_complete=True
        )
        
        owner_user = User(
            email="owner@test.com",
            password_hash=get_password_hash("owner123"),
            role=UserRole.owner,
            first_name="Vehicle",
            last_name="Owner",
            phone="9876543210",
            kyc_status=KYCStatus.approved,
            is_profile_complete=True
        )
        
        regular_user = User(
            email="user@test.com",
            password_hash=get_password_hash("user123"),
            role=UserRole.user,
            first_name="Test",
            last_name="User",
            phone="9876543211",
            kyc_status=KYCStatus.approved,
            is_profile_complete=True
        )
        
        db.add_all([admin_user, owner_user, regular_user])
        db.commit()
        db.refresh(owner_user)

        print("Seeding Vehicles...")
        vehicle1 = Vehicle(
            owner_id=owner_user.id,
            name="Maruti Swift Dzire",
            brand="Maruti Suzuki",
            model="Swift Dzire",
            year=2022,
            color="White",
            vehicle_type=VehicleType.four_wheeler,
            seats=4,
            registration_number="MH-01-AB-1234",
            address="123 Main St",
            city="Mumbai",
            owner_expected_price_per_day=1500,
            platform_price_per_day=1500 * 1.15,
            is_ac=True,
            max_km_per_day=200,
            fuel_type="petrol",
            transmission="manual",
            status=VehicleStatus.available,
            current_lat=19.0760,
            current_lng=72.8777,
            images=[]
        )
        
        vehicle2 = Vehicle(
            owner_id=owner_user.id,
            name="Hyundai Creta",
            brand="Hyundai",
            model="Creta",
            year=2023,
            color="Black",
            vehicle_type=VehicleType.four_wheeler,
            seats=5,
            registration_number="DL-03-CD-5678",
            address="456 Park Ave",
            city="Delhi",
            owner_expected_price_per_day=2500,
            platform_price_per_day=2500 * 1.15,
            is_ac=True,
            max_km_per_day=250,
            fuel_type="diesel",
            transmission="automatic",
            status=VehicleStatus.available,
            current_lat=28.7041,
            current_lng=77.1025,
            images=[]
        )
        
        vehicle3 = Vehicle(
            owner_id=owner_user.id,
            name="Royal Enfield Classic 350",
            brand="Royal Enfield",
            model="Classic 350",
            year=2021,
            color="Black",
            vehicle_type=VehicleType.two_wheeler,
            seats=2,
            registration_number="KA-05-EF-9012",
            address="789 MG Road",
            city="Bangalore",
            owner_expected_price_per_day=800,
            platform_price_per_day=800 * 1.15,
            is_ac=False,
            max_km_per_day=150,
            fuel_type="petrol",
            transmission="manual",
            status=VehicleStatus.available,
            current_lat=12.9716,
            current_lng=77.5946,
            images=[]
        )
        
        db.add_all([vehicle1, vehicle2, vehicle3])
        db.commit()
        
        print("Data seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
