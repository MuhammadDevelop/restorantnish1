from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.api.deps import get_superadmin
from app.models.user import User, UserRole
from app.models.restaurant import Restaurant
from app.core.security import get_password_hash

router = APIRouter()


@router.get("/restaurants", summary="Barcha restoranlar")
def get_all_restaurants(current_user: User = Depends(get_superadmin), db: Session = Depends(get_db)):
    restaurants = db.query(Restaurant).all()
    return [
        {
            "id": r.id, "name": r.name, "plan": r.plan,
            "is_active": r.is_active, "logo_url": r.logo_url,
            "created_at": str(r.created_at),
        }
        for r in restaurants
    ]


@router.patch("/restaurants/{restaurant_id}/plan", summary="Restoran rejasini o'zgartirish")
def update_restaurant_plan(
    restaurant_id: int, plan: str,
    current_user: User = Depends(get_superadmin),
    db: Session = Depends(get_db)
):
    if plan not in ["free", "basic", "premium"]:
        raise HTTPException(status_code=400, detail="Noto'g'ri reja")
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")
    restaurant.plan = plan
    db.commit()
    return {"plan": restaurant.plan}


@router.patch("/restaurants/{restaurant_id}/toggle", summary="Restoran faolligi")
def toggle_restaurant(restaurant_id: int, current_user: User = Depends(get_superadmin), db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")
    restaurant.is_active = not restaurant.is_active
    db.commit()
    return {"is_active": restaurant.is_active}


@router.get("/stats", summary="Platforma statistikasi")
def get_platform_stats(current_user: User = Depends(get_superadmin), db: Session = Depends(get_db)):
    total_restaurants = db.query(Restaurant).count()
    active_restaurants = db.query(Restaurant).filter(Restaurant.is_active == True).count()
    total_users = db.query(User).count()
    plan_stats = db.query(Restaurant.plan, func.count(Restaurant.id)).group_by(Restaurant.plan).all()

    return {
        "total_restaurants": total_restaurants,
        "active_restaurants": active_restaurants,
        "total_users": total_users,
        "plans": {p: c for p, c in plan_stats},
    }


class CreateSuperAdminRequest(BaseModel):
    full_name: str
    phone: str
    password: str


@router.post("/create-superadmin", summary="Super Admin yaratish")
def create_superadmin(data: CreateSuperAdminRequest, current_user: User = Depends(get_superadmin), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu telefon raqam allaqachon mavjud")
    user = User(
        full_name=data.full_name,
        phone=data.phone,
        hashed_password=get_password_hash(data.password),
        role=UserRole.SUPERADMIN,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "full_name": user.full_name, "role": user.role.value}
