from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.api.deps import get_boss, get_current_user
from app.models.user import User, UserRole
from app.models.restaurant import Restaurant, Branch, Table
from app.models.menu import Category, MenuItem
from app.models.order import Order, OrderStatus
from app.models.finance import Transaction, TransactionType, PromoCode
from app.core.security import get_password_hash
from app.services.cloudinary_service import upload_image, delete_image

router = APIRouter()


# ─── Restaurant ───────────────────────────────────────────────
@router.get("/restaurant", summary="Restoran ma'lumotlari")
def get_restaurant(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    restaurant = db.query(Restaurant).filter(Restaurant.id == current_user.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")
    return restaurant


@router.put("/restaurant", summary="Restoran ma'lumotlarini yangilash")
def update_restaurant(
    name: str = None, description: str = None, address: str = None, phone: str = None,
    current_user: User = Depends(get_boss), db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == current_user.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")
    if name: restaurant.name = name
    if description: restaurant.description = description
    if address: restaurant.address = address
    if phone: restaurant.phone = phone
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.post("/restaurant/logo", summary="Restoran logosini yuklash")
async def upload_restaurant_logo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_boss),
    db: Session = Depends(get_db)
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == current_user.restaurant_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="Restoran topilmadi")

    if restaurant.logo_cloudinary_id:
        delete_image(restaurant.logo_cloudinary_id)

    result = await upload_image(file, folder="logos")
    restaurant.logo_url = result["url"]
    restaurant.logo_cloudinary_id = result["public_id"]
    db.commit()
    return {"logo_url": result["url"]}


# ─── Dashboard Stats ──────────────────────────────────────────
@router.get("/dashboard", summary="Bosh sahifa statistikasi")
def get_dashboard(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    rid = current_user.restaurant_id
    from datetime import date, timedelta
    today = date.today()
    week_ago = today - timedelta(days=7)

    total_orders_today = db.query(Order).filter(
        Order.restaurant_id == rid,
        func.date(Order.created_at) == today
    ).count()

    paid_orders_today = db.query(Order).filter(
        Order.restaurant_id == rid,
        Order.is_paid == True,
        func.date(Order.created_at) == today
    ).all()

    revenue_today = sum(float(o.final_price or 0) for o in paid_orders_today)

    total_staff = db.query(User).filter(User.restaurant_id == rid).count()
    total_menu_items = db.query(MenuItem).join(Category).filter(
        Category.restaurant_id == rid
    ).count()

    # Weekly revenue
    weekly_data = []
    for i in range(7):
        day = today - timedelta(days=6 - i)
        orders = db.query(Order).filter(
            Order.restaurant_id == rid,
            Order.is_paid == True,
            func.date(Order.created_at) == day
        ).all()
        weekly_data.append({
            "date": str(day),
            "revenue": sum(float(o.final_price or 0) for o in orders),
            "orders": len(orders)
        })

    return {
        "today": {
            "orders": total_orders_today,
            "revenue": revenue_today,
        },
        "total_staff": total_staff,
        "total_menu_items": total_menu_items,
        "weekly_data": weekly_data,
    }


# ─── Staff Management ─────────────────────────────────────────
class StaffCreateRequest(BaseModel):
    full_name: str
    phone: str
    password: str
    role: str  # admin, kassir, oshpaz, courier


@router.get("/staff", summary="Xodimlar ro'yxati")
def get_staff(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    staff = db.query(User).filter(
        User.restaurant_id == current_user.restaurant_id,
        User.role != UserRole.BOSS
    ).all()
    return [{"id": s.id, "full_name": s.full_name, "phone": s.phone, "role": s.role.value,
             "is_active": s.is_active, "created_at": str(s.created_at)} for s in staff]


@router.post("/staff", summary="Xodim qo'shish")
def create_staff(data: StaffCreateRequest, current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Bu telefon raqam allaqachon mavjud")

    role_map = {
        "admin": UserRole.ADMIN,
        "kassir": UserRole.KASSIR,
        "oshpaz": UserRole.OSHPAZ,
        "courier": UserRole.COURIER,
    }
    if data.role not in role_map:
        raise HTTPException(status_code=400, detail="Noto'g'ri rol")

    user = User(
        full_name=data.full_name,
        phone=data.phone,
        hashed_password=get_password_hash(data.password),
        role=role_map[data.role],
        restaurant_id=current_user.restaurant_id,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "full_name": user.full_name, "role": user.role.value}


@router.delete("/staff/{staff_id}", summary="Xodimni o'chirish")
def delete_staff(staff_id: int, current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    staff = db.query(User).filter(
        User.id == staff_id,
        User.restaurant_id == current_user.restaurant_id
    ).first()
    if not staff:
        raise HTTPException(status_code=404, detail="Xodim topilmadi")
    db.delete(staff)
    db.commit()
    return {"message": "Xodim o'chirildi"}


# ─── Branches ─────────────────────────────────────────────────
@router.get("/branches", summary="Filiallar")
def get_branches(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    return db.query(Branch).filter(Branch.restaurant_id == current_user.restaurant_id).all()


@router.post("/branches", summary="Filial qo'shish")
def create_branch(name: str, address: str = None, phone: str = None,
                  current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    branch = Branch(
        restaurant_id=current_user.restaurant_id,
        name=name, address=address, phone=phone
    )
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


# ─── Finance ──────────────────────────────────────────────────
@router.get("/finance", summary="Moliyaviy hisobot")
def get_finance(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    rid = current_user.restaurant_id
    transactions = db.query(Transaction).filter(
        Transaction.restaurant_id == rid
    ).order_by(Transaction.created_at.desc()).limit(50).all()

    total_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.restaurant_id == rid,
        Transaction.type == TransactionType.INCOME
    ).scalar() or 0

    total_expense = db.query(func.sum(Transaction.amount)).filter(
        Transaction.restaurant_id == rid,
        Transaction.type == TransactionType.EXPENSE
    ).scalar() or 0

    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "profit": float(total_income) - float(total_expense),
        "transactions": [
            {"id": t.id, "type": t.type.value, "amount": float(t.amount),
             "description": t.description, "category": t.category,
             "date": str(t.date)} for t in transactions
        ]
    }


class TransactionRequest(BaseModel):
    type: str  # income / expense
    amount: float
    description: str
    category: Optional[str] = None


@router.post("/finance/transaction", summary="Tranzaksiya qo'shish")
def add_transaction(data: TransactionRequest, current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    tx = Transaction(
        restaurant_id=current_user.restaurant_id,
        type=TransactionType.INCOME if data.type == "income" else TransactionType.EXPENSE,
        amount=data.amount,
        description=data.description,
        category=data.category,
        created_by=current_user.id,
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


# ─── Promo Codes ──────────────────────────────────────────────
@router.get("/promo-codes", summary="Promo kodlar")
def get_promo_codes(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    return db.query(PromoCode).filter(PromoCode.restaurant_id == current_user.restaurant_id).all()


class PromoRequest(BaseModel):
    code: str
    discount_percent: float
    max_uses: int = 100
    min_order_amount: float = 0


@router.post("/promo-codes", summary="Promo kod yaratish")
def create_promo(data: PromoRequest, current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    promo = PromoCode(
        restaurant_id=current_user.restaurant_id,
        code=data.code.upper(),
        discount_percent=data.discount_percent,
        max_uses=data.max_uses,
        min_order_amount=data.min_order_amount,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo
