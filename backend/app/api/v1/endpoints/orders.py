from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from decimal import Decimal

from app.db.database import get_db
from app.api.deps import get_current_user, get_admin
from app.models.user import User, UserRole
from app.models.order import Order, OrderItem, OrderStatus, PaymentType, OrderType
from app.models.menu import MenuItem
from app.models.restaurant import Table
from app.models.finance import PromoCode, CustomerBonus

router = APIRouter()


class OrderItemRequest(BaseModel):
    menu_item_id: int
    quantity: int
    special_note: Optional[str] = None


class CreateOrderRequest(BaseModel):
    table_id: Optional[int] = None
    order_type: str = "table"
    items: List[OrderItemRequest]
    note: Optional[str] = None
    promo_code: Optional[str] = None
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    delivery_address: Optional[str] = None


@router.post("", summary="Buyurtma yaratish")
def create_order(data: CreateOrderRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rid = current_user.restaurant_id
    total = Decimal("0")
    order_items = []

    for item_req in data.items:
        menu_item = db.query(MenuItem).filter(MenuItem.id == item_req.menu_item_id).first()
        if not menu_item or not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"Mahsulot #{item_req.menu_item_id} mavjud emas")
        item_total = menu_item.price * item_req.quantity
        total += item_total
        order_items.append(OrderItem(
            menu_item_id=menu_item.id,
            quantity=item_req.quantity,
            price=menu_item.price,
            total=item_total,
            special_note=item_req.special_note,
        ))

    # Promo code check
    discount = Decimal("0")
    if data.promo_code:
        promo = db.query(PromoCode).filter(
            PromoCode.restaurant_id == rid,
            PromoCode.code == data.promo_code.upper(),
            PromoCode.is_active == True
        ).first()
        if promo and promo.used_count < promo.max_uses and total >= promo.min_order_amount:
            discount = total * promo.discount_percent / 100
            promo.used_count += 1

    order_type_map = {"table": OrderType.TABLE, "delivery": OrderType.DELIVERY, "takeaway": OrderType.TAKEAWAY}
    order = Order(
        restaurant_id=rid,
        table_id=data.table_id,
        customer_id=current_user.id if current_user.role == UserRole.XARIDOR else None,
        customer_name=data.customer_name or current_user.full_name,
        customer_phone=data.customer_phone or current_user.phone,
        order_type=order_type_map.get(data.order_type, OrderType.TABLE),
        total_price=total,
        discount=discount,
        final_price=total - discount,
        note=data.note,
        promo_code=data.promo_code,
    )
    db.add(order)
    db.flush()

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    # Update table status
    if data.table_id:
        table = db.query(Table).filter(Table.id == data.table_id).first()
        if table:
            table.status = "busy"

    db.commit()
    db.refresh(order)
    return {"id": order.id, "total": float(order.total_price), "final_price": float(order.final_price), "status": order.status.value}


@router.get("", summary="Buyurtmalar ro'yxati")
def get_orders(
    status: Optional[str] = None,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Order).filter(Order.restaurant_id == current_user.restaurant_id)
    if status:
        query = query.filter(Order.status == status)
    if current_user.role == UserRole.XARIDOR:
        query = query.filter(Order.customer_id == current_user.id)
    orders = query.order_by(Order.created_at.desc()).limit(limit).all()

    return [
        {
            "id": o.id,
            "status": o.status.value,
            "order_type": o.order_type.value,
            "total_price": float(o.total_price),
            "final_price": float(o.final_price),
            "discount": float(o.discount),
            "is_paid": o.is_paid,
            "payment_type": o.payment_type.value if o.payment_type else None,
            "customer_name": o.customer_name,
            "customer_phone": o.customer_phone,
            "note": o.note,
            "table_id": o.table_id,
            "created_at": str(o.created_at),
            "items": [
                {
                    "id": item.id,
                    "menu_item_id": item.menu_item_id,
                    "name": item.menu_item.name if item.menu_item else "",
                    "quantity": item.quantity,
                    "price": float(item.price),
                    "total": float(item.total),
                    "special_note": item.special_note,
                }
                for item in o.items
            ]
        }
        for o in orders
    ]


@router.get("/{order_id}", summary="Buyurtma detail")
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    return order


@router.patch("/{order_id}/status", summary="Buyurtma holatini yangilash")
def update_order_status(
    order_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")

    status_map = {
        "pending": OrderStatus.PENDING,
        "accepted": OrderStatus.ACCEPTED,
        "preparing": OrderStatus.PREPARING,
        "ready": OrderStatus.READY,
        "delivering": OrderStatus.DELIVERING,
        "delivered": OrderStatus.DELIVERED,
        "paid": OrderStatus.PAID,
        "cancelled": OrderStatus.CANCELLED,
    }
    if status not in status_map:
        raise HTTPException(status_code=400, detail="Noto'g'ri holat")

    order.status = status_map[status]

    # Free table when paid/delivered
    if status in ["paid", "delivered", "cancelled"] and order.table_id:
        table = db.query(Table).filter(Table.id == order.table_id).first()
        if table:
            table.status = "empty"

    db.commit()
    return {"status": order.status.value}


@router.patch("/{order_id}/pay", summary="To'lov qilish")
def pay_order(
    order_id: int,
    payment_type: str = "cash",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    if order.is_paid:
        raise HTTPException(status_code=400, detail="Bu buyurtma allaqachon to'langan")

    payment_map = {
        "cash": PaymentType.CASH,
        "card": PaymentType.CARD,
        "click": PaymentType.CLICK,
        "payme": PaymentType.PAYME,
        "bonus": PaymentType.BONUS,
    }
    order.is_paid = True
    order.payment_type = payment_map.get(payment_type, PaymentType.CASH)
    order.status = OrderStatus.PAID
    order.kassir_id = current_user.id

    # Add to finance
    from app.models.finance import Transaction, TransactionType
    from datetime import date
    tx = Transaction(
        restaurant_id=order.restaurant_id,
        type=TransactionType.INCOME,
        amount=order.final_price,
        description=f"Buyurtma #{order.id} to'lovi",
        category="order",
        created_by=current_user.id,
        date=date.today(),
    )
    db.add(tx)

    # Free table
    if order.table_id:
        table = db.query(Table).filter(Table.id == order.table_id).first()
        if table:
            table.status = "empty"

    # Add bonus points to customer
    if order.customer_id:
        points = int(float(order.final_price) / 1000)  # 1 ball = 1000 so'm
        customer = db.query(User).filter(User.id == order.customer_id).first()
        if customer:
            customer.bonus_points += points

    db.commit()
    return {"message": "To'lov muvaffaqiyatli", "payment_type": payment_type}


@router.delete("/{order_id}", summary="Buyurtmani bekor qilish")
def cancel_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")
    if order.is_paid:
        raise HTTPException(status_code=400, detail="To'langan buyurtmani bekor qilib bo'lmaydi")
    order.status = OrderStatus.CANCELLED
    if order.table_id:
        table = db.query(Table).filter(Table.id == order.table_id).first()
        if table:
            table.status = "empty"
    db.commit()
    return {"message": "Buyurtma bekor qilindi"}
