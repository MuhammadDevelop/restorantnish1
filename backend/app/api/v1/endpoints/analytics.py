from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date, timedelta

from app.db.database import get_db
from app.api.deps import get_boss, get_current_user
from app.models.user import User
from app.models.order import Order, OrderStatus, PaymentType
from app.models.menu import MenuItem, Category
from app.models.finance import Transaction, TransactionType

router = APIRouter()


@router.get("/overview", summary="Umumiy statistika")
def get_overview(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    rid = current_user.restaurant_id
    today = date.today()

    # Orders stats
    total_orders = db.query(Order).filter(Order.restaurant_id == rid).count()
    today_orders = db.query(Order).filter(
        Order.restaurant_id == rid,
        func.date(Order.created_at) == today
    ).count()

    # Revenue
    total_revenue = db.query(func.sum(Order.final_price)).filter(
        Order.restaurant_id == rid, Order.is_paid == True
    ).scalar() or 0

    today_revenue = db.query(func.sum(Order.final_price)).filter(
        Order.restaurant_id == rid, Order.is_paid == True,
        func.date(Order.created_at) == today
    ).scalar() or 0

    # Staff count
    total_staff = db.query(User).filter(User.restaurant_id == rid).count()

    # Menu items
    total_items = db.query(MenuItem).join(Category).filter(Category.restaurant_id == rid).count()

    return {
        "total_orders": total_orders,
        "today_orders": today_orders,
        "total_revenue": float(total_revenue),
        "today_revenue": float(today_revenue),
        "total_staff": total_staff,
        "total_menu_items": total_items,
    }


@router.get("/sales", summary="Sotuv grafigi")
def get_sales_chart(
    days: int = 30,
    current_user: User = Depends(get_boss),
    db: Session = Depends(get_db)
):
    rid = current_user.restaurant_id
    today = date.today()
    data = []

    for i in range(days):
        day = today - timedelta(days=days - 1 - i)
        orders = db.query(Order).filter(
            Order.restaurant_id == rid,
            Order.is_paid == True,
            func.date(Order.created_at) == day
        ).all()
        data.append({
            "date": str(day),
            "orders": len(orders),
            "revenue": sum(float(o.final_price or 0) for o in orders),
        })
    return data


@router.get("/top-items", summary="Eng ko'p buyurtma qilingan mahsulotlar")
def get_top_items(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    from app.models.order import OrderItem
    from sqlalchemy import desc

    rid = current_user.restaurant_id
    results = db.query(
        MenuItem.name,
        MenuItem.image_url,
        func.sum(OrderItem.quantity).label("total_qty"),
        func.sum(OrderItem.total).label("total_revenue"),
    ).join(OrderItem, MenuItem.id == OrderItem.menu_item_id
    ).join(Order, OrderItem.order_id == Order.id
    ).filter(Order.restaurant_id == rid, Order.is_paid == True
    ).group_by(MenuItem.id, MenuItem.name, MenuItem.image_url
    ).order_by(desc("total_qty")).limit(10).all()

    return [
        {"name": r.name, "image_url": r.image_url,
         "total_qty": int(r.total_qty or 0), "total_revenue": float(r.total_revenue or 0)}
        for r in results
    ]


@router.get("/payment-types", summary="To'lov turlari statistikasi")
def get_payment_stats(current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    rid = current_user.restaurant_id
    results = db.query(
        Order.payment_type,
        func.count(Order.id).label("count"),
        func.sum(Order.final_price).label("total"),
    ).filter(
        Order.restaurant_id == rid, Order.is_paid == True
    ).group_by(Order.payment_type).all()

    return [
        {"payment_type": r.payment_type.value if r.payment_type else "unknown",
         "count": r.count, "total": float(r.total or 0)}
        for r in results
    ]
