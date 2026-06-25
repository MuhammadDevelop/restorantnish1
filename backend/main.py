from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.core.config import settings
from app.api.v1.api_router import api_router
from app.db.database import engine, Base

# Import all models to create tables
from app.models import (  # noqa
    User, UserRole,
    Restaurant, Branch, Table,
    Category, MenuItem,
    Order, OrderItem,
    Delivery, WorkSchedule,
    Transaction, CustomerBonus, PromoCode,
    Notification, Complaint,
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
## 🍽️ Restoran SaaS Platformasi API

To'liq restoran boshqaruv tizimi.

### Rollar:
- **SuperAdmin** — Platforma boshqaruvi
- **Boss** — Restoran egasi
- **Administrator** — Qabul va boshqaruv
- **Kassir** — To'lov va hisobot
- **Oshpaz** — Oshxona kabineti
- **Xaridor** — Mijoz paneli
- **Courier** — Yetkazib berish
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)


# ─── Startup ──────────────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

    # Auto-seed default superadmin
    from app.db.database import SessionLocal
    from app.models.user import User, UserRole
    from app.core.security import get_password_hash

    db = SessionLocal()
    try:
        if not db.query(User).filter(User.role == UserRole.SUPERADMIN).first():
            superadmin = User(
                full_name="Super Admin",
                phone="+998901001001",
                hashed_password=get_password_hash("admin2024"),
                role=UserRole.SUPERADMIN,
                is_active=True,
            )
            db.add(superadmin)
            db.commit()
            print("✅ SuperAdmin yaratildi: +998901001001 / admin2024")
    except Exception as e:
        db.rollback()
        print(f"❌ Seed xatosi: {e}")
    finally:
        db.close()


# ─── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Exception Handlers ───────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({"field": field, "message": error["msg"]})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Kiritilgan ma'lumotlar noto'g'ri", "errors": errors},
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    import traceback
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Server xatosi yuz berdi", "error": str(exc)},
    )


# ─── Routes ───────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/", tags=["Root"])
def root():
    return {"app": settings.APP_NAME, "version": settings.APP_VERSION, "status": "ishlayapti", "docs": "/docs"}


@app.get("/health", tags=["Root"])
def health():
    return {"status": "ok"}
