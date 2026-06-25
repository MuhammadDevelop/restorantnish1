from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.api.deps import get_current_user, get_boss
from app.models.user import User
from app.models.restaurant import Table, Branch

router = APIRouter()


@router.get("", summary="Stollar ro'yxati")
def get_tables(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tables = db.query(Table).join(Branch).filter(
        Branch.restaurant_id == current_user.restaurant_id
    ).all()
    return [
        {
            "id": t.id, "number": t.number, "capacity": t.capacity,
            "status": t.status, "branch_id": t.branch_id,
            "qr_code_url": t.qr_code_url
        }
        for t in tables
    ]


@router.post("", summary="Stol qo'shish")
def create_table(
    branch_id: int, number: int, capacity: int = 4,
    current_user: User = Depends(get_boss),
    db: Session = Depends(get_db)
):
    # Verify branch belongs to restaurant
    branch = db.query(Branch).filter(
        Branch.id == branch_id,
        Branch.restaurant_id == current_user.restaurant_id
    ).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Filial topilmadi")

    table = Table(branch_id=branch_id, number=number, capacity=capacity)
    db.add(table)
    db.commit()
    db.refresh(table)
    return table


@router.patch("/{table_id}/status", summary="Stol holatini yangilash")
def update_table_status(
    table_id: int, status: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    table = db.query(Table).join(Branch).filter(
        Table.id == table_id,
        Branch.restaurant_id == current_user.restaurant_id
    ).first()
    if not table:
        raise HTTPException(status_code=404, detail="Stol topilmadi")
    if status not in ["empty", "busy", "reserved"]:
        raise HTTPException(status_code=400, detail="Noto'g'ri holat")
    table.status = status
    db.commit()
    return {"status": table.status}


@router.delete("/{table_id}", summary="Stolni o'chirish")
def delete_table(table_id: int, current_user: User = Depends(get_boss), db: Session = Depends(get_db)):
    table = db.query(Table).join(Branch).filter(
        Table.id == table_id,
        Branch.restaurant_id == current_user.restaurant_id
    ).first()
    if not table:
        raise HTTPException(status_code=404, detail="Stol topilmadi")
    db.delete(table)
    db.commit()
    return {"message": "Stol o'chirildi"}
