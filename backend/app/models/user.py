import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base


class UserRole(str, enum.Enum):
    SUPERADMIN = "superadmin"
    BOSS = "boss"
    ADMIN = "admin"
    KASSIR = "kassir"
    OSHPAZ = "oshpaz"
    COURIER = "courier"
    XARIDOR = "xaridor"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.XARIDOR)
    avatar_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    restaurant_id = Column(Integer, ForeignKey("restaurants.id"), nullable=True)

    # Bonus
    bonus_points = Column(Integer, default=0)

    telegram_id = Column(String(50), unique=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    restaurant = relationship("Restaurant", back_populates="staff", foreign_keys=[restaurant_id])
    orders = relationship("Order", back_populates="customer", foreign_keys="Order.customer_id")
