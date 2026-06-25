import cloudinary
import cloudinary.uploader
import cloudinary.api
from fastapi import UploadFile, HTTPException
from app.core.config import settings


def configure_cloudinary():
    cloudinary.config(
        cloud_name=settings.CLOUDINARY_CLOUD_NAME,
        api_key=settings.CLOUDINARY_API_KEY,
        api_secret=settings.CLOUDINARY_API_SECRET,
        secure=True
    )


configure_cloudinary()


async def upload_image(file: UploadFile, folder: str = "restoran") -> dict:
    """Upload image to Cloudinary and return URL + public_id"""
    if not settings.CLOUDINARY_CLOUD_NAME:
        raise HTTPException(status_code=500, detail="Cloudinary sozlanmagan")

    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Faqat rasm fayllari qabul qilinadi (jpg, png, webp)")

    # Max size: 10MB
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Rasm hajmi 10MB dan oshmasligi kerak")

    try:
        result = cloudinary.uploader.upload(
            contents,
            folder=f"restoran_saas/{folder}",
            transformation=[
                {"quality": "auto:good"},
                {"fetch_format": "auto"},
            ]
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "width": result.get("width"),
            "height": result.get("height"),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Rasm yuklashda xato: {str(e)}")


def delete_image(public_id: str) -> bool:
    """Delete image from Cloudinary"""
    if not public_id or not settings.CLOUDINARY_CLOUD_NAME:
        return False
    try:
        cloudinary.uploader.destroy(public_id)
        return True
    except Exception:
        return False
