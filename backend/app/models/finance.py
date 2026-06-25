import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Numeric, Enum as SAEnum, Date
from sqlalchemy.orm import relationship
from app.db.database import Base


class TransactionType(str, enum.Enum):
    INCOME = "income"
    EXPENSE = "expense"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    type = Column(SAEnum(TransactionType), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    description = Column(String(500), nullable=True)
    category = Column(String(100), nullable=True)  # food, salary, rent, utilities
    date = Column(Date, default=datetime.utcnow().date)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", back_populates="transactions")
    creator = relationship("User", foreign_keys=[created_by])


class CustomerBonus(Base):
    __tablename__ = "customer_bonuses"

    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    points = Column(Integer, default=0)
    discount_card_number = Column(String(50), unique=True, nullable=True)
    card_discount_percent = Column(Numeric(5, 2), default=0)
    is_vip = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("User", foreign_keys=[customer_id])


class PromoCode(Base):
    __tablename__ = "promo_codes"

    id = Column(Integer, primary_key=True, index=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=False)
    code = Column(String(50), nullable=False)
    discount_percent = Column(Numeric(5, 2), nullable=False)
    discount_amount = Column(Numeric(10, 2), default=0)
    max_uses = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    expires_at = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    min_order_amount = Column(Numeric(10, 2), default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    restaurant = relationship("Restaurant", foreign_keys=[restaurant_id])
