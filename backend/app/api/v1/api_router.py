from fastapi import APIRouter
from app.api.v1.endpoints import auth, boss, menu, orders, tables, delivery, analytics, superadmin

api_router = APIRouter()

# Auth
api_router.include_router(auth.router, prefix="/auth", tags=["🔐 Auth"])

# SuperAdmin
api_router.include_router(superadmin.router, prefix="/superadmin", tags=["👑 SuperAdmin"])

# Boss (Owner)
api_router.include_router(boss.router, prefix="/boss", tags=["👔 Boss"])

# Menu CRUD (with Cloudinary)
api_router.include_router(menu.router, prefix="/menu", tags=["🍽️ Menu"])

# Orders
api_router.include_router(orders.router, prefix="/orders", tags=["📋 Orders"])

# Tables
api_router.include_router(tables.router, prefix="/tables", tags=["🪑 Tables"])

# Delivery
api_router.include_router(delivery.router, prefix="/delivery", tags=["🚗 Delivery"])

# Analytics
api_router.include_router(analytics.router, prefix="/analytics", tags=["📊 Analytics"])
