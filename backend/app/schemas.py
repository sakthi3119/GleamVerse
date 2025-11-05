from pydantic import BaseModel, Field
from typing import Optional, Any

class UserCreate(BaseModel):
	username: str = Field(min_length=3, max_length=64)
	password: str = Field(min_length=6, max_length=128)
	full_name: Optional[str] = None
	country: Optional[str] = None
    
class UserProfileUpdate(BaseModel):
	full_name: Optional[str] = None
	country: Optional[str] = None
	address_line1: Optional[str] = None
	address_line2: Optional[str] = None
	city: Optional[str] = None
	state: Optional[str] = None
	postal_code: Optional[str] = None

class UserOut(BaseModel):
	username: str
	full_name: Optional[str] = None
	country: Optional[str] = None
	address_line1: Optional[str] = None
	address_line2: Optional[str] = None
	city: Optional[str] = None
	state: Optional[str] = None
	postal_code: Optional[str] = None

	class Config:
		from_attributes = True

class UserLogin(BaseModel):
	username: str
	password: str

class TokenResponse(BaseModel):
	access_token: str
	token_type: str = "bearer"
	username: str

class ProductOut(BaseModel):
	id: int
	name: str
	category: str
	price: float
	currency: str
	thumbnail_url: Optional[str]
	image_url: Optional[str]
	model_overlay_url: Optional[str]
	options: Optional[Any]
	jeweler_name: Optional[str]

	class Config:
		from_attributes = True

