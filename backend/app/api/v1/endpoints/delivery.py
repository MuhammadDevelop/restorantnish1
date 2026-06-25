from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.db.database import get_db
from app.api.deps import get_current_user
from app.models.user import User, UserRole
from app.models.order import Order, OrderStatus
from app.models.delivery import Delivery, DeliveryStatus

router = APIRouter()


class DeliveryRequest(BaseModel):
    order_id: int
    address: str
    courier_id: Optional[int] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    estimated_time: Optional[int] = 30
    delivery_fee: Optional[float] = 0


@router.post("", summary="Yetkazib berish yaratish")
def create_delivery(data: DeliveryRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    order = db.query(Order).filter(
        Order.id == data.order_id,
        Order.restaurant_id == current_user.restaurant_id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Buyurtma topilmadi")

    delivery = Delivery(
        order_id=data.order_id,
        courier_id=data.courier_id,
        address=data.address,
        lat=data.lat,
        lon=data.lon,
        estimated_time=data.estimated_time,
        delivery_fee=data.delivery_fee,
    )
    db.add(delivery)
    order.status = OrderStatus.DELIVERING
    db.commit()
    db.refresh(delivery)
    return delivery


@router.get("", summary="Yetkazib berishlar ro'yxati")
def get_deliveries(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    deliveries = db.query(Delivery).join(Order).filter(
        Order.restaurant_id == current_user.restaurant_id
    ).all()
    if current_user.role == UserRole.COURIER:
        deliveries = db.query(Delivery).filter(Delivery.courier_id == current_user.id).all()
    return deliveries


@router.patch("/{delivery_id}/status", summary="Yetkazib berish holatini yangilash")
def update_delivery_status(
    delivery_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    delivery = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not delivery:
        raise HTTPException(status_code=404, detail="Yetkazib berish topilmadi")

    status_map = {
        "assigned": DeliveryStatus.ASSIGNED,
        "picked_up": DeliveryStatus.PICKED_UP,
        "on_way": DeliveryStatus.ON_WAY,
        "delivered": DeliveryStatus.DELIVERED,
        "failed": DeliveryStatus.FAILED,
    }
    if status not in status_map:
        raise HTTPException(status_code=400, detail="Noto'g'ri holat")

    delivery.status = status_map[status]
    if status == "delivered":
        from datetime import datetime
        delivery.delivered_at = datetime.utcnow()

    db.commit()
    return {"status": delivery.status.value}


@router.get("/couriers", summary="Kuryer ro'yxati")
def get_couriers(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    couriers = db.query(User).filter(
        User.restaurant_id == current_user.restaurant_id,
        User.role == UserRole.COURIER,
        User.is_active == True
    ).all()
    return [{"id": c.id, "full_name": c.full_name, "phone": c.phone} for c in couriers]
