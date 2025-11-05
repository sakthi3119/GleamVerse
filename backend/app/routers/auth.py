from fastapi import APIRouter, HTTPException
from ..schemas import UserOut, UserProfileUpdate
from ..auth_clerk import require_clerk_user
from ..mongo import users_col

router = APIRouter()

@router.get("/me", response_model=UserOut)
def me(user_id: str = require_clerk_user):
	user = users_col().find_one({"_id": user_id}) or {}
	user.setdefault("_id", user_id)
	return UserOut(
		username=user_id,
		full_name=user.get("full_name"),
		country=user.get("country"),
		address_line1=user.get("address_line1"),
		address_line2=user.get("address_line2"),
		city=user.get("city"),
		state=user.get("state"),
		postal_code=user.get("postal_code"),
	)

@router.put("/profile", response_model=UserOut)
def update_profile(payload: UserProfileUpdate, user_id: str = require_clerk_user):
	update = {k: v for k, v in payload.model_dump(exclude_unset=True).items()}
	users_col().update_one({"_id": user_id}, {"$set": update}, upsert=True)
	doc = users_col().find_one({"_id": user_id})
	return UserOut(
		username=user_id,
		full_name=doc.get("full_name"),
		country=doc.get("country"),
		address_line1=doc.get("address_line1"),
		address_line2=doc.get("address_line2"),
		city=doc.get("city"),
		state=doc.get("state"),
		postal_code=doc.get("postal_code"),
	)

