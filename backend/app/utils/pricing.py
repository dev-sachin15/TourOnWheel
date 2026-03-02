import random
from app.config import settings


def calculate_platform_price(owner_price: float) -> tuple[float, float]:
    """
    Calculate the platform price by adding 15-20% on top of owner's expected price.
    Returns (platform_price_per_day, fee_percentage)
    """
    fee_percentage = random.uniform(settings.PLATFORM_FEE_MIN, settings.PLATFORM_FEE_MAX)
    platform_price = owner_price * (1 + fee_percentage / 100)
    return round(platform_price, 2), round(fee_percentage, 2)


def calculate_booking_total(price_per_day: float, total_days: int, platform_fee_pct: float) -> dict:
    """
    Calculate booking totals.
    Returns dict with base_price, platform_fee, total_price
    """
    base_price = price_per_day * total_days
    # Owner's earning (before platform fee was added)
    owner_price_per_day = price_per_day / (1 + platform_fee_pct / 100)
    owner_total = owner_price_per_day * total_days
    platform_fee = base_price - owner_total

    return {
        "base_price": round(base_price, 2),
        "platform_fee": round(platform_fee, 2),
        "total_price": round(base_price, 2)
    }


def haversine_distance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """
    Calculate the distance between two GPS coordinates in kilometers.
    Uses the Haversine formula.
    """
    import math
    R = 6371  # Earth's radius in km
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return R * 2 * math.asin(math.sqrt(a))
