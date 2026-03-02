import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
from app.config import settings

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
ALLOWED_DOC_TYPES = {"image/jpeg", "image/png", "application/pdf"}


async def save_upload_file(upload_file: UploadFile, folder: str) -> str:
    """Save an uploaded file and return the relative path."""
    if upload_file.content_type not in ALLOWED_IMAGE_TYPES.union(ALLOWED_DOC_TYPES):
        raise HTTPException(status_code=400, detail=f"File type {upload_file.content_type} not allowed")

    content = await upload_file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File size exceeds maximum allowed size (10MB)")

    ext = upload_file.filename.split(".")[-1].lower() if upload_file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    save_dir = Path(settings.UPLOAD_DIR) / folder
    save_dir.mkdir(parents=True, exist_ok=True)
    file_path = save_dir / filename

    with open(file_path, "wb") as f:
        f.write(content)

    return f"{folder}/{filename}"


def delete_file(file_path: str):
    """Delete a file from the upload directory."""
    full_path = Path(settings.UPLOAD_DIR) / file_path
    if full_path.exists():
        full_path.unlink()


def get_file_url(file_path: str) -> str:
    """Get the full URL for a file."""
    if not file_path:
        return None
    return f"/uploads/{file_path}"
