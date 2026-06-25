import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, Numeric, Enum as SAEnum, Date, Time
from sqlalchemy.orm import relationship
from app.db.database import Base


class DeliveryStatus(str, enum.Enum):
    ASSIGNED = "assigned"
    PICKED_UP = "picked_up"
    ON_WAY = "on_way"
    DELIVERED = "delivered"
    FAILED = "failed"


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    courier_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    address = Column(String(500), nullable=False)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    status = Column(SAEnum(DeliveryStatus), default=DeliveryStatus.ASSIGNED)
    estimated_time = Column(Integer, nullable=True)  # minutes
    delivery_fee = Column(Numeric(10, 2), default=0)
    note = Column(Text, nullable=True)

    assigned_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="delivery")
    courier = relationship("User", foreign_keys=[courier_id])


class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id = Column(Integer, primary_key=True, index=True)
    staff_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    is_present = Column(Boolean, default=False)
    note = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    staff = relationship("User", foreign_keys=[staff_id])
