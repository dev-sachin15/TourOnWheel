from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "TourOnWheel"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    API_PREFIX: str = "/api"

    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/touronwheel"

    SECRET_KEY: str = "your-super-secret-jwt-key-change-in-production-minimum-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10485760  # 10MB

    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    RAZORPAY_KEY_ID: str = "rzp_test_your_key_id"
    RAZORPAY_KEY_SECRET: str = "your_razorpay_secret"

    PLATFORM_FEE_MIN: int = 15
    PLATFORM_FEE_MAX: int = 20

    @property
    def allowed_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]

    class Config:
        env_file = ".env"


settings = Settings()
