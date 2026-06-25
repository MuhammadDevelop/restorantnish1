from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.db.database import get_db
from app.models.user import User, UserRole
from app.core.security import verify_password, create_access_token, get_password_hash
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()


class RegisterRequest(BaseModel):
    full_name: str
    phone: str
    password: str
    restaurant_name: Optional[str] = None


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: int
    full_name: str
    role: str
    restaurant_id: Optional[int] = None


@router.post("/login", response_model=LoginResponse, summary="Tizimga kirish")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Telefon raqam yoki parol noto'g'ri",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Foydalanuvchi bloklangan")

    token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )
    return LoginResponse(
        access_token=token,
        user_id=user.id,
        full_name=user.full_name,
        role=user.role.value,
        restaurant_id=user.restaurant_id,
    )


@router.post("/register", summary="Ro'yxatdan o'tish (Boss)")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    # Check phone
    existing = db.query(User).filter(User.phone == data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu telefon raqam allaqachon ro'yxatdan o'tgan")

    user = User(
        full_name=data.full_name,
        phone=data.phone,
        hashed_password=get_password_hash(data.password),
        role=UserRole.BOSS,
        is_active=True,
    )
    db.add(user)
    db.flush()

    if data.restaurant_name:
        from app.models.restaurant import Restaurant
        restaurant = Restaurant(
            name=data.restaurant_name,
            owner_id=user.id,
        )
        db.add(restaurant)
        db.flush()
        user.restaurant_id = restaurant.id

    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "role": user.role.value})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user_id": user.id,
        "full_name": user.full_name,
        "role": user.role.value,
        "restaurant_id": user.restaurant_id,
    }


@router.get("/me", summary="Mening ma'lumotlarim")
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "phone": current_user.phone,
        "email": current_user.email,
        "role": current_user.role.value,
        "avatar_url": current_user.avatar_url,
        "restaurant_id": current_user.restaurant_id,
        "bonus_points": current_user.bonus_points,
        "is_active": current_user.is_active,
    }
