import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, Enum as SAEnum
from sqlalchemy.orm import relationship
from app.db.database import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"         # Kutilmoqda
    ACCEPTED = "accepted"       # Qabul qilindi
    PREPARING = "preparing"     # Tayyorlanmoqda
    READY = "ready"             # Tayyor
    DELIVERING = "delivering"   # Yetkazilmoqda
    DELIVERED = "delivered"     # Yetkazildi
    PAID = "paid"               # To'landi
    CANCELLED = "cancelled"     # Bekor qilindi


class PaymentType(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    CLICK = "click"
    PAYME = "payme"
    BONUS = "bonus"


class OrderType(str, enum.Enum):
    TABLE = "table"
    DELIVERY = "delivery"
    TAKEAWAY = "takeaway"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    customer_name = Column(String(255), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    order_type = Column(SAEnum(OrderType), default=OrderType.TABLE)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.PENDING)
    total_price = Column(Numeric(10, 2), default=0)
    discount = Column(Numeric(10, 2), default=0)
    final_price = Column(Numeric(10, 2), default=0)
    payment_type = Column(SAEnum(PaymentType), nullable=True)
    is_paid = Column(Boolean, default=False)
    note = Column(Text, nullable=True)
    promo_code = Column(String(50), nullable=True)

    # Who processed
    accepted_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    prepared_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    kassir_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="orders")
    table = relationship("Table", back_populates="orders")
    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False)


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, default=1)
    price = Column(Numeric(10, 2), nullable=False)
    total = Column(Numeric(10, 2), nullable=False)
    special_note = Column(Text, nullable=True)

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem", back_populates="order_items")
