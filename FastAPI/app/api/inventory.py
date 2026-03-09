from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from ..database import get_db
from ..models import User, InventoryItem, StockTransaction
from ..schemas import InventoryItemResponse, InventoryItemCreate, InventoryItemUpdate, StockTransactionResponse, StockTransactionCreate
from ..auth import get_current_user

router = APIRouter(prefix="/inventory", tags=["inventory"])

@router.get("/", response_model=List[InventoryItemResponse])
async def list_inventory(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    result = await db.execute(select(InventoryItem))
    return result.scalars().all()

@router.post("/", response_model=InventoryItemResponse)
async def create_inventory_item(
    item_in: InventoryItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    db_item = InventoryItem(**item_in.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.patch("/{item_id}", response_model=InventoryItemResponse)
async def update_inventory_item(
    item_id: UUID,
    item_in: InventoryItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == item_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
    update_data = item_in.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    await db.commit()
    await db.refresh(db_item)
    return db_item

@router.post("/transaction", response_model=StockTransactionResponse)
async def create_transaction(
    trans_in: StockTransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    result = await db.execute(select(InventoryItem).where(InventoryItem.id == trans_in.item_id))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        
    # Apply stock change
    if trans_in.transaction_type == "addition":
        db_item.current_stock += trans_in.quantity
        if trans_in.source == "Restock":
            db_item.last_restocked = datetime.now()
    elif trans_in.transaction_type == "deduction":
        if db_item.current_stock < trans_in.quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient stock")
        db_item.current_stock -= trans_in.quantity
    elif trans_in.transaction_type == "adjustment":
        db_item.current_stock = trans_in.quantity
        
    db_trans = StockTransaction(
        **trans_in.model_dump(),
        user_id=current_user.id
    )
    
    db.add(db_trans)
    await db.commit()
    await db.refresh(db_trans)
    return db_trans

@router.get("/transactions/{item_id}", response_model=List[StockTransactionResponse])
async def get_item_transactions(
    item_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
        
    result = await db.execute(select(StockTransaction).where(StockTransaction.item_id == item_id).order_by(StockTransaction.timestamp.desc()))
    return result.scalars().all()
