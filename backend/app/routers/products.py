from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from .. import models
from ..schemas import ProductOut
import json

router = APIRouter()

@router.get("/", response_model=List[ProductOut])
def list_products(
	q: Optional[str] = Query(None, description="Search term"),
	category: Optional[str] = Query(None),
	country: Optional[str] = Query(None, description="Jeweler's country"),
	db: Session = Depends(get_db),
):
	query = db.query(models.Product).join(models.Jeweler)
	if q:
		like = f"%{q}%"
		query = query.filter(models.Product.name.ilike(like))
	if category:
		query = query.filter(models.Product.category == category)
	if country:
		query = query.filter(models.Jeweler.country == country)
	items = query.all()
	result: List[ProductOut] = []
	for p in items:
		po = ProductOut(
			id=p.id,
			name=p.name,
			category=p.category,
			price=p.price,
			currency=p.currency,
			thumbnail_url=p.thumbnail_url,
			image_url=p.image_url,
			model_overlay_url=p.model_overlay_url,
			options=json.loads(p.options) if p.options else None,
			jeweler_name=p.jeweler.name if p.jeweler else None,
		)
		result.append(po)
	return result

@router.get("/{product_id}", response_model=ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
	p = db.query(models.Product).get(product_id)
	if not p:
		from fastapi import HTTPException
		raise HTTPException(status_code=404, detail="Product not found")
	return ProductOut(
		id=p.id,
		name=p.name,
		category=p.category,
		price=p.price,
		currency=p.currency,
		thumbnail_url=p.thumbnail_url,
		image_url=p.image_url,
		model_overlay_url=p.model_overlay_url,
		options=json.loads(p.options) if p.options else None,
		jeweler_name=p.jeweler.name if p.jeweler else None,
	)

