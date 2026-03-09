from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Optional
from uuid import UUID

from ..database import get_db
from ..models import User, FirstAidArticle
from ..schemas import FirstAidArticleResponse, FirstAidArticleCreate
from ..auth import get_current_user

router = APIRouter(prefix="/knowledge", tags=["knowledge"])

@router.get("/", response_model=List[FirstAidArticleResponse])
async def search_articles(
    query: Optional[str] = None,
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FirstAidArticle).where(FirstAidArticle.is_published == True)
    
    if query:
        stmt = stmt.where(
            (FirstAidArticle.title.ilike(f"%{query}%")) | 
            (FirstAidArticle.content.ilike(f"%{query}%")) |
            (FirstAidArticle.tags.ilike(f"%{query}%"))
        )
    
    if category:
        stmt = stmt.where(FirstAidArticle.category == category)
        
    result = await db.execute(stmt.order_by(FirstAidArticle.title))
    return result.scalars().all()

@router.get("/{article_id}", response_model=FirstAidArticleResponse)
async def get_article(
    article_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(FirstAidArticle).where(FirstAidArticle.id == article_id))
    article = result.scalars().first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    return article

@router.post("/", response_model=FirstAidArticleResponse)
async def create_article(
    article_in: FirstAidArticleCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["staff", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_article = FirstAidArticle(**article_in.model_dump())
    db.add(db_article)
    await db.commit()
    await db.refresh(db_article)
    return db_article
