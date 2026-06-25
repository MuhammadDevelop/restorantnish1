from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token noto'g'ri yoki muddati o'tgan",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id: int = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def require_role(*roles: UserRole):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Bu amalni bajarish uchun ruxsat yo'q. Talab qilinadigan rol: {[r.value for r in roles]}"
            )
        return current_user
    return role_checker


def get_superadmin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.SUPERADMIN:
        raise HTTPException(status_code=403, detail="Faqat Super Admin uchun")
    return current_user


def get_boss(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.BOSS, UserRole.SUPERADMIN]:
        raise HTTPException(status_code=403, detail="Faqat Boss uchun")
    return current_user


def get_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.ADMIN, UserRole.BOSS, UserRole.SUPERADMIN]:
        raise HTTPException(status_code=403, detail="Faqat Administrator uchun")
    return current_user


def get_kassir(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.KASSIR, UserRole.ADMIN, UserRole.BOSS, UserRole.SUPERADMIN]:
        raise HTTPException(status_code=403, detail="Faqat Kassir uchun")
    return current_user


def get_oshpaz(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in [UserRole.OSHPAZ, UserRole.ADMIN, UserRole.BOSS, UserRole.SUPERADMIN]:
        raise HTTPException(status_code=403, detail="Faqat Oshpaz uchun")
    return current_user
