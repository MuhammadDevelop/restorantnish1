from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal

from app.db.database import get_db
from app.api.deps import get_boss, get_current_user
from app.models.user import User
from app.models.menu import Category, MenuItem
from app.services.cloudinary_service import upload_image, delete_image

router = APIRouter()


# ─── Categories ───────────────────────────────────────────────
@router.get("/categories", summary="Kategoriyalar")
def get_categories(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    restaurant_id = current_user.restaurant_id
    categories = db.query(Category).filter(
        Category.restaurant_id == restaurant_id,
        Category.is_active == True
    ).order_by(Category.order).all()
    return [
        {
            "id": c.id, "name": c.name, "image_url": c.image_url,
            "order": c.order, "is_active": c.is_active,
            "items_count": len(c.menu_items)
        }
        for c in categories
    ]


@router.get("/categories/public/{restaurant_id}", summary="Public kategoriyalar (QR menu uchun)")
def get_public_categories(restaurant_id: int, db: Session = Depends(get_db)):
    categories = db.query(Category).filter(
        Category.restaurant_id == restaurant_id,
        Category.is_active == True
    ).order_by(Category.order).all()
    result = []
    for c in categories:
        items = db.query(MenuItem).filter(
            MenuItem.category_id == c.id,
            MenuItem.is_available == True
        ).order_by(MenuItem.order).all()
        result.append({
            "id": c.id, "name": c.name, "image_url": c.image_url,
            "items": [
                {
                    "id": item.id, "name": item.name, "description": item.description,
                    "price": float(item.price), "image_url": item.image_url,
                    "weight": item.weight, "preparation_time": item.preparation_time,
                }
                for item in items
            ]
        })
    return result


@router.post("/categories", summary="Kategoriya yaratish")
async def create_category(
    name: str = Form(...),
    order: int = Form(0),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_boss),
    db: Session = Depends(get_db)
):
    category = Category(
        restaurant_id=current_user.restaurant_id,
        name=name,
        order=order,
    )
    if image:
        result = await upload_image(image, folder="categories")
        category.image_url = result["url"]
        category.image_cloudinary_id = result["public_id"]
    db.add(category)
    db.commit()
    db.refresh(category)
    return {"id": category.id, "name": category.name, "image_url": category.image_url}


@router.put("/categories/{category_id}", summary="Kategoriya yangilash")
async def update_category(
    category_id: int,
    name: str = Form(None),
    order: int = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_boss),
    db: Session = Depends(get_db)
):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.restaurant_id == current_user.restaurant_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategoriya topilmadi")
    if name: category.name = name
    if order is not None: category.order = order
    if image:
        if category.image_cloudinary_id:
            delete_image(category.image_cloudinary_id)
        result = await upload_image(image, folder="categories")
        category.image_url = result["url"]
        category.image_cloudinary_id = result["public_id"]
    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}", summary="Kategoriya o'chirish")
def delete_category(category_id: int, current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.restaurant_id == current_user.restaurant_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategoriya topilmadi")
    if category.image_cloudinary_id:
        delete_image(category.image_cloudinary_id)
    db.delete(category)
    db.commit()
    return {"message": "Kategoriya o'chirildi"}


# ─── Menu Items ───────────────────────────────────────────────
@router.get("/items", summary="Menyu mahsulotlari")
def get_menu_items(
    category_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(MenuItem).join(Category).filter(
        Category.restaurant_id == current_user.restaurant_id
    )
    if category_id:
        query = query.filter(MenuItem.category_id == category_id)
    items = query.order_by(MenuItem.order).all()
    return [
        {
            "id": i.id, "name": i.name, "description": i.description,
            "price": float(i.price), "image_url": i.image_url,
            "is_available": i.is_available, "category_id": i.category_id,
            "weight": i.weight, "calories": i.calories,
            "preparation_time": i.preparation_time
        }
        for i in items
    ]


@router.post("/items", summary="Mahsulot qo'shish")
async def create_menu_item(
    category_id: int = Form(...),
    name: str = Form(...),
    description: str = Form(None),
    price: float = Form(...),
    weight: str = Form(None),
    calories: int = Form(None),
    preparation_time: int = Form(15),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_boss),
    db: Session = Depends(get_db)
):
    # Verify category belongs to restaurant
    category = db.query(Category).filter(
        Category.id == category_id,
        Category.restaurant_id == current_user.restaurant_id
    ).first()
    if not category:
        raise HTTPException(status_code=404, detail="Kategoriya topilmadi")

    item = MenuItem(
        category_id=category_id,
        restaurant_id=current_user.restaurant_id,
        name=name,
        description=description,
        price=Decimal(str(price)),
        weight=weight,
        calories=calories,
        preparation_time=preparation_time,
    )
    if image:
        result = await upload_image(image, folder="menu_items")
        item.image_url = result["url"]
        item.image_cloudinary_id = result["public_id"]
    db.add(item)
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name, "price": float(item.price), "image_url": item.image_url}


@router.put("/items/{item_id}", summary="Mahsulot yangilash")
async def update_menu_item(
    item_id: int,
    name: str = Form(None),
    description: str = Form(None),
    price: float = Form(None),
    weight: str = Form(None),
    is_available: bool = Form(None),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_boss),
    db: Session = Depends(get_db)
):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.restaurant_id == current_user.restaurant_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")

    if name: item.name = name
    if description is not None: item.description = description
    if price is not None: item.price = Decimal(str(price))
    if weight is not None: item.weight = weight
    if is_available is not None: item.is_available = is_available
    if image:
        if item.image_cloudinary_id:
            delete_image(item.image_cloudinary_id)
        result = await upload_image(image, folder="menu_items")
        item.image_url = result["url"]
        item.image_cloudinary_id = result["public_id"]
    db.commit()
    db.refresh(item)
    return {"id": item.id, "name": item.name, "price": float(item.price), "image_url": item.image_url}


@router.delete("/items/{item_id}", summary="Mahsulot o'chirish")
def delete_menu_item(item_id: int, current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.restaurant_id == current_user.restaurant_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    if item.image_cloudinary_id:
        delete_image(item.image_cloudinary_id)
    db.delete(item)
    db.commit()
    return {"message": "Mahsulot o'chirildi"}


@router.patch("/items/{item_id}/toggle", summary="Mahsulot mavjudligini o'zgartirish")
def toggle_availability(item_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    item = db.query(MenuItem).filter(
        MenuItem.id == item_id,
        MenuItem.restaurant_id == current_user.restaurant_id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mahsulot topilmadi")
    item.is_available = not item.is_available
    db.commit()
    return {"is_available": item.is_available}
